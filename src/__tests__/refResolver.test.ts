/**
 * RefResolver Unit Tests
 * Tests the $ref resolution functionality with 30 comprehensive test cases
 * Uses real example OpenAPI specs from the example/ directory
 */

import { resolveRef, getRefName } from '../refResolver';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to load example specs
function loadExample(filename: string): any {
  const filePath = path.join(__dirname, '../../example', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

describe('RefResolver', () => {
  describe('resolveRef function', () => {
    let productsSpec: any;
    let blogSpec: any;
    let xpanelSpec: any;

    beforeAll(() => {
      productsSpec = loadExample('products.openapi.json');
      blogSpec = loadExample('blog.openapi.json');
      xpanelSpec = loadExample('xpanel.openapi.json');
    });

    // Test 1: Resolve simple schema reference
    it('should resolve #/components/schemas/Product from products spec', () => {
      const result = resolveRef('#/components/schemas/Product', productsSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
      expect(result.properties).toHaveProperty('id');
      expect(result.properties).toHaveProperty('name');
      expect(result.properties).toHaveProperty('price');
    });

    // Test 2: Resolve nested reference
    it('should resolve #/components/schemas/InventoryData from products spec', () => {
      const result = resolveRef('#/components/schemas/InventoryData', productsSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
      expect(result.properties).toHaveProperty('sku');
      expect(result.properties).toHaveProperty('quantity_in_stock');
    });

    // Test 3: Resolve ProductPage schema with array items
    it('should resolve #/components/schemas/ProductPage from products spec', () => {
      const result = resolveRef('#/components/schemas/ProductPage', productsSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
      expect(result.properties).toHaveProperty('items');
      expect(result.properties).toHaveProperty('total');
    });

    // Test 4: Resolve CreateProductRequest
    it('should resolve #/components/schemas/CreateProductRequest from products spec', () => {
      const result = resolveRef('#/components/schemas/CreateProductRequest', productsSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
      expect(result.required).toContain('name');
      expect(result.required).toContain('price');
    });

    // Test 5: Resolve UpdateProductRequest
    it('should resolve #/components/schemas/UpdateProductRequest from products spec', () => {
      const result = resolveRef('#/components/schemas/UpdateProductRequest', productsSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
      expect(result.properties).toHaveProperty('name');
    });

    // Test 6: Resolve BlogPost from blog spec
    it('should resolve #/components/schemas/BlogPost from blog spec', () => {
      const result = resolveRef('#/components/schemas/BlogPost', blogSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
    });

    // Test 7: Resolve CreatePostRequest from blog spec
    it('should resolve #/components/schemas/CreatePostRequest from blog spec', () => {
      const result = resolveRef('#/components/schemas/CreatePostRequest', blogSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
    });

    // Test 8: Resolve UpdatePostRequest from blog spec
    it('should resolve #/components/schemas/UpdatePostRequest from blog spec', () => {
      const result = resolveRef('#/components/schemas/UpdatePostRequest', blogSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
    });

    // Test 9: Resolve Swagger 2.0 format with definitions
    it('should resolve #/definitions/models.User from xpanel spec', () => {
      const result = resolveRef('#/definitions/models.User', xpanelSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
    });

    // Test 10: Resolve non-existent reference should return undefined
    it('should return undefined for non-existent reference', () => {
      const result = resolveRef('#/components/schemas/NonExistentSchema', productsSpec);
      expect(result).toBeUndefined();
    });

    // Test 11: Resolve invalid path (missing components) should return undefined
    it('should return undefined when path segment is missing', () => {
      const result = resolveRef('#/invalid/path/Schema', productsSpec);
      expect(result).toBeUndefined();
    });

    // Test 12: Handle empty ref string
    it('should return undefined for empty ref string', () => {
      const result = resolveRef('', productsSpec);
      expect(result).toBeUndefined();
    });

    // Test 13: Handle null spec
    it('should return undefined for null spec', () => {
      const result = resolveRef('#/components/schemas/Product', null);
      expect(result).toBeUndefined();
    });

    // Test 14: Handle undefined spec
    it('should return undefined for undefined spec', () => {
      const result = resolveRef('#/components/schemas/Product', undefined);
      expect(result).toBeUndefined();
    });

    // Test 15: Handle multiple slashes correctly
    it('should handle paths with multiple nested segments', () => {
      const result = resolveRef('#/components/schemas/Product', productsSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
    });

    // Test 16: Resolve reference starting only with # (no path)
    it('should handle reference with only # symbol', () => {
      const result = resolveRef('#', productsSpec);
      // Should return the root spec since # is just the root marker
      expect(result).toBe(productsSpec);
    });

    // Test 17: Resolve reference with trailing slash
    it('should handle reference with trailing slash', () => {
      const result = resolveRef('#/components/schemas/Product/', productsSpec);
      // Should handle empty trailing segment gracefully
      expect(result).toBeDefined();
    });

    // Test 18: Verify resolved schema structure for Product
    it('should verify Product schema has all expected properties', () => {
      const product = resolveRef('#/components/schemas/Product', productsSpec);
      expect(product.properties.id.type).toBe('string');
      expect(product.properties.name.type).toBe('string');
      expect(product.properties.price.type).toBe('number');
    });

    // Test 19: Verify InventoryData is correctly nested inside Product
    it('should verify nested reference to InventoryData', () => {
      const product = resolveRef('#/components/schemas/Product', productsSpec);
      expect(product.properties.inventory).toBeDefined();
      expect(product.properties.inventory.$ref).toBe('#/components/schemas/InventoryData');
    });

    // Test 20: Resolve the reference chain
    it('should resolve ProductPage items which reference Product', () => {
      const productPage = resolveRef('#/components/schemas/ProductPage', productsSpec);
      const items = productPage.properties.items;
      expect(items.type).toBe('array');
      expect(items.items.$ref).toBe('#/components/schemas/Product');
    });

    // Test 21: Handle case-sensitive path resolution
    it('should be case-sensitive for path segments', () => {
      const result = resolveRef('#/components/schemas/product', productsSpec);
      // Should return undefined because 'product' (lowercase) doesn't exist
      expect(result).toBeUndefined();
    });

    // Test 22: Resolve from different spec sources
    it('should correctly resolve from different OpenAPI specs independently', () => {
      const blogProduct = resolveRef('#/components/schemas/BlogPost', blogSpec);
      const ecomProduct = resolveRef('#/components/schemas/Product', productsSpec);
      expect(blogProduct).toBeDefined();
      expect(ecomProduct).toBeDefined();
      expect(blogProduct).not.toBe(ecomProduct);
    });

    // Test 23: Verify resolved schema has required field
    it('should preserve required fields in resolved schema', () => {
      const createRequest = resolveRef('#/components/schemas/CreateProductRequest', productsSpec);
      expect(createRequest.required).toBeDefined();
      expect(Array.isArray(createRequest.required)).toBe(true);
      expect(createRequest.required.length).toBeGreaterThan(0);
    });

    // Test 24: Handle very long path references
    it('should handle complex nested paths', () => {
      // Create a custom spec with deeply nested structure
      const customSpec = {
        a: {
          b: {
            c: {
              d: {
                value: 'deep',
              },
            },
          },
        },
      };
      const result = resolveRef('#/a/b/c/d', customSpec);
      expect(result.value).toBe('deep');
    });

    // Test 25: Verify swagger definitions format works
    it('should resolve swagger 2.0 definitions format', () => {
      const result = resolveRef('#/definitions/models.User', xpanelSpec);
      expect(result).toBeDefined();
      expect(result.type).toBe('object');
    });

    // Test 26: Handle ref with dots in schema names
    it('should handle schema names with dots (swagger 2.0 format)', () => {
      const result = resolveRef('#/definitions/models.User', xpanelSpec);
      expect(result).toBeDefined();
    });

    // Test 27: Return exact object reference
    it('should return the exact object reference (not a copy)', () => {
      const result1 = resolveRef('#/components/schemas/Product', productsSpec);
      const result2 = resolveRef('#/components/schemas/Product', productsSpec);
      expect(result1).toBe(result2); // Should be the same reference
    });

    // Test 28: Resolve reference with empty path segments
    it('should handle multiple consecutive slashes', () => {
      const result = resolveRef('#//components//schemas//Product', productsSpec);
      expect(result).toBeDefined();
    });

    // Test 29: Verify different schema types are resolved correctly
    it('should resolve all four product schemas correctly', () => {
      const product = resolveRef('#/components/schemas/Product', productsSpec);
      const createReq = resolveRef('#/components/schemas/CreateProductRequest', productsSpec);
      const updateReq = resolveRef('#/components/schemas/UpdateProductRequest', productsSpec);
      const inventory = resolveRef('#/components/schemas/InventoryData', productsSpec);

      expect(product.required).toContain('id');
      expect(createReq.required).toContain('name');
      expect(updateReq.required).toBeUndefined();
      expect(inventory.properties).toHaveProperty('sku');
    });

    // Test 30: Resolve with OpenAPI 3.0 components format
    it('should work with standard OpenAPI 3.0 components/schemas path', () => {
      const paths = [
        '#/components/schemas/Product',
        '#/components/schemas/CreateProductRequest',
        '#/components/schemas/UpdateProductRequest',
        '#/components/schemas/InventoryData',
        '#/components/schemas/ProductPage',
      ];

      paths.forEach((refPath) => {
        const result = resolveRef(refPath, productsSpec);
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });
    });
  });

  describe('getRefName function', () => {
    // Test 1: Extract name from simple reference
    it('should extract schema name from simple reference', () => {
      const name = getRefName('#/components/schemas/Product');
      expect(name).toBe('Product');
    });

    // Test 2: Extract name from nested reference
    it('should extract schema name from nested reference', () => {
      const name = getRefName('#/components/schemas/ProductPage');
      expect(name).toBe('ProductPage');
    });

    // Test 3: Extract name from swagger definitions
    it('should extract model name from swagger definitions', () => {
      const name = getRefName('#/definitions/models.User');
      expect(name).toBe('models.User');
    });

    // Test 4: Handle empty string
    it('should return empty string for empty input', () => {
      const name = getRefName('');
      expect(name).toBe('');
    });

    // Test 5: Handle null/undefined
    it('should return empty string for null input', () => {
      const name = getRefName(null as any);
      expect(name).toBe('');
    });

    // Test 6: Handle reference with only #
    it('should return empty string for reference with only #', () => {
      const name = getRefName('#');
      expect(name).toBe('');
    });

    // Test 7: Handle reference with trailing slash
    it('should ignore trailing slashes', () => {
      const name = getRefName('#/components/schemas/Product/');
      expect(name).toBe('Product');
    });

    // Test 8: Extract from deeply nested path
    it('should extract last segment from deeply nested path', () => {
      const name = getRefName('#/a/b/c/d/MySchema');
      expect(name).toBe('MySchema');
    });

    // Test 9: Handle multiple slashes
    it('should handle multiple consecutive slashes', () => {
      const name = getRefName('#//components//schemas//Product');
      expect(name).toBe('Product');
    });

    // Test 10: Verify consistency across multiple calls
    it('should return consistent results for multiple calls', () => {
      const ref = '#/components/schemas/Product';
      const name1 = getRefName(ref);
      const name2 = getRefName(ref);
      expect(name1).toBe(name2);
    });
  });
});
