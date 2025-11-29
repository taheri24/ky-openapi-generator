/**
 * OpenAPI specification types and interfaces
 */

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: {
    url: string;
    description?: string;
  }[];
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, Schema>;
    parameters?: Record<string, Parameter>;
  };
}

export interface PathItem {
  parameters?: Parameter[];
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
  head?: Operation;
  options?: Operation;
  trace?: Operation;
}

export interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
}

export interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  schema?: Schema;
  description?: string;
}

export interface RequestBody {
  required?: boolean;
  content: Record<string, MediaType>;
}

export interface MediaType {
  schema?: Schema;
}

export interface Response {
  description: string;
  content?: Record<string, MediaType>;
}

export interface Schema {
  type?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  enum?: (string | number | boolean)[];
  $ref?: string;
  description?: string;
  default?: any;
}

/**
 * Internal representation of a parsed endpoint
 */
export interface ParsedEndpoint {
  path: string;
  method: string;
  operationId: string;
  summary?: string;
  description?: string;
  parameters: ParsedParameter[];
  requestBody?: ParsedRequestBody;
  responses: Record<string, ParsedResponse>;
  tags?: string[];
}

export interface ParsedParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required: boolean;
  type: string;
  description?: string;
}

export interface ParsedRequestBody {
  required: boolean;
  type: string;
}

export interface ParsedResponse {
  status: string;
  type?: string;
  description: string;
}

/**
 * Generator configuration
 */
export interface GeneratorConfig {
  baseUrl?: string;
  clientName?: string;
  typesOnly?: boolean;
  exportAsDefault?: boolean;
  banner?: string;
  checksumMethod?: 'crc32' | 'md5' | 'sha1' | 'sha256';
  inputFilePath?: string;
}
