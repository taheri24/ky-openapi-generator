/**
 * Ky OpenAPI Generator - Main exports
 */

export { OpenAPIParser } from './parser.js';
export { KyClientGenerator } from './generator.js';
export type {
  OpenAPISpec,
  PathItem,
  Operation,
  Parameter,
  RequestBody,
  Response,
  Schema,
  ParsedEndpoint,
  ParsedParameter,
  ParsedRequestBody,
  ParsedResponse,
  GeneratorConfig,
} from './types.js';

import { OpenAPIParser } from './parser.js';
import { KyClientGenerator } from './generator.js';
import { OpenAPISpec, GeneratorConfig } from './types.js';
import * as fs from 'fs';

/**
 * Generate Ky HTTP client from OpenAPI specification
 */
export function generateKyClient(
  specPath: string,
  config?: GeneratorConfig,
): string {
  const specContent = fs.readFileSync(specPath, 'utf-8');
  const spec: OpenAPISpec = JSON.parse(specContent);

  const parser = new OpenAPIParser(spec);
  const endpoints = parser.parse();

  const baseUrl = config?.baseUrl || parser.getBaseUrl();
  const generator = new KyClientGenerator(endpoints, {
    ...config,
    baseUrl,
    inputFilePath: config?.inputFilePath || specPath,
  });

  return generator.generate();
}
