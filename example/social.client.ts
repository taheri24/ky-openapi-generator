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


export interface GetUsersProfileParams {
  username: string;
}

export type GetUsersProfileResponse = UserProfile;

export interface GetPostsQuery {
  filter?: 'recent' | 'trending' | 'following';
}

export type GetPostsResponse = Post[];

export type PostPostsRequest = CreatePostRequest;

export type PostPostsResponse = Post;

export interface PostPostsLikeParams {
  post_id: string;
}

export type PostPostsLikeResponse = Post;

export interface PostUsersFollowParams {
  username: string;
}

export type PostUsersFollowResponse = any;


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private ky: typeof ky;

  constructor(prefixUrl: string = 'https://social.example.com/api') {
    this.ky = ky.create({ prefixUrl });
  }

  async getUsersProfile(params: GetUsersProfileParams, options?: RequestOptions): Promise<GetUsersProfileResponse> {
    const url = `/users/${params.username}/profile`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetUsersProfileResponse>();
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

  async postPostsLike(params: PostPostsLikeParams, options?: RequestOptions): Promise<PostPostsLikeResponse> {
    const url = `/posts/${params.post_id}/like`;
    return await this.ky.post(url, {
      ...options,
    }).json<PostPostsLikeResponse>();
  }

  async postUsersFollow(params: PostUsersFollowParams, options?: RequestOptions): Promise<PostUsersFollowResponse> {
    const url = `/users/${params.username}/follow`;
    return await this.ky.post(url, {
      ...options,
    }).json<PostUsersFollowResponse>();
  }
}

export default ApiClient;