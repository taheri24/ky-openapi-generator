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


export type GetTodosResponse = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}[];

export type PostTodosRequest = {
  title: string;
  description?: string;
};

export type PostTodosResponse = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
};

export interface GetTodosIdParams {
  id: string;
}

export type GetTodosIdResponse = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PutTodosRequest = {
  title?: string;
  description?: string;
  completed?: boolean;
};

export interface PutTodosParams {
  id: string;
}

export type PutTodosResponse = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
};

export interface DeleteTodosParams {
  id: string;
}

export type DeleteTodosResponse = any;


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private ky: typeof ky;

  constructor(prefixUrl: string = 'https://api.todos.example.com/v1') {
    this.ky = ky.create({ prefixUrl });
  }

  async getTodos(options?: RequestOptions): Promise<GetTodosResponse> {
    const url = '/todos';
    return await this.ky.get(url, {
      ...options,
    }).json<GetTodosResponse>();
  }

  async postTodos(body?: PostTodosRequest, options?: RequestOptions): Promise<PostTodosResponse> {
    const url = '/todos';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostTodosResponse>();
  }

  async getTodosId(params: GetTodosIdParams, options?: RequestOptions): Promise<GetTodosIdResponse> {
    const url = `/todos/${params.id}`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetTodosIdResponse>();
  }

  async putTodos(params: PutTodosParams, body?: PutTodosRequest, options?: RequestOptions): Promise<PutTodosResponse> {
    const url = `/todos/${params.id}`;
    return await this.ky.put(url, {
      json: body,
      ...options,
    }).json<PutTodosResponse>();
  }

  async deleteTodos(params: DeleteTodosParams, options?: RequestOptions): Promise<DeleteTodosResponse> {
    const url = `/todos/${params.id}`;
    return await this.ky.delete(url, {
      ...options,
    }).json<DeleteTodosResponse>();
  }
}

export default ApiClient;