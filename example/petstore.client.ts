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


export interface ListPetsQuery {
  limit?: number; // How many items to return at one time (max 100)
}

export type ListPetsResponse = any;

export type CreatePetsRequest = {
  name: string;
  tag?: string;
};

export type CreatePetsResponse = any;

export interface ShowPetByIdParams {
  petId: string; // The id of the pet to retrieve
}

export type ShowPetByIdResponse = any;

export type UpdatePetByIdRequest = {
  name?: string;
  tag?: string;
};

export interface UpdatePetByIdParams {
  petId: string;
}

export type UpdatePetByIdResponse = any;

export interface DeletePetByIdParams {
  petId: string;
}

export type DeletePetByIdResponse = any;


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private ky: typeof ky;

  constructor(prefixUrl: string = 'https://petstore.swagger.io/v1') {
    this.ky = ky.create({ prefixUrl });
  }

  async listPets(query?: ListPetsQuery, options?: RequestOptions): Promise<ListPetsResponse> {
    const url = '/pets';
    return await this.ky.get(url, {
      searchParams: convertSearchParams(query),
      ...options,
    }).json<ListPetsResponse>();
  }

  async createPets(body?: CreatePetsRequest, options?: RequestOptions): Promise<CreatePetsResponse> {
    const url = '/pets';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<CreatePetsResponse>();
  }

  async showPetById(params: ShowPetByIdParams, options?: RequestOptions): Promise<ShowPetByIdResponse> {
    const url = `/pets/${params.petId}`;
    return await this.ky.get(url, {
      ...options,
    }).json<ShowPetByIdResponse>();
  }

  async updatePetById(params: UpdatePetByIdParams, body?: UpdatePetByIdRequest, options?: RequestOptions): Promise<UpdatePetByIdResponse> {
    const url = `/pets/${params.petId}`;
    return await this.ky.put(url, {
      json: body,
      ...options,
    }).json<UpdatePetByIdResponse>();
  }

  async deletePetById(params: DeletePetByIdParams, options?: RequestOptions): Promise<DeletePetByIdResponse> {
    const url = `/pets/${params.petId}`;
    return await this.ky.delete(url, {
      ...options,
    }).json<DeletePetByIdResponse>();
  }
}

export default ApiClient;