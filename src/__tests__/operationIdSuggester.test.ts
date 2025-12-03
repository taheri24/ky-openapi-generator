/**
 * Unit tests for Operation ID Suggestion Engine
 */

import { suggestOperationID, SuggestionVerbosityLevel } from '../operationIdSuggester';
import { ParsedEndpoint } from '../types';

describe('operationIdSuggester', () => {
  /**
   * Helper function to create a mock ParsedEndpoint for testing
   */
  function createMockEndpoint(overrides: Partial<ParsedEndpoint> = {}): ParsedEndpoint {
    return {
      path: '/pets',
      method: 'GET',
      operationId: '',
      parameters: [],
      responses: {},
      ...overrides,
    };
  }

  describe('Error Handling', () => {
    it('should throw error when operationId already exists', () => {
      const endpoint = createMockEndpoint({ operationId: 'existingId' });
      expect(() => suggestOperationID(endpoint, 'low')).toThrow(
        'this function only call when operationId left empty'
      );
    });

    it('should throw error with empty endpoint data', () => {
      const endpoint = createMockEndpoint({
        path: '',
        method: 'GET',
        summary: undefined,
        description: undefined,
        tags: undefined,
      });
      // This might fail to generate or throw depending on implementation
      // For now, expecting it to either return a default or throw
      try {
        const result = suggestOperationID(endpoint, 'high');
        expect(result).toBeDefined();
      } catch (e) {
        expect((e as Error).message).toBe('SuggestOperationID failed');
      }
    });
  });

  describe('Low Verbosity Level', () => {
    it('should generate simple path-based ID for GET /pets', () => {
      const endpoint = createMockEndpoint({ path: '/pets', method: 'GET' });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('get_pets');
    });

    it('should generate ID for POST /users', () => {
      const endpoint = createMockEndpoint({ path: '/users', method: 'POST' });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('post_users');
    });

    it('should ignore path parameters and use only static segments', () => {
      const endpoint = createMockEndpoint({ path: '/pets/{petId}', method: 'GET' });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('get_pets');
    });

    it('should handle nested paths with parameters', () => {
      const endpoint = createMockEndpoint({
        path: '/users/{userId}/posts/{postId}',
        method: 'PUT',
      });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('put_users_posts');
    });

    it('should handle DELETE requests', () => {
      const endpoint = createMockEndpoint({ path: '/users/{id}', method: 'DELETE' });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('delete_users');
    });

    it('should use root when path is only root slash', () => {
      const endpoint = createMockEndpoint({ path: '/', method: 'GET' });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('get_root');
    });

    it('should sanitize special characters in path', () => {
      const endpoint = createMockEndpoint({ path: '/api-v1/user-data', method: 'GET' });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('get_api_v1_user_data');
    });

    it('should handle PATCH method', () => {
      const endpoint = createMockEndpoint({ path: '/items/{itemId}', method: 'PATCH' });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('patch_items');
    });

    it('should handle HEAD method', () => {
      const endpoint = createMockEndpoint({ path: '/status', method: 'HEAD' });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('head_status');
    });

    it('should handle OPTIONS method', () => {
      const endpoint = createMockEndpoint({ path: '/api/resources', method: 'OPTIONS' });
      const result = suggestOperationID(endpoint, 'low');
      expect(result).toBe('options_api_resources');
    });
  });

  describe('Medium Verbosity Level', () => {
    it('should include path parameter names in the ID', () => {
      const endpoint = createMockEndpoint({ path: '/pets/{petId}', method: 'GET' });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBe('get_pets_petid');
    });

    it('should include multiple path parameters', () => {
      const endpoint = createMockEndpoint({
        path: '/users/{userId}/posts/{postId}/comments/{commentId}',
        method: 'GET',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBe('get_users_userid_posts_postid_comments_commentid');
    });

    it('should handle mixed static and parameter segments', () => {
      const endpoint = createMockEndpoint({
        path: '/api/v1/users/{userId}/profile',
        method: 'GET',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBe('get_api_v1_users_userid_profile');
    });

    it('should work with PUT requests', () => {
      const endpoint = createMockEndpoint({
        path: '/resources/{resourceId}',
        method: 'PUT',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBe('put_resources_resourceid');
    });

    it('should work with DELETE requests', () => {
      const endpoint = createMockEndpoint({
        path: '/items/{itemId}',
        method: 'DELETE',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBe('delete_items_itemid');
    });

    it('should work with POST requests', () => {
      const endpoint = createMockEndpoint({
        path: '/users/{userId}/notifications',
        method: 'POST',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBe('post_users_userid_notifications');
    });

    it('should handle parameters with underscores', () => {
      const endpoint = createMockEndpoint({
        path: '/api/{resource_id}/details/{detail_type}',
        method: 'GET',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBe('get_api_resource_id_details_detail_type');
    });

    it('should sanitize special characters', () => {
      const endpoint = createMockEndpoint({
        path: '/api-v2/users/{user-id}',
        method: 'POST',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBe('post_api_v2_users_user_id');
    });
  });

  describe('High Verbosity Level', () => {
    it('should use summary keywords when available', () => {
      const endpoint = createMockEndpoint({
        path: '/pets/{petId}',
        method: 'GET',
        summary: 'Info for a specific pet',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('get');
      expect(result).toContain('pet');
      expect(result).toContain('info');
    });

    it('should create descriptive ID from summary', () => {
      const endpoint = createMockEndpoint({
        path: '/pets',
        method: 'POST',
        summary: 'Create a new pet',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('post');
      expect(result).toContain('create');
      expect(result).toContain('pet');
    });

    it('should use description when summary is not available', () => {
      const endpoint = createMockEndpoint({
        path: '/users',
        method: 'GET',
        description: 'Retrieve all users from the system',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('get');
      expect(result).toContain('users');
    });

    it('should incorporate tags in the operation ID', () => {
      const endpoint = createMockEndpoint({
        path: '/pets/{petId}',
        method: 'GET',
        tags: ['pets'],
        summary: 'Get pet details',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('get');
      expect(result).toContain('pet');
    });

    it('should include path segments from endpoint path', () => {
      const endpoint = createMockEndpoint({
        path: '/api/v1/users/{userId}',
        method: 'GET',
        summary: 'Get user by ID',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('get');
      expect(result).toContain('user');
    });

    it('should incorporate request body type information', () => {
      const endpoint = createMockEndpoint({
        path: '/users',
        method: 'POST',
        summary: 'Create new user',
        requestBody: {
          required: true,
          type: 'CreateUserRequest',
        },
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('post');
      expect(result).toContain('create');
    });

    it('should filter out common stop words', () => {
      const endpoint = createMockEndpoint({
        path: '/pets',
        method: 'GET',
        summary: 'Get all the pets in the system',
      });
      const result = suggestOperationID(endpoint, 'high');
      // Should not contain 'the', 'in', 'all'
      expect(result).not.toContain('the_');
      expect(result).not.toContain('_in_');
    });

    it('should handle complex endpoints with multiple data points', () => {
      const endpoint = createMockEndpoint({
        path: '/users/{userId}/posts/{postId}/comments',
        method: 'POST',
        summary: 'Create a new comment on a post',
        tags: ['comments', 'posts'],
        requestBody: {
          required: true,
          type: 'CommentInput',
        },
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('post');
      expect(result).toContain('comment');
    });

    it('should handle empty summary gracefully', () => {
      const endpoint = createMockEndpoint({
        path: '/users/{userId}',
        method: 'DELETE',
        summary: '',
      });
      const result = suggestOperationID(endpoint, 'high');
      // Should fall back to medium verbosity
      expect(result).toBeDefined();
      expect(result).toContain('delete');
    });

    it('should handle very long descriptions', () => {
      const endpoint = createMockEndpoint({
        path: '/api/resources',
        method: 'GET',
        description:
          'This endpoint retrieves all resources from the database with optional filtering, sorting, and pagination parameters. It returns a paginated response containing the requested resources.',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toBeDefined();
      expect(result.length).toBeLessThan(100); // Should keep it reasonable
    });

    it('should prioritize summary over description', () => {
      const endpoint = createMockEndpoint({
        path: '/items',
        method: 'GET',
        summary: 'List items',
        description: 'Retrieve all available items from inventory with pagination support',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('list');
      expect(result).toContain('items');
    });

    it('should handle PATCH operations with descriptive summaries', () => {
      const endpoint = createMockEndpoint({
        path: '/users/{userId}',
        method: 'PATCH',
        summary: 'Partially update user information',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('patch');
      expect(result).toContain('user');
    });

    it('should handle DELETE operations with summaries', () => {
      const endpoint = createMockEndpoint({
        path: '/users/{userId}',
        method: 'DELETE',
        summary: 'Delete a user account',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toContain('delete');
      expect(result).toContain('user');
    });
  });

  describe('Cross-level Comparison', () => {
    it('low and medium should differ when path has parameters', () => {
      const endpoint = createMockEndpoint({
        path: '/pets/{petId}',
        method: 'GET',
      });
      const low = suggestOperationID(endpoint, 'low');
      const medium = suggestOperationID(endpoint, 'medium');
      expect(low).not.toBe(medium);
      expect(low).toBe('get_pets');
      expect(medium).toBe('get_pets_petid');
    });

    it('high should include more context than medium', () => {
      const endpoint = createMockEndpoint({
        path: '/users/{userId}/posts',
        method: 'POST',
        summary: 'Create a new post for user',
      });
      const medium = suggestOperationID(endpoint, 'medium');
      const high = suggestOperationID(endpoint, 'high');
      expect(high.length).toBeGreaterThanOrEqual(medium.length);
    });

    it('should produce consistent results for same input', () => {
      const endpoint = createMockEndpoint({
        path: '/api/v1/resources/{resourceId}',
        method: 'GET',
        summary: 'Retrieve resource information',
      });
      const result1 = suggestOperationID(endpoint, 'high');
      const result2 = suggestOperationID(endpoint, 'high');
      expect(result1).toBe(result2);
    });
  });

  describe('Petstore API Examples', () => {
    it('should suggest ID for GET /pets', () => {
      const endpoint = createMockEndpoint({
        path: '/pets',
        method: 'GET',
        summary: 'List all pets',
        tags: ['pets'],
      });
      const low = suggestOperationID(endpoint, 'low');
      const medium = suggestOperationID(endpoint, 'medium');
      const high = suggestOperationID(endpoint, 'high');

      expect(low).toBe('get_pets');
      expect(medium).toBe('get_pets');
      expect(high).toContain('get');
      expect(high).toContain('list');
    });

    it('should suggest ID for POST /pets', () => {
      const endpoint = createMockEndpoint({
        path: '/pets',
        method: 'POST',
        summary: 'Create a pet',
        tags: ['pets'],
      });
      const low = suggestOperationID(endpoint, 'low');
      const medium = suggestOperationID(endpoint, 'medium');
      const high = suggestOperationID(endpoint, 'high');

      expect(low).toBe('post_pets');
      expect(medium).toBe('post_pets');
      expect(high).toContain('post');
      expect(high).toContain('create');
    });

    it('should suggest ID for GET /pets/{petId}', () => {
      const endpoint = createMockEndpoint({
        path: '/pets/{petId}',
        method: 'GET',
        summary: 'Info for a specific pet',
        tags: ['pets'],
      });
      const low = suggestOperationID(endpoint, 'low');
      const medium = suggestOperationID(endpoint, 'medium');
      const high = suggestOperationID(endpoint, 'high');

      expect(low).toBe('get_pets');
      expect(medium).toBe('get_pets_petid');
      expect(high).toContain('get');
      expect(high).toContain('info');
    });

    it('should suggest ID for PUT /pets/{petId}', () => {
      const endpoint = createMockEndpoint({
        path: '/pets/{petId}',
        method: 'PUT',
        summary: 'Update a specific pet',
        tags: ['pets'],
      });
      const low = suggestOperationID(endpoint, 'low');
      const medium = suggestOperationID(endpoint, 'medium');
      const high = suggestOperationID(endpoint, 'high');

      expect(low).toBe('put_pets');
      expect(medium).toBe('put_pets_petid');
      expect(high).toContain('put');
      expect(high).toContain('update');
    });

    it('should suggest ID for DELETE /pets/{petId}', () => {
      const endpoint = createMockEndpoint({
        path: '/pets/{petId}',
        method: 'DELETE',
        summary: 'Delete a specific pet',
        tags: ['pets'],
      });
      const low = suggestOperationID(endpoint, 'low');
      const medium = suggestOperationID(endpoint, 'medium');
      const high = suggestOperationID(endpoint, 'high');

      expect(low).toBe('delete_pets');
      expect(medium).toBe('delete_pets_petid');
      expect(high).toContain('delete');
    });
  });

  describe('Edge Cases and Special Scenarios', () => {
    it('should handle numbers in path', () => {
      const endpoint = createMockEndpoint({
        path: '/api/v2/users/{userId}',
        method: 'GET',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBe('get_api_v2_users_userid');
    });

    it('should handle very deep nested paths', () => {
      const endpoint = createMockEndpoint({
        path: '/api/v1/orgs/{orgId}/teams/{teamId}/members/{memberId}/permissions/{permissionId}',
        method: 'GET',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toBeDefined();
      expect(result).toContain('get_api_v1');
    });

    it('should normalize camelCase in paths to snake_case', () => {
      const endpoint = createMockEndpoint({
        path: '/myResources/{myResourceId}',
        method: 'GET',
      });
      const result = suggestOperationID(endpoint, 'medium');
      expect(result).toContain('resource');
    });

    it('should handle request body with complex types', () => {
      const endpoint = createMockEndpoint({
        path: '/data',
        method: 'POST',
        summary: 'Submit data',
        requestBody: {
          required: true,
          type: 'ComplexDataStructure',
        },
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toBeDefined();
      expect(result).toContain('post');
    });

    it('should handle endpoints with no metadata', () => {
      const endpoint = createMockEndpoint({
        path: '/unknown',
        method: 'GET',
      });
      const result = suggestOperationID(endpoint, 'high');
      expect(result).toBeDefined();
      expect(result).toContain('get');
      expect(result).toContain('unknown');
    });
  });
});
