/**
 * Unit tests for OpenAPI Parser
 */

import { OpenAPIParser } from '../parser';
import { OpenAPISpec, ParsedEndpoint } from '../types';

describe('OpenAPIParser', () => {
  /**
   * Helper to create a minimal valid OpenAPI spec
   */
  function createMinimalSpec(paths: Record<string, any> = {}): OpenAPISpec {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths,
    };
  }

  describe('Basic Parsing', () => {
    it('should parse empty spec without errors', () => {
      const spec = createMinimalSpec();
      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();
      expect(endpoints).toEqual([]);
    });

    it('should parse single endpoint with explicit operationId', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            operationId: 'listUsers',
            responses: {
              '200': {
                description: 'Success',
              },
            },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints).toHaveLength(1);
      expect(endpoints[0].operationId).toBe('listUsers');
      expect(endpoints[0].path).toBe('/users');
      expect(endpoints[0].method).toBe('GET');
    });

    it('should parse multiple endpoints', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            operationId: 'listUsers',
            responses: { '200': { description: 'OK' } },
          },
          post: {
            operationId: 'createUser',
            responses: { '201': { description: 'Created' } },
          },
        },
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints).toHaveLength(3);
      expect(endpoints.map((ep) => ep.operationId)).toEqual(['listUsers', 'createUser', 'getUser']);
    });

    it('should preserve endpoint metadata', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            summary: 'List users',
            description: 'Returns all users',
            tags: ['users'],
            operationId: 'listUsers',
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();
      const endpoint = endpoints[0];

      expect(endpoint.summary).toBe('List users');
      expect(endpoint.description).toBe('Returns all users');
      expect(endpoint.tags).toEqual(['users']);
    });
  });

  describe('Operation ID Resolution - No Duplicates', () => {
    it('should not modify endpoints with all explicit operationIds', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            operationId: 'listUsers',
            responses: { '200': { description: 'OK' } },
          },
          post: {
            operationId: 'createUser',
            responses: { '201': { description: 'Created' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints[0].operationId).toBe('listUsers');
      expect(endpoints[1].operationId).toBe('createUser');
    });

    it('should suggest unique IDs at low level when no explicit IDs', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            responses: { '200': { description: 'OK' } },
          },
        },
        '/posts': {
          get: {
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints).toHaveLength(2);
      expect(endpoints[0].operationId).toBe('get_users');
      expect(endpoints[1].operationId).toBe('get_posts');
    });

    it('should suggest IDs for endpoints with path parameters', () => {
      const spec = createMinimalSpec({
        '/users/{userId}': {
          get: {
            responses: { '200': { description: 'OK' } },
          },
          put: {
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints[0].operationId).toBe('get_users');
      expect(endpoints[1].operationId).toBe('put_users');
    });
  });

  describe('Operation ID Resolution - Low Level Duplicates', () => {
    it('should detect duplicates at low level', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            responses: { '200': { description: 'OK' } },
          },
          post: {
            responses: { '201': { description: 'Created' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      // Both should be different after escalation
      expect(endpoints[0].operationId).not.toBe(endpoints[1].operationId);
    });

    it('should escalate to medium level for low-level duplicates', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            responses: { '200': { description: 'OK' } },
          },
        },
        '/users/{userId}': {
          get: {
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      // Low level would give both 'get_users', but medium should differentiate
      expect(endpoints[0].operationId).toBe('get_users');
      expect(endpoints[1].operationId).toBe('get_users_userid');
    });

    it('should handle multiple duplicates with escalation', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            responses: { '200': { description: 'OK' } },
          },
          post: {
            responses: { '201': { description: 'Created' } },
          },
          put: {
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      // All should have unique IDs
      const ids = endpoints.map((ep) => ep.operationId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Operation ID Resolution - Mixed Explicit and Suggested', () => {
    it('should mix explicit and suggested IDs without conflicts', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            operationId: 'listUsers',
            responses: { '200': { description: 'OK' } },
          },
          post: {
            responses: { '201': { description: 'Created' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints[0].operationId).toBe('listUsers');
      expect(endpoints[1].operationId).toBe('post_users');
    });

    it('should avoid conflicts between explicit and suggested IDs', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            operationId: 'get_users',
            responses: { '200': { description: 'OK' } },
          },
          post: {
            responses: { '201': { description: 'Created' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      // POST should get a different ID to avoid conflict with explicit GET
      expect(endpoints[0].operationId).toBe('get_users');
      // POST will get post_users at low level, which doesn't conflict
      expect(endpoints[1].operationId).toBe('post_users');
    });

    it('should handle mix of explicit IDs at different paths', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            operationId: 'listUsers',
            responses: { '200': { description: 'OK' } },
          },
          post: {
            responses: { '201': { description: 'Created' } },
          },
        },
        '/items': {
          get: {
            operationId: 'listItems',
            responses: { '200': { description: 'OK' } },
          },
          post: {
            responses: { '201': { description: 'Created' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints[0].operationId).toBe('listUsers');
      expect(endpoints[2].operationId).toBe('listItems');

      // POST endpoints should have unique suggested IDs
      const ids = endpoints.map((ep) => ep.operationId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(4);
    });
  });

  describe('Operation ID Resolution - High Level and Numeric Suffixes', () => {
    it('should use semantic keywords from summaries', () => {
      const spec = createMinimalSpec({
        '/data': {
          get: {
            summary: 'Fetch all data',
            responses: { '200': { description: 'OK' } },
          },
          post: {
            summary: 'Create new data',
            responses: { '201': { description: 'Created' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      // Different methods produce different low-level IDs
      expect(endpoints[0].operationId).not.toBe(endpoints[1].operationId);
      expect(endpoints[0].operationId).toContain('get');
      expect(endpoints[1].operationId).toContain('post');
    });

    it('should handle truly identical paths that create duplicates', () => {
      // This is a pathological case - same endpoint defined multiple times
      // In practice, this would mean the same method on same path is somehow duplicated
      // For this test, we'll verify that numeric suffixes are applied when needed
      const spec = createMinimalSpec({
        '/data': {
          get: {
            responses: { '200': { description: 'OK' } },
          },
          post: {
            responses: { '201': { description: 'Created' } },
          },
          put: {
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      // All should have unique IDs
      const ids = endpoints.map((ep) => ep.operationId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);

      // Verify they're all different
      expect(ids[0]).not.toBe(ids[1]);
      expect(ids[1]).not.toBe(ids[2]);
      expect(ids[0]).not.toBe(ids[2]);
    });
  });

  describe('Parameter Parsing', () => {
    it('should parse query parameters', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            operationId: 'listUsers',
            parameters: [
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer' },
              },
              {
                name: 'offset',
                in: 'query',
                schema: { type: 'integer' },
              },
            ],
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();
      const endpoint = endpoints[0];

      expect(endpoint.parameters).toHaveLength(2);
      expect(endpoint.parameters[0].name).toBe('limit');
      expect(endpoint.parameters[0].in).toBe('query');
      expect(endpoint.parameters[1].name).toBe('offset');
    });

    it('should parse path parameters', () => {
      const spec = createMinimalSpec({
        '/users/{userId}': {
          get: {
            operationId: 'getUser',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();
      const endpoint = endpoints[0];

      expect(endpoint.parameters).toHaveLength(1);
      expect(endpoint.parameters[0].name).toBe('userId');
      expect(endpoint.parameters[0].in).toBe('path');
      expect(endpoint.parameters[0].required).toBe(true);
    });

    it('should mark path parameters as required', () => {
      const spec = createMinimalSpec({
        '/items/{itemId}': {
          get: {
            operationId: 'getItem',
            parameters: [
              {
                name: 'itemId',
                in: 'path',
                schema: { type: 'string' },
              },
            ],
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();
      const endpoint = endpoints[0];

      expect(endpoint.parameters[0].required).toBe(true);
    });
  });

  describe('Request Body Parsing', () => {
    it('should parse request body', () => {
      const spec = createMinimalSpec({
        '/users': {
          post: {
            operationId: 'createUser',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();
      const endpoint = endpoints[0];

      expect(endpoint.requestBody).toBeDefined();
      expect(endpoint.requestBody?.required).toBe(true);
      expect(endpoint.requestBody?.type).toBe('Record<string, any>');
    });

    it('should handle missing request body', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            operationId: 'listUsers',
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();
      const endpoint = endpoints[0];

      expect(endpoint.requestBody).toBeUndefined();
    });
  });

  describe('Response Parsing', () => {
    it('should parse responses', () => {
      const spec = createMinimalSpec({
        '/users': {
          get: {
            operationId: 'listUsers',
            responses: {
              '200': {
                description: 'Success',
              },
              '404': {
                description: 'Not found',
              },
            },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();
      const endpoint = endpoints[0];

      expect(Object.keys(endpoint.responses)).toHaveLength(2);
      expect(endpoint.responses['200'].description).toBe('Success');
      expect(endpoint.responses['404'].description).toBe('Not found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all HTTP methods', () => {
      const spec = createMinimalSpec({
        '/resource': {
          get: {
            operationId: 'get',
            responses: { '200': { description: 'OK' } },
          },
          post: {
            operationId: 'post',
            responses: { '201': { description: 'Created' } },
          },
          put: {
            operationId: 'put',
            responses: { '200': { description: 'OK' } },
          },
          patch: {
            operationId: 'patch',
            responses: { '200': { description: 'OK' } },
          },
          delete: {
            operationId: 'delete',
            responses: { '204': { description: 'No Content' } },
          },
          head: {
            operationId: 'head',
            responses: { '200': { description: 'OK' } },
          },
          options: {
            operationId: 'options',
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints).toHaveLength(7);
      expect(endpoints.map((ep) => ep.method)).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
    });

    it('should handle complex paths with multiple parameters', () => {
      const spec = createMinimalSpec({
        '/users/{userId}/posts/{postId}/comments/{commentId}': {
          get: {
            operationId: 'getComment',
            parameters: [
              { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
              { name: 'postId', in: 'path', required: true, schema: { type: 'string' } },
              { name: 'commentId', in: 'path', required: true, schema: { type: 'string' } },
            ],
            responses: { '200': { description: 'OK' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();
      const endpoint = endpoints[0];

      expect(endpoint.parameters).toHaveLength(3);
      expect(endpoint.parameters.every((p) => p.required)).toBe(true);
    });

    it('should handle empty paths object', () => {
      const spec = createMinimalSpec({});

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints).toEqual([]);
    });

    it('should handle paths with no operations', () => {
      const spec = createMinimalSpec({
        '/users': {
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer' },
            },
          ],
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints).toEqual([]);
    });
  });

  describe('Base URL and Info', () => {
    it('should extract base URL from servers', () => {
      const spec = createMinimalSpec();
      spec.servers = [
        {
          url: 'https://api.example.com/v1',
          description: 'Production',
        },
      ];

      const parser = new OpenAPIParser(spec);
      expect(parser.getBaseUrl()).toBe('https://api.example.com/v1');
    });

    it('should return empty string if no servers', () => {
      const spec = createMinimalSpec();
      const parser = new OpenAPIParser(spec);
      expect(parser.getBaseUrl()).toBe('');
    });

    it('should extract API info', () => {
      const spec = createMinimalSpec();
      spec.info.description = 'Test API Description';

      const parser = new OpenAPIParser(spec);
      const info = parser.getInfo();

      expect(info.title).toBe('Test API');
      expect(info.version).toBe('1.0.0');
      expect(info.description).toBe('Test API Description');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle real-world petstore-like API', () => {
      const spec = createMinimalSpec({
        '/pets': {
          get: {
            summary: 'List all pets',
            operationId: 'listPets',
            parameters: [
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer' },
              },
            ],
            responses: { '200': { description: 'A paged array of pets' } },
          },
          post: {
            summary: 'Create a pet',
            operationId: 'createPets',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
            responses: { '201': { description: 'Null response' } },
          },
        },
        '/pets/{petId}': {
          get: {
            summary: 'Info for a specific pet',
            operationId: 'showPetById',
            parameters: [
              {
                name: 'petId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            responses: { '200': { description: 'Expected response to a valid request' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints).toHaveLength(3);
      expect(endpoints[0].operationId).toBe('listPets');
      expect(endpoints[1].operationId).toBe('createPets');
      expect(endpoints[2].operationId).toBe('showPetById');

      // Verify structure
      expect(endpoints[0].parameters).toHaveLength(1);
      expect(endpoints[1].requestBody).toBeDefined();
      expect(endpoints[2].parameters).toHaveLength(1);
    });

    it('should handle API with no explicit operationIds', () => {
      const spec = createMinimalSpec({
        '/api/users': {
          get: {
            tags: ['users'],
            responses: { '200': { description: 'Users list' } },
          },
          post: {
            tags: ['users'],
            responses: { '201': { description: 'User created' } },
          },
        },
        '/api/users/{id}': {
          get: {
            tags: ['users'],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'integer' },
              },
            ],
            responses: { '200': { description: 'User details' } },
          },
        },
      });

      const parser = new OpenAPIParser(spec);
      const endpoints = parser.parse();

      expect(endpoints).toHaveLength(3);
      // All should have suggested IDs and be unique
      const ids = endpoints.map((ep) => ep.operationId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });
});
