import ky from 'ky';


export interface ListPetsQuery {
  limit?: number; // How many items to return at one time (max 100)
}

export interface ListPetsResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface CreatePetsRequest {
  // Request body for POST /pets
  [key: string]: any;
}

export interface CreatePetsResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface ShowPetByIdParams {
  petId: string; // The id of the pet to retrieve
}

export interface ShowPetByIdResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface UpdatePetByIdRequest {
  // Request body for PUT /pets/{petId}
  [key: string]: any;
}

export interface UpdatePetByIdParams {
  petId: string;
}

export interface UpdatePetByIdResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface DeletePetByIdParams {
  petId: string;
}

export interface DeletePetByIdResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private baseUrl: string;
  private ky: typeof ky;

  constructor(baseUrl: string = 'https://petstore.swagger.io/v1') {
    this.baseUrl = baseUrl;
    this.ky = ky.create({ prefixUrl: baseUrl });
  }

  async listPets(query?: ListPetsQuery, options?: RequestOptions): Promise<ListPetsResponse> {
    const url = '/pets';
    const response = await this.ky.get(url, {
      searchParams: query,
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async createPets(body?: CreatePetsRequest, options?: RequestOptions): Promise<CreatePetsResponse> {
    const url = '/pets';
    const response = await this.ky.post(url, {
      json: body,
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async showPetById(params: ShowPetByIdParams, options?: RequestOptions): Promise<ShowPetByIdResponse> {
    const url = `/pets/${params.petId}`;
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async updatePetById(params: UpdatePetByIdParams, body?: UpdatePetByIdRequest, options?: RequestOptions): Promise<UpdatePetByIdResponse> {
    const url = `/pets/${params.petId}`;
    const response = await this.ky.put(url, {
      json: body,
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async deletePetById(params: DeletePetByIdParams, options?: RequestOptions): Promise<DeletePetByIdResponse> {
    const url = `/pets/${params.petId}`;
    const response = await this.ky.delete(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }
}

export default ApiClient;