/**
 * OpenAPI specification parser
 */

import { OpenAPISpec, ParsedEndpoint, ParsedParameter, ParsedResponse, Schema } from './types.js';

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

    Object.entries(this.spec.paths).forEach(([path, pathItem]) => {
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

      methods.forEach((method) => {
        const operation = (pathItem as any)[method];
        if (!operation) return;

        const operationId = operation.operationId || this.generateOperationId(path, method);
        const endpoint: ParsedEndpoint = {
          path,
          method: method.toUpperCase(),
          operationId,
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

    return endpoints;
  }

  private generateOperationId(path: string, method: string): string {
    const pathParts = path
      .split('/')
      .filter((p) => p && !p.startsWith('{'))
      .join('_');
    return `${method.toLowerCase()}_${pathParts || 'root'}`.replace(/[^a-zA-Z0-9_]/g, '_');
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
    if (!schema) return 'any';

    // Handle $ref references
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      return refName || 'any';
    }

    // Handle direct types
    if (schema.type === 'object') {
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

    return schema.type || 'any';
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
