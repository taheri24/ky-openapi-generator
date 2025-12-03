/**
 * Operation ID Suggestion Engine
 * Generates meaningful method names for API endpoints based on OpenAPI metadata
 */

import { ParsedEndpoint } from './types';

export type SuggestionVerbosityLevel = 'low' | 'medium' | 'high';

/**
 * Suggests an operation ID for an endpoint based on verbosity level
 * @param endpoint - The parsed endpoint (must not have an existing operationId)
 * @param level - Verbosity level: 'low' (path-based), 'medium' (with parameters), 'high' (with descriptions)
 * @returns A valid operation ID following camelCase convention (converted to snake_case for consistency)
 * @throws Error if operationId already exists on the endpoint
 */
export function suggestOperationID(endpoint: ParsedEndpoint, level: SuggestionVerbosityLevel): string {
  if (endpoint.operationId) {
    throw new Error('this function only call when operationId left empty');
  }

  let opID = '';

  switch (level) {
    case 'low':
      opID = generateLowVerbosity(endpoint);
      break;
    case 'medium':
      opID = generateMediumVerbosity(endpoint);
      break;
    case 'high':
      opID = generateHighVerbosity(endpoint);
      break;
  }

  if (!opID) {
    throw new Error('SuggestOperationID failed');
  }

  return opID;
}

/**
 * Low verbosity: method + path parts only
 * Example: GET /pets -> get_pets
 * Example: POST /pets/{id} -> post_pets_id (ignores parameters)
 */
function generateLowVerbosity(endpoint: ParsedEndpoint): string {
  const pathParts = endpoint.path
    .split('/')
    .filter((p) => p && !p.startsWith('{'))
    .join('_');
  return `${endpoint.method.toLowerCase()}_${pathParts || 'root'}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Medium verbosity: method + path + path parameter names
 * Adds path parameter names to provide context about what the endpoint operates on
 * Example: GET /pets/{petId} -> get_pets_petid
 * Example: PUT /users/{userId}/posts/{postId} -> put_users_userid_posts_postid
 */
function generateMediumVerbosity(endpoint: ParsedEndpoint): string {
  const pathComponents: string[] = [];
  const pathParts = endpoint.path.split('/').filter(Boolean);

  pathParts.forEach((part) => {
    if (part.startsWith('{') && part.endsWith('}')) {
      // Extract parameter name from {paramName}
      const paramName = part.slice(1, -1);
      pathComponents.push(paramName.toLowerCase());
    } else {
      // Regular path segment
      pathComponents.push(part.toLowerCase());
    }
  });

  const pathSegment = pathComponents.join('_') || 'root';
  return `${endpoint.method.toLowerCase()}_${pathSegment}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * High verbosity: method + path + parameters + semantic keywords
 * Extracts meaningful keywords from operation summary, description, tags, and request body
 * to create more descriptive and context-aware operation IDs
 * Example: GET /pets/{petId} with summary "Info for a specific pet" -> get_pet_info
 * Example: POST /users with summary "Create a new user" -> post_create_user
 */
function generateHighVerbosity(endpoint: ParsedEndpoint): string {
  const components: string[] = [];

  // Add HTTP method
  components.push(endpoint.method.toLowerCase());

  // Extract keywords from summary
  if (endpoint.summary) {
    const summaryKeywords = extractKeywords(endpoint.summary, 3);
    components.push(...summaryKeywords);
  }

  // Extract keywords from description
  if (!endpoint.summary && endpoint.description) {
    const descKeywords = extractKeywords(endpoint.description, 2);
    components.push(...descKeywords);
  }

  // Extract keywords from tags (useful for categorization)
  if (endpoint.tags && endpoint.tags.length > 0) {
    components.push(...endpoint.tags.slice(0, 1));
  }

  // Add path segments (excluding parameter placeholders)
  const pathSegments = endpoint.path
    .split('/')
    .filter((p) => p && !p.startsWith('{'));

  if (pathSegments.length > 0) {
    components.push(...pathSegments.slice(-2)); // Take last 2 segments to keep it concise
  }

  // Extract keywords from request body properties
  if (endpoint.requestBody && endpoint.requestBody.type && endpoint.requestBody.type !== 'any') {
    const bodyKeyword = camelToSnake(endpoint.requestBody.type);
    if (!components.includes(bodyKeyword)) {
      components.push(bodyKeyword);
    }
  }

  // If we still don't have meaningful components, fall back to medium verbosity
  if (components.length === 1) {
    return generateMediumVerbosity(endpoint);
  }

  // Join components and sanitize
  return components.join('_').toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Extracts meaningful keywords from text
 * Filters out common stop words and extracts the most relevant terms
 * @param text - The text to extract keywords from
 * @param limit - Maximum number of keywords to extract
 * @returns Array of extracted keywords
 */
function extractKeywords(text: string, limit: number): string[] {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'has', 'he', 'in',
    'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'will', 'with', 'you',
    'this', 'which', 'who', 'if', 'all', 'each', 'one', 'both', 'so', 'such', 'can', 'should',
    'could', 'would', 'may', 'might', 'must', 'any', 'about', 'get', 'set', 'have', 'do',
    'does', 'did', 'been', 'being', 'specific', 'the', 'new', 'some', 'when', 'where', 'why',
  ]);

  // Split by spaces and punctuation, convert to lowercase
  const words = text
    .toLowerCase()
    .split(/[\s\-_.()[\]{},!?;:'"\/]+/)
    .filter((word) => word.length > 1 && !stopWords.has(word))
    .slice(0, limit);

  return words;
}

/**
 * Converts camelCase or PascalCase to snake_case
 * @param str - The string to convert
 * @returns The converted snake_case string
 */
function camelToSnake(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Sanitizes operation ID to ensure it's a valid identifier
 * Removes invalid characters and ensures it starts with a letter
 * @param opID - The operation ID to sanitize
 * @returns The sanitized operation ID
 */
function sanitizeOperationID(opID: string): string {
  // Remove leading numbers or underscores
  let sanitized = opID.replace(/^[^a-zA-Z]+/, '');

  // Replace invalid characters with underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '_');

  // Remove consecutive underscores
  sanitized = sanitized.replace(/_+/g, '_');

  // Ensure it's not empty
  if (!sanitized) {
    throw new Error('SuggestOperationID failed');
  }

  return sanitized;
}
