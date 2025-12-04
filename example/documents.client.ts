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


export interface GetDocumentsQuery {
  folder_id?: string;
  type?: 'pdf' | 'docx' | 'txt' | 'xlsx';
}

export type GetDocumentsResponse = {
  id?: string;
  title?: string;
  type?: 'pdf' | 'docx' | 'txt' | 'xlsx';
  size?: number;
  owner_id?: string;
  folder_id?: string;
  created_at?: string;
  updated_at?: string;
}[];

export type PostDocumentsRequest = {
  title: string;
  type: 'pdf' | 'docx' | 'txt' | 'xlsx';
  folder_id?: string;
  content?: string;
};

export type PostDocumentsResponse = {
  id?: string;
  title?: string;
  type?: 'pdf' | 'docx' | 'txt' | 'xlsx';
  size?: number;
  owner_id?: string;
  folder_id?: string;
  created_at?: string;
  updated_at?: string;
};

export interface GetDocumentsDocumentIdParams {
  document_id: string;
}

export type GetDocumentsDocumentIdResponse = {
  id?: string;
  title?: string;
  type?: 'pdf' | 'docx' | 'txt' | 'xlsx';
  size?: number;
  owner_id?: string;
  folder_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PostDocumentsShareRequest = {
  user_ids: string[];
  permission?: 'view' | 'edit' | 'admin';
};

export interface PostDocumentsShareParams {
  document_id: string;
}

export type PostDocumentsShareResponse = any;


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private ky: typeof ky;

  constructor(prefixUrl: string = 'https://docs.example.com/api') {
    this.ky = ky.create({ prefixUrl });
  }

  async getDocuments(query?: GetDocumentsQuery, options?: RequestOptions): Promise<GetDocumentsResponse> {
    const url = '/documents';
    return await this.ky.get(url, {
      searchParams: convertSearchParams(query),
      ...options,
    }).json<GetDocumentsResponse>();
  }

  async postDocuments(body?: PostDocumentsRequest, options?: RequestOptions): Promise<PostDocumentsResponse> {
    const url = '/documents';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostDocumentsResponse>();
  }

  async getDocumentsDocumentId(params: GetDocumentsDocumentIdParams, options?: RequestOptions): Promise<GetDocumentsDocumentIdResponse> {
    const url = `/documents/${params.document_id}`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetDocumentsDocumentIdResponse>();
  }

  async postDocumentsShare(params: PostDocumentsShareParams, body?: PostDocumentsShareRequest, options?: RequestOptions): Promise<PostDocumentsShareResponse> {
    const url = `/documents/${params.document_id}/share`;
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostDocumentsShareResponse>();
  }
}

export default ApiClient;