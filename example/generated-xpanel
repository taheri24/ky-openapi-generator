import ky from 'ky';

/**
 * Converts query parameters to searchParams format
 * Filters out undefined values to avoid encoding issues
 */
function convertSearchParams(params: Record<string, any> | undefined): Record<string, any> | undefined {
  if (!params) return undefined;
  const converted: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      converted[key] = value;
    }
  }
  return Object.keys(converted).length > 0 ? converted : undefined;
}


export type GetApiV1UsersResponse = ModelsUser[];

export type PostApiV1UsersResponse = ModelsUser;

export interface GetApiV1UsersIdParams {
  id: any; // User ID
}

export type GetApiV1UsersIdResponse = ModelsUser;

export interface PutApiV1UsersParams {
  id: any; // User ID
}

export type PutApiV1UsersResponse = ModelsUser;

export interface DeleteApiV1UsersParams {
  id: any; // User ID
}

export type DeleteApiV1UsersResponse = Record<string, any>;

export type GetApiV1XResponse = Record<string, any>;

export interface GetApiV1XNameParams {
  name: any; // Feature name
}

export type GetApiV1XNameResponse = Record<string, any>;

export interface PostApiV1XActionsParams {
  name: any; // Feature name
  actionId: any; // Action ID
}

export type PostApiV1XActionsResponse = Record<string, any>;

export interface GetApiV1XBackendParams {
  name: any; // Feature name
}

export type GetApiV1XBackendResponse = Record<string, any>;

export interface GetApiV1XFrontendParams {
  name: any; // Feature name
}

export type GetApiV1XFrontendResponse = Record<string, any>;

export interface GetApiV1XMappingsParams {
  name: any; // Feature name
}

export type GetApiV1XMappingsResponse = Record<string, any>;

export interface PostApiV1XQueriesParams {
  name: any; // Feature name
  queryId: any; // Query ID
}

export type PostApiV1XQueriesResponse = Record<string, any>;

export type GetHealthResponse = Record<string, any>;

export type GetReadyResponse = Record<string, any>;


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private ky: typeof ky;

  constructor(prefixUrl: string = '') {
    this.ky = ky.create({ prefixUrl });
  }

  async getApiV1Users(options?: RequestOptions): Promise<GetApiV1UsersResponse> {
    const url = '/api/v1/users';
    return await this.ky.get(url, {
      ...options,
    }).json<GetApiV1UsersResponse>();
  }

  async postApiV1Users(options?: RequestOptions): Promise<PostApiV1UsersResponse> {
    const url = '/api/v1/users';
    return await this.ky.post(url, {
      ...options,
    }).json<PostApiV1UsersResponse>();
  }

  async getApiV1UsersId(params: GetApiV1UsersIdParams, options?: RequestOptions): Promise<GetApiV1UsersIdResponse> {
    const url = `/api/v1/users/${params.id}`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetApiV1UsersIdResponse>();
  }

  async putApiV1Users(params: PutApiV1UsersParams, options?: RequestOptions): Promise<PutApiV1UsersResponse> {
    const url = `/api/v1/users/${params.id}`;
    return await this.ky.put(url, {
      ...options,
    }).json<PutApiV1UsersResponse>();
  }

  async deleteApiV1Users(params: DeleteApiV1UsersParams, options?: RequestOptions): Promise<DeleteApiV1UsersResponse> {
    const url = `/api/v1/users/${params.id}`;
    return await this.ky.delete(url, {
      ...options,
    }).json<DeleteApiV1UsersResponse>();
  }

  async getApiV1X(options?: RequestOptions): Promise<GetApiV1XResponse> {
    const url = '/api/v1/x';
    return await this.ky.get(url, {
      ...options,
    }).json<GetApiV1XResponse>();
  }

  async getApiV1XName(params: GetApiV1XNameParams, options?: RequestOptions): Promise<GetApiV1XNameResponse> {
    const url = `/api/v1/x/${params.name}`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetApiV1XNameResponse>();
  }

  async postApiV1XActions(params: PostApiV1XActionsParams, options?: RequestOptions): Promise<PostApiV1XActionsResponse> {
    const url = `/api/v1/x/${params.name}/actions/${params.actionId}`;
    return await this.ky.post(url, {
      ...options,
    }).json<PostApiV1XActionsResponse>();
  }

  async getApiV1XBackend(params: GetApiV1XBackendParams, options?: RequestOptions): Promise<GetApiV1XBackendResponse> {
    const url = `/api/v1/x/${params.name}/backend`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetApiV1XBackendResponse>();
  }

  async getApiV1XFrontend(params: GetApiV1XFrontendParams, options?: RequestOptions): Promise<GetApiV1XFrontendResponse> {
    const url = `/api/v1/x/${params.name}/frontend`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetApiV1XFrontendResponse>();
  }

  async getApiV1XMappings(params: GetApiV1XMappingsParams, options?: RequestOptions): Promise<GetApiV1XMappingsResponse> {
    const url = `/api/v1/x/${params.name}/mappings`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetApiV1XMappingsResponse>();
  }

  async postApiV1XQueries(params: PostApiV1XQueriesParams, options?: RequestOptions): Promise<PostApiV1XQueriesResponse> {
    const url = `/api/v1/x/${params.name}/queries/${params.queryId}`;
    return await this.ky.post(url, {
      ...options,
    }).json<PostApiV1XQueriesResponse>();
  }

  async getHealth(options?: RequestOptions): Promise<GetHealthResponse> {
    const url = '/health';
    return await this.ky.get(url, {
      ...options,
    }).json<GetHealthResponse>();
  }

  async getReady(options?: RequestOptions): Promise<GetReadyResponse> {
    const url = '/ready';
    return await this.ky.get(url, {
      ...options,
    }).json<GetReadyResponse>();
  }
}

export default ApiClient;