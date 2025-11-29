/**
 * Ky.js HTTP client code generator
 */

import { ParsedEndpoint, GeneratorConfig } from './types.js';
import { calculateChecksum } from './checksum.js';

export class KyClientGenerator {
  private endpoints: ParsedEndpoint[];
  private config: GeneratorConfig;

  constructor(endpoints: ParsedEndpoint[], config: GeneratorConfig = {}) {
    this.endpoints = endpoints;
    this.config = {
      baseUrl: config.baseUrl || 'https://api.example.com',
      clientName: config.clientName || 'ApiClient',
      typesOnly: config.typesOnly ?? false,
      exportAsDefault: config.exportAsDefault ?? true,
      ...config,
    };
  }

  generate(): string {
    const parts: string[] = [];

    // Add banner if provided
    if (this.config.banner) {
      parts.push(this.generateBanner());
    }

    // Add checksum if provided
    if (this.config.checksumMethod && this.config.inputFilePath) {
      parts.push(this.generateChecksum());
    }

    // Add imports
    parts.push(this.generateImports());

    // Add types
    parts.push(this.generateTypes());

    // Add client class if not types-only
    if (!this.config.typesOnly) {
      parts.push(this.generateClient());
    }

    return parts.join('\n\n');
  }

  private generateBanner(): string {
    if (!this.config.banner) return '';

    const lines = this.config.banner.split('\n');
    const commentLines = lines.map(line => `// ${line}`);
    return commentLines.join('\n');
  }

  private generateChecksum(): string {
    if (!this.config.checksumMethod || !this.config.inputFilePath) return '';

    const method = this.config.checksumMethod;
    const checksum = calculateChecksum(this.config.inputFilePath, method);
    return `// Generated from OpenAPI spec with ${method.toUpperCase()} checksum: ${checksum}`;
  }

  private generateImports(): string {
    return `import ky from 'ky';\n`;
  }

  private generateTypes(): string {
    const types: string[] = [];

    // Generate request/response types for each endpoint
    this.endpoints.forEach((endpoint) => {
      const requestBodyType = endpoint.requestBody
        ? this.generateRequestBodyType(endpoint)
        : null;
      const responseType = this.generateResponseType(endpoint);
      const queryParamsType = this.generateQueryParamsType(endpoint);
      const pathParamsType = this.generatePathParamsType(endpoint);

      if (requestBodyType) types.push(requestBodyType);
      if (queryParamsType) types.push(queryParamsType);
      if (pathParamsType) types.push(pathParamsType);
      types.push(responseType);
    });

    // Add common types
    types.push(`
export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
`);

    return types.filter(Boolean).join('\n\n');
  }

  private generateRequestBodyType(endpoint: ParsedEndpoint): string {
    if (!endpoint.requestBody) return '';

    const typeName = this.getTypeName(endpoint, 'Request');
    const type = endpoint.requestBody.type;

    return `export interface ${typeName} {
  // Request body for ${endpoint.method} ${endpoint.path}
  [key: string]: any;
}`;
  }

  private generateQueryParamsType(endpoint: ParsedEndpoint): string {
    const queryParams = endpoint.parameters.filter((p) => p.in === 'query');
    if (queryParams.length === 0) return '';

    const typeName = this.getTypeName(endpoint, 'Query');
    const fields = queryParams
      .map(
        (p) =>
          `  ${p.name}${p.required ? '' : '?'}: ${p.type};${
            p.description ? ` // ${p.description}` : ''
          }`,
      )
      .join('\n');

    return `export interface ${typeName} {
${fields}
}`;
  }

  private generatePathParamsType(endpoint: ParsedEndpoint): string {
    const pathParams = endpoint.parameters.filter((p) => p.in === 'path');
    if (pathParams.length === 0) return '';

    const typeName = this.getTypeName(endpoint, 'Params');
    const fields = pathParams
      .map(
        (p) =>
          `  ${p.name}${p.required ? '' : '?'}: ${p.type};${
            p.description ? ` // ${p.description}` : ''
          }`,
      )
      .join('\n');

    return `export interface ${typeName} {
${fields}
}`;
  }

  private generateResponseType(endpoint: ParsedEndpoint): string {
    const typeName = this.getTypeName(endpoint, 'Response');
    const successResponse = endpoint.responses['200'] || endpoint.responses['201'] || Object.values(endpoint.responses)[0];
    const type = successResponse?.type || 'any';

    return `export interface ${typeName} {
  data: ${type};
  status: number;
  headers: Record<string, any>;
}`;
  }

  private generateClient(): string {
    const clientName = this.config.clientName || 'ApiClient';
    const methods = this.endpoints.map((endpoint) => this.generateMethod(endpoint)).join('\n\n');

    const exportStatement = this.config.exportAsDefault
      ? `export default ${clientName};`
      : `export { ${clientName} };`;

    // Generate checksum field if configured
    let checksumField = '';
    if (this.config.checksumMethod && this.config.inputFilePath) {
      const checksum = calculateChecksum(this.config.inputFilePath, this.config.checksumMethod);
      checksumField = `  static readonly SPEC_CHECKSUM = '${checksum}';\n`;
    }

    return `export class ${clientName} {
${checksumField}  private baseUrl: string;
  private ky: typeof ky;

  constructor(baseUrl: string = '${this.config.baseUrl}') {
    this.baseUrl = baseUrl;
    this.ky = ky.create({ prefixUrl: baseUrl });
  }

${methods}
}

${exportStatement}`;
  }

  private generateMethod(endpoint: ParsedEndpoint): string {
    const methodName = this.getCamelCaseName(endpoint.operationId);
    const queryParams = endpoint.parameters.filter((p) => p.in === 'query');
    const pathParams = endpoint.parameters.filter((p) => p.in === 'path');
    const headerParams = endpoint.parameters.filter((p) => p.in === 'header');

    // Build parameter list
    const paramParts: string[] = [];
    if (pathParams.length > 0) {
      paramParts.push(`params: ${this.getTypeName(endpoint, 'Params')}`);
    }
    if (queryParams.length > 0) {
      paramParts.push(`query?: ${this.getTypeName(endpoint, 'Query')}`);
    }
    if (endpoint.requestBody) {
      paramParts.push(`body?: ${this.getTypeName(endpoint, 'Request')}`);
    }
    paramParts.push(`options?: RequestOptions`);

    const paramSignature = paramParts.join(', ');
    const returnType = this.getTypeName(endpoint, 'Response');

    // Build method body
    const lines: string[] = [];
    lines.push(`  async ${methodName}(${paramSignature}): Promise<${returnType}> {`);

    // Build path with path parameters
    let path = endpoint.path;
    if (pathParams.length > 0) {
      pathParams.forEach((param) => {
        path = path.replace(`{${param.name}}`, `\${params.${param.name}}`);
      });
      lines.push(`    const url = \`${path}\`;`);
    } else {
      lines.push(`    const url = '${endpoint.path}';`);
    }

    // Build request options
    const requestOptions: string[] = ['...options'];
    if (queryParams.length > 0 || headerParams.length > 0) {
      requestOptions.push('searchParams: query');
    }
    if (headerParams.length > 0) {
      requestOptions.push('headers: { ...options?.headers, ...headers }');
    }

    const methodLower = endpoint.method.toLowerCase();
    const kyMethod = ['get', 'post', 'put', 'patch', 'delete'].includes(methodLower)
      ? methodLower
      : 'get';

    if (endpoint.requestBody) {
      lines.push(`    const response = await this.ky.${kyMethod}(url, {`);
      lines.push(`      json: body,`);
      requestOptions.forEach((opt) => {
        if (opt !== 'searchParams: query' && opt !== '...options') {
          lines.push(`      ${opt},`);
        }
      });
      lines.push(`      ...options,`);
      lines.push(`    }).json<any>();`);
    } else {
      lines.push(`    const response = await this.ky.${kyMethod}(url, {`);
      if (queryParams.length > 0) {
        lines.push(`      searchParams: query,`);
      }
      lines.push(`      ...options,`);
      lines.push(`    }).json<any>();`);
    }

    lines.push(`    return {`);
    lines.push(`      data: response,`);
    lines.push(`      status: 200,`);
    lines.push(`      headers: {},`);
    lines.push(`    };`);
    lines.push(`  }`);

    return lines.join('\n');
  }

  private getTypeName(endpoint: ParsedEndpoint, suffix: string): string {
    const baseName = this.toPascalCase(endpoint.operationId);
    return `${baseName}${suffix}`;
  }

  private getCamelCaseName(name: string): string {
    return name.replace(/(_[a-z])/g, (group) => group.toUpperCase().replace('_', '')).replace(/^./, (str) => str.toLowerCase());
  }

  private toPascalCase(name: string): string {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
