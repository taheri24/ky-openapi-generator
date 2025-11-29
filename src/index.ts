/**
 * Ky OpenAPI Generator - Main exports
 */

export { OpenAPIParser } from './parser';
export { KyClientGenerator } from './generator';
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
} from './types';

import { OpenAPIParser } from './parser';
import { KyClientGenerator } from './generator';
import { OpenAPISpec, GeneratorConfig } from './types';
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
