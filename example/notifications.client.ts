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


export interface GetNotificationsQuery {
  unread_only?: boolean;
  type?: 'email' | 'sms' | 'push' | 'in_app';
}

export type GetNotificationsResponse = Notification[];

export type PostNotificationsRequest = SendNotificationRequest;

export type PostNotificationsResponse = Notification;

export interface PostNotificationsMarkAsReadParams {
  notification_id: string;
}

export type PostNotificationsMarkAsReadResponse = Notification;


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class ApiClient {
  private ky: typeof ky;

  constructor(prefixUrl: string = 'https://notifications.example.com') {
    this.ky = ky.create({ prefixUrl });
  }

  async getNotifications(query?: GetNotificationsQuery, options?: RequestOptions): Promise<GetNotificationsResponse> {
    const url = '/notifications';
    return await this.ky.get(url, {
      searchParams: convertSearchParams(query),
      ...options,
    }).json<GetNotificationsResponse>();
  }

  async postNotifications(body?: PostNotificationsRequest, options?: RequestOptions): Promise<PostNotificationsResponse> {
    const url = '/notifications';
    return await this.ky.post(url, {
      json: body,
      ...options,
    }).json<PostNotificationsResponse>();
  }

  async postNotificationsMarkAsRead(params: PostNotificationsMarkAsReadParams, options?: RequestOptions): Promise<PostNotificationsMarkAsReadResponse> {
    const url = `/notifications/${params.notification_id}/mark-as-read`;
    return await this.ky.post(url, {
      ...options,
    }).json<PostNotificationsMarkAsReadResponse>();
  }
}

export default ApiClient;