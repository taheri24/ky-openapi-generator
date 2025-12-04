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


export type PostPaymentsRequest = CreatePaymentRequest;

export type PostPaymentsResponse = Payment;

export interface GetPaymentsParams {
  payment_id: string;
}

export type GetPaymentsResponse = Payment;

export type PostRefundsRequest = CreateRefundRequest;

export type PostRefundsResponse = Refund;


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