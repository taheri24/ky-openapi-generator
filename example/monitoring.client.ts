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


export type GetHealthResponse = {
  status?: 'healthy' | 'degraded' | 'unhealthy';
  services?: {
  name?: string;
  status?: 'up' | 'down' | 'degraded';
  response_time_ms?: number;
}[];
  timestamp?: string;
};

export interface GetMetricsQuery {
  type?: 'cpu' | 'memory' | 'disk' | 'network';
}

export type GetMetricsResponse = {
  name?: string;
  type?: string;
  value?: number;
  unit?: string;
  timestamp?: string;
}[];

export type GetAlertsResponse = {
  id?: string;
  severity?: 'info' | 'warning' | 'critical';
  title?: string;
  message?: string;
  created_at?: string;
}[];


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private ky: typeof ky;

  constructor(prefixUrl: string = 'https://monitoring.example.com') {
    this.ky = ky.create({ prefixUrl });
  }

  async getHealth(options?: RequestOptions): Promise<GetHealthResponse> {
    const url = '/health';
    return await this.ky.get(url, {
      ...options,
    }).json<GetHealthResponse>();
  }

  async getMetrics(query?: GetMetricsQuery, options?: RequestOptions): Promise<GetMetricsResponse> {
    const url = '/metrics';
    return await this.ky.get(url, {
      searchParams: convertSearchParams(query),
      ...options,
    }).json<GetMetricsResponse>();
  }

  async getAlerts(options?: RequestOptions): Promise<GetAlertsResponse> {
    const url = '/alerts';
    return await this.ky.get(url, {
      ...options,
    }).json<GetAlertsResponse>();
  }
}

export default ApiClient;