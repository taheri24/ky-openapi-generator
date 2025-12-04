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


export interface GetProductsQuery {
  limit?: number;
  offset?: number;
  category_id?: string;
}

export type GetProductsResponse = {
  items?: {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  inventory?: {
  sku?: string;
  quantity_in_stock?: number;
  quantity_reserved?: number;
};
  tags?: string[];
}[];
  total?: number;
  limit?: number;
  offset?: number;
};

export type PostProductsRequest = {
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  tags?: string[];
};

export type PostProductsResponse = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  inventory?: {
  sku?: string;
  quantity_in_stock?: number;
  quantity_reserved?: number;
};
  tags?: string[];
};

export interface GetProductsProductIdParams {
  product_id: string;
}

export type GetProductsProductIdResponse = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  inventory?: {
  sku?: string;
  quantity_in_stock?: number;
  quantity_reserved?: number;
};
  tags?: string[];
};

export type PatchProductsRequest = {
  name?: string;
  description?: string;
  price?: number;
};

export interface PatchProductsParams {
  product_id: string;
}

export type PatchProductsResponse = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  inventory?: {
  sku?: string;
  quantity_in_stock?: number;
  quantity_reserved?: number;
};
  tags?: string[];
};

export interface GetProductsInventoryParams {
  product_id: string;
}

export type GetProductsInventoryResponse = {
  sku?: string;
  quantity_in_stock?: number;
  quantity_reserved?: number;
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

  constructor(prefixUrl: string = 'https://api.ecommerce.example.com/v2') {
    this.ky = ky.create({ prefixUrl });
  }

  async getProducts(query?: GetProductsQuery, options?: RequestOptions): Promise<GetProductsResponse> {
    const url = '/products';
    return await this.ky.get(url, {
      searchParams: convertSearchParams(query),
      ...options,
    }).json<GetProductsResponse>();
  }

  async postProducts(body?: PostProductsRequest, options?: RequestOptions): Promise<PostProductsResponse> {
    const url = '/products';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostProductsResponse>();
  }

  async getProductsProductId(params: GetProductsProductIdParams, options?: RequestOptions): Promise<GetProductsProductIdResponse> {
    const url = `/products/${params.product_id}`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetProductsProductIdResponse>();
  }

  async patchProducts(params: PatchProductsParams, body?: PatchProductsRequest, options?: RequestOptions): Promise<PatchProductsResponse> {
    const url = `/products/${params.product_id}`;
    return await this.ky.patch(url, {
      json: body,
      ...options,
    }).json<PatchProductsResponse>();
  }

  async getProductsInventory(params: GetProductsInventoryParams, options?: RequestOptions): Promise<GetProductsInventoryResponse> {
    const url = `/products/${params.product_id}/inventory`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetProductsInventoryResponse>();
  }
}

export default ApiClient;