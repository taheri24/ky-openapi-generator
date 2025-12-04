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


export type PostEventsRequest = {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
};

export type PostEventsResponse = any;

export interface GetReportsQuery {
  start_date: string;
  end_date: string;
  metrics?: string[];
}

export type GetReportsResponse = {
  start_date?: string;
  end_date?: string;
  data?: {
  metric_name?: string;
  values?: number[];
  total?: number;
}[];
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

  constructor(prefixUrl: string = 'https://analytics.example.com') {
    this.ky = ky.create({ prefixUrl });
  }

  async postEvents(body?: PostEventsRequest, options?: RequestOptions): Promise<PostEventsResponse> {
    const url = '/events';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostEventsResponse>();
  }

  async getReports(query?: GetReportsQuery, options?: RequestOptions): Promise<GetReportsResponse> {
    const url = '/reports';
    return await this.ky.get(url, {
      searchParams: convertSearchParams(query),
      ...options,
    }).json<GetReportsResponse>();
  }
}

export default ApiClient;