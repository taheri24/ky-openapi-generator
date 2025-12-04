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


export type GetFilesResponse = {
  id?: string;
  name?: string;
  size?: number;
  mime_type?: string;
  created_at?: string;
  url?: string;
}[];

export type PostFilesRequest = any;

export type PostFilesResponse = {
  id?: string;
  name?: string;
  size?: number;
  mime_type?: string;
  created_at?: string;
  url?: string;
};

export interface GetFilesFileIdParams {
  file_id: string;
}

export type GetFilesFileIdResponse = {
  id?: string;
  name?: string;
  size?: number;
  mime_type?: string;
  created_at?: string;
  url?: string;
};

export interface DeleteFilesParams {
  file_id: string;
}

export type DeleteFilesResponse = any;

export interface GetFilesDownloadParams {
  file_id: string;
}

export type GetFilesDownloadResponse = any;


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private ky: typeof ky;

  constructor(prefixUrl: string = 'https://files.example.com') {
    this.ky = ky.create({ prefixUrl });
  }

  async getFiles(options?: RequestOptions): Promise<GetFilesResponse> {
    const url = '/files';
    return await this.ky.get(url, {
      ...options,
    }).json<GetFilesResponse>();
  }

  async postFiles(body?: PostFilesRequest, options?: RequestOptions): Promise<PostFilesResponse> {
    const url = '/files';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostFilesResponse>();
  }

  async getFilesFileId(params: GetFilesFileIdParams, options?: RequestOptions): Promise<GetFilesFileIdResponse> {
    const url = `/files/${params.file_id}`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetFilesFileIdResponse>();
  }

  async deleteFiles(params: DeleteFilesParams, options?: RequestOptions): Promise<DeleteFilesResponse> {
    const url = `/files/${params.file_id}`;
    return await this.ky.delete(url, {
      ...options,
    }).json<DeleteFilesResponse>();
  }

  async getFilesDownload(params: GetFilesDownloadParams, options?: RequestOptions): Promise<GetFilesDownloadResponse> {
    const url = `/files/${params.file_id}/download`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetFilesDownloadResponse>();
  }
}

export default ApiClient;