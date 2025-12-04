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


export type PostRegisterRequest = {
  email: string;
  password: string;
  name?: string;
};

export type PostRegisterResponse = {
  user?: {
  id?: string;
  email?: string;
  name?: string;
};
  access_token?: string;
  refresh_token?: string;
};

export type PostLoginRequest = {
  email: string;
  password: string;
};

export type PostLoginResponse = {
  user?: {
  id?: string;
  email?: string;
  name?: string;
};
  access_token?: string;
  refresh_token?: string;
};

export type PostRefreshRequest = {
  refresh_token: string;
};

export type PostRefreshResponse = {
  access_token?: string;
  token_type?: string;
};


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private ky: typeof ky;

  constructor(prefixUrl: string = 'https://auth.example.com') {
    this.ky = ky.create({ prefixUrl });
  }

  async postRegister(body?: PostRegisterRequest, options?: RequestOptions): Promise<PostRegisterResponse> {
    const url = '/register';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostRegisterResponse>();
  }

  async postLogin(body?: PostLoginRequest, options?: RequestOptions): Promise<PostLoginResponse> {
    const url = '/login';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostLoginResponse>();
  }

  async postRefresh(body?: PostRefreshRequest, options?: RequestOptions): Promise<PostRefreshResponse> {
    const url = '/refresh';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostRefreshResponse>();
  }
}

export default ApiClient;