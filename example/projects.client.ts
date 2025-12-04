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


export interface GetProjectsQuery {
  status?: 'active' | 'completed' | 'archived';
}

export type GetProjectsResponse = {
  id?: string;
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  owner_id?: string;
  created_at?: string;
}[];

export type PostProjectsRequest = {
  name: string;
  description?: string;
  team_members?: string[];
};

export type PostProjectsResponse = {
  id?: string;
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  owner_id?: string;
  created_at?: string;
};

export interface GetProjectsProjectIdParams {
  project_id: string;
}

export type GetProjectsProjectIdResponse = Record<string, any>;

export interface GetProjectsTasksParams {
  project_id: string;
}

export type GetProjectsTasksResponse = {
  id?: string;
  project_id?: string;
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  created_at?: string;
}[];

export type PostProjectsTasksRequest = {
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
};

export interface PostProjectsTasksParams {
  project_id: string;
}

export type PostProjectsTasksResponse = {
  id?: string;
  project_id?: string;
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  created_at?: string;
};

export interface GetTasksSubtasksParams {
  task_id: string;
}

export type GetTasksSubtasksResponse = {
  id?: string;
  task_id?: string;
  title?: string;
  completed?: boolean;
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

  constructor(prefixUrl: string = 'https://projects.example.com/api/v1') {
    this.ky = ky.create({ prefixUrl });
  }

  async getProjects(query?: GetProjectsQuery, options?: RequestOptions): Promise<GetProjectsResponse> {
    const url = '/projects';
    return await this.ky.get(url, {
      searchParams: convertSearchParams(query),
      ...options,
    }).json<GetProjectsResponse>();
  }

  async postProjects(body?: PostProjectsRequest, options?: RequestOptions): Promise<PostProjectsResponse> {
    const url = '/projects';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostProjectsResponse>();
  }

  async getProjectsProjectId(params: GetProjectsProjectIdParams, options?: RequestOptions): Promise<GetProjectsProjectIdResponse> {
    const url = `/projects/${params.project_id}`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetProjectsProjectIdResponse>();
  }

  async getProjectsTasks(params: GetProjectsTasksParams, options?: RequestOptions): Promise<GetProjectsTasksResponse> {
    const url = `/projects/${params.project_id}/tasks`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetProjectsTasksResponse>();
  }

  async postProjectsTasks(params: PostProjectsTasksParams, body?: PostProjectsTasksRequest, options?: RequestOptions): Promise<PostProjectsTasksResponse> {
    const url = `/projects/${params.project_id}/tasks`;
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostProjectsTasksResponse>();
  }

  async getTasksSubtasks(params: GetTasksSubtasksParams, options?: RequestOptions): Promise<GetTasksSubtasksResponse> {
    const url = `/tasks/${params.task_id}/subtasks`;
    return await this.ky.get(url, {
      ...options,
    }).json<GetTasksSubtasksResponse>();
  }
}

export default ApiClient;