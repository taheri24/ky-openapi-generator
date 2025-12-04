/**
 * OpenAPI specification parser
 */

import { OpenAPISpec, ParsedEndpoint, ParsedParameter, ParsedResponse, Schema } from './types';
import { suggestOperationID, SuggestionVerbosityLevel } from './operationIdSuggester';

export class OpenAPIParser {
  private spec: OpenAPISpec;
  private schemas: Map<string, Schema> = new Map();

  constructor(spec: OpenAPISpec) {
    this.spec = spec;
    this.loadSchemas();
  }

  private loadSchemas(): void {
    if (this.spec.components?.schemas) {
      Object.entries(this.spec.components.schemas).forEach(([name, schema]) => {
        this.schemas.set(name, schema);
      });
    }
  }

  parse(): ParsedEndpoint[] {
    const endpoints: ParsedEndpoint[] = [];

    // First pass: collect all endpoints with their metadata
    Object.entries(this.spec.paths).forEach(([path, pathItem]) => {
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

      methods.forEach((method) => {
        const operation = (pathItem as any)[method];
        if (!operation) return;

        const endpoint: ParsedEndpoint = {
          path,
          method: method.toUpperCase(),
          operationId: operation.operationId || '',
          summary: operation.summary,
          description: operation.description,
          parameters: this.parseParameters(path, operation.parameters || [], pathItem.parameters || []),
          requestBody: operation.requestBody ? this.parseRequestBody(operation.requestBody) : undefined,
          responses: this.parseResponses(operation.responses),
          tags: operation.tags,
        };

        endpoints.push(endpoint);
      });
    });

    // Second pass: resolve operation IDs level by level with duplicate detection
    this.resolveOperationIds(endpoints);

    return endpoints;
  }

  /**
   * Resolves operation IDs for all endpoints, escalating verbosity level if duplicates are detected
   * @param endpoints - All parsed endpoints to resolve IDs for
   */
  private resolveOperationIds(endpoints: ParsedEndpoint[]): void {
    // Separate endpoints with explicit operationIds from those needing suggestion
    let needingSuggestion = endpoints.filter((ep) => !ep.operationId);
    const withExplicitIds = endpoints.filter((ep) => ep.operationId);

    if (needingSuggestion.length === 0) {
      return; // All endpoints have explicit IDs
    }

    // Try each verbosity level until all suggested endpoints have unique IDs
    const verbosityLevels: SuggestionVerbosityLevel[] = ['low', 'medium', 'high'];

    for (const level of verbosityLevels) {
      // Suggest IDs for all endpoints needing suggestion at this level
      needingSuggestion.forEach((endpoint) => {
        // Clear operationId before calling suggestOperationID
        endpoint.operationId = '';
        endpoint.operationId = suggestOperationID(endpoint, level);
      });

      // Check for duplicates among suggested IDs and explicit IDs
      const suggestedIds = needingSuggestion.map((ep) => ep.operationId);
      const allIds = [
        ...withExplicitIds.map((ep) => ep.operationId),
        ...suggestedIds,
      ];

      const duplicates = this.findDuplicates(allIds);

      // If no duplicates, we're done
      if (duplicates.size === 0) {
        return;
      }

      // If this is the last level and we still have duplicates, we need to handle them
      if (level === 'high') {
        // Append a numeric suffix to duplicates to make them unique
        this.resolveRemainingDuplicates(endpoints, duplicates);
        return;
      }

      // Separate endpoints with duplicates from those that are resolved
      const resolvedEndpoints: ParsedEndpoint[] = [];
      const stillDuplicateEndpoints: ParsedEndpoint[] = [];

      needingSuggestion.forEach((ep) => {
        if (duplicates.has(ep.operationId)) {
          stillDuplicateEndpoints.push(ep);
        } else {
          resolvedEndpoints.push(ep);
        }
      });

      // Move resolved endpoints to the explicit IDs list
      withExplicitIds.push(...resolvedEndpoints);

      if (stillDuplicateEndpoints.length === 0) {
        return; // All resolved
      }

      // Continue with only the endpoints that still have duplicates
      needingSuggestion = stillDuplicateEndpoints;
    }
  }

  /**
   * Finds duplicate values in an array
   * @param values - Array of values to check
   * @returns Set of duplicate values
   */
  private findDuplicates(values: string[]): Set<string> {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    values.forEach((value) => {
      if (seen.has(value)) {
        duplicates.add(value);
      } else {
        seen.add(value);
      }
    });

    return duplicates;
  }

  /**
   * Resolves remaining duplicates by appending numeric suffixes
   * @param endpoints - All endpoints
   * @param duplicates - Set of duplicate operation IDs
   */
  private resolveRemainingDuplicates(endpoints: ParsedEndpoint[], duplicates: Set<string>): void {
    const idCounter: Record<string, number> = {};

    endpoints.forEach((endpoint) => {
      if (duplicates.has(endpoint.operationId)) {
        const baseId = endpoint.operationId;
        if (!idCounter[baseId]) {
          idCounter[baseId] = 1;
        }
        endpoint.operationId = `${baseId}_${idCounter[baseId]}`;
        idCounter[baseId]++;
      }
    });
  }

  private parseParameters(path: string, operationParams: any[], pathParams: any[]): ParsedParameter[] {
    const allParams = [...operationParams, ...pathParams];
    const pathVariables = new Set<string>();

    // Extract path variables
    const pathVarMatches = path.match(/{([^}]+)}/g) || [];
    pathVarMatches.forEach((match) => {
      pathVariables.add(match.replace(/[{}]/g, ''));
    });

    return allParams.map((param) => ({
      name: param.name,
      in: param.in,
      required: param.required ?? pathVariables.has(param.name),
      type: this.resolveSchemaType(param.schema),
      description: param.description,
    }));
  }

  private parseRequestBody(requestBody: any): { required: boolean; type: string } | undefined {
    if (!requestBody.content) return undefined;

    const jsonContent = requestBody.content['application/json'];
    if (!jsonContent) {
      return {
        required: requestBody.required ?? false,
        type: 'any',
      };
    }

    const type = this.resolveSchemaType(jsonContent.schema);
    return {
      required: requestBody.required ?? false,
      type,
    };
  }

  private parseResponses(responses: Record<string, any>): Record<string, ParsedResponse> {
    const parsed: Record<string, ParsedResponse> = {};

    Object.entries(responses).forEach(([status, response]) => {
      const jsonContent = response.content?.['application/json'];
      const type = jsonContent ? this.resolveSchemaType(jsonContent.schema) : undefined;

      parsed[status] = {
        status,
        type,
        description: response.description || '',
      };
    });

    return parsed;
  }

  private resolveSchemaType(schema?: any): string {
    if (!schema) return 'void';

    // Handle $ref references
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      return refName || 'void';
    }

    // Handle direct types
    if (schema.type === 'object') {
      // Try to parse object properties if available
      if (schema.properties && Object.keys(schema.properties).length > 0) {
        // Return a reference that indicates this is an object type
        // The caller should generate a proper interface for this
        return this.generateObjectType(schema);
      }
      // For generic objects without specific properties, use Record<string, any>
      return 'Record<string, any>';
    }

    if (schema.type === 'array') {
      const itemType = this.resolveSchemaType(schema.items);
      return `${itemType}[]`;
    }

    if (schema.type === 'string') {
      if (schema.enum) {
        return schema.enum.map((e: any) => `'${e}'`).join(' | ');
      }
      return 'string';
    }

    if (schema.type === 'number' || schema.type === 'integer') {
      return 'number';
    }

    if (schema.type === 'boolean') {
      return 'boolean';
    }

    return schema.type || 'void';
  }

  private generateObjectType(schema: any): string {
    if (!schema.properties) {
      return 'Record<string, any>';
    }

    const props = Object.entries(schema.properties)
      .map(([name, prop]: [string, any]) => {
        const required = schema.required?.includes(name);
        const type = this.resolveSchemaType(prop);
        return `  ${name}${required ? '' : '?'}: ${type};`;
      })
      .join('\n');

    return `{\n${props}\n}`;
  }

  getBaseUrl(): string {
    if (this.spec.servers && this.spec.servers.length > 0) {
      return this.spec.servers[0].url;
    }
    return '';
  }

  getInfo(): { title: string; version: string; description?: string } {
    return this.spec.info;
  }
}
