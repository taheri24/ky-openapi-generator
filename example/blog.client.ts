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


export interface GetPostsQuery {
  status?: 'draft' | 'published' | 'archived';
  author_id?: string;
}

export type GetPostsResponse = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}[];

export type PostPostsRequest = {
  title: string;
  content: string;
  tags?: string[];
};

export type PostPostsResponse = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export interface GetPostsPostIdParams {
  post_id: string;
}

export type GetPostsPostIdResponse = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export type PutPostsRequest = {
  title?: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived';
};

export interface PutPostsParams {
  post_id: string;
}

export type PutPostsResponse = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export interface GetPostsCommentsParams {
  post_id: string;
}

export type GetPostsCommentsResponse = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at?: string;
}[];

export type PostPostsCommentsRequest = {
  content: string;
};

export interface PostPostsCommentsParams {
  post_id: string;
}

export type PostPostsCommentsResponse = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at?: string;
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

  constructor(prefixUrl: string = 'https://api.blog.example.com') {
    this.ky = ky.create({ prefixUrl });
  }

  async getPosts(query?: GetPostsQuery, options?: RequestOptions): Promise<GetPostsResponse> {
    const url = '/posts';
    return await this.ky.get(url, {
      searchParams: convertSearchParams(query),
      ...options,
    }).json<GetPostsResponse>();
  }

  async postPosts(body?: PostPostsRequest, options?: RequestOptions): Promise<PostPostsResponse> {
    const url = '/posts';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostPostsResponse>();
  }

  async getPostsPostId(params: GetPostsPostIdParams, options?: RequestOptions): Promise<GetPostsPostIdResponse> {
    const url = `/posts/${params.post_id}`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetPostsPostIdResponse>();
  }

  async putPosts(params: PutPostsParams, body?: PutPostsRequest, options?: RequestOptions): Promise<PutPostsResponse> {
    const url = `/posts/${params.post_id}`;
    return await this.ky.put(url, {
      json: body,
      ...options,
    }).json<PutPostsResponse>();
  }

  async getPostsComments(params: GetPostsCommentsParams, options?: RequestOptions): Promise<GetPostsCommentsResponse> {
    const url = `/posts/${params.post_id}/comments`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetPostsCommentsResponse>();
  }

  async postPostsComments(params: PostPostsCommentsParams, body?: PostPostsCommentsRequest, options?: RequestOptions): Promise<PostPostsCommentsResponse> {
    const url = `/posts/${params.post_id}/comments`;
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostPostsCommentsResponse>();
  }
}

export default ApiClient;