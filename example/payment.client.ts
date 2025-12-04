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


export type PostPaymentsRequest = {
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  payment_method_id: string;
  description?: string;
  metadata?: Record<string, any>;
};

export type PostPaymentsResponse = {
  id?: string;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at?: string;
};

export interface GetPaymentsParams {
  payment_id: string;
}

export type GetPaymentsResponse = {
  id?: string;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at?: string;
};

export type PostRefundsRequest = {
  payment_id: string;
  amount?: number;
  reason?: string;
};

export type PostRefundsResponse = {
  id?: string;
  payment_id?: string;
  amount?: number;
  status?: string;
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

  constructor(prefixUrl: string = 'https://payments.example.com') {
    this.ky = ky.create({ prefixUrl });
  }

  async postPayments(body?: PostPaymentsRequest, options?: RequestOptions): Promise<PostPaymentsResponse> {
    const url = '/payments';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostPaymentsResponse>();
  }

  async getPayments(params: GetPaymentsParams, options?: RequestOptions): Promise<GetPaymentsResponse> {
    const url = `/payments/${params.payment_id}`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetPaymentsResponse>();
  }

  async postRefunds(body?: PostRefundsRequest, options?: RequestOptions): Promise<PostRefundsResponse> {
    const url = '/refunds';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostRefundsResponse>();
  }
}

export default ApiClient;