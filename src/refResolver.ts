/**
 * Ref Resolution Utility
 * Resolves OpenAPI $ref references by traversing the JSON path
 */

/**
 * Resolves a $ref reference path to the actual object in the OpenAPI spec
 *
 * @param refPath - The $ref path string (e.g., "#/components/schemas/Pet")
 * @param spec - The OpenAPI specification object
 * @returns The resolved schema object, or undefined if not found
 *
 * @example
 * const pet = resolveRef("#/components/schemas/Pet", spec);
 * const inventoryData = resolveRef("#/components/schemas/InventoryData", spec);
 */
export function resolveRef(refPath: string, spec: any): any {
  if (!refPath || !spec) {
    return undefined;
  }

  // Split the reference path by '/'
  const pathSegments = refPath.split('/');

  // Start with the spec as the current object
  let current = spec;

  // Traverse the path using a for-loop
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];

    // Skip empty segments and the '#' root marker
    if (segment === '' || segment === '#') {
      continue;
    }

    // Try to access the segment as a key in the current object
    if (current === null || current === undefined || typeof current !== 'object') {
      // Cannot traverse further
      return undefined;
    }

    current = current[segment];

    // If we can't find this segment, the ref is invalid
    if (current === undefined) {
      return undefined;
    }
  }

  return current;
}

/**
 * Resolves a $ref and extracts just the name of the schema
 *
 * @param refPath - The $ref path string (e.g., "#/components/schemas/Pet")
 * @returns The last segment of the path (schema name), or empty string if invalid
 *
 * @example
 * const name = getRefName("#/components/schemas/Pet"); // "Pet"
 */
export function getRefName(refPath: string): string {
  if (!refPath) {
    return '';
  }

  const pathSegments = refPath.split('/').filter(s => s && s !== '#');
  return pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
}
