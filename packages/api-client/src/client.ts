export interface TokenStore {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
}

export interface ApiClientConfig {
  baseUrl: string;
  tokenStore: TokenStore;
  onUnauthenticated?: () => void;
}

interface Envelope<T> {
  data: T;
  timestamp: string;
}

interface ErrorEnvelope {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
}

function buildQuery(query?: Record<string, string | number | undefined>) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export class ApiClient {
  private refreshing: Promise<string | null> | null = null;

  constructor(private config: ApiClientConfig) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', query, body, formData, auth = true } = options;
    const url = `${this.config.baseUrl}${path}${buildQuery(query)}`;

    const doFetch = async (accessToken: string | null): Promise<Response> => {
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      if (body && !formData) headers['Content-Type'] = 'application/json';

      return fetch(url, {
        method,
        headers,
        body: formData ?? (body ? JSON.stringify(body) : undefined),
      });
    };

    const accessToken = auth
      ? await this.config.tokenStore.getAccessToken()
      : null;
    let response = await doFetch(accessToken);

    if (response.status === 401 && auth) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        response = await doFetch(newToken);
      } else {
        this.config.onUnauthenticated?.();
      }
    }

    if (!response.ok) {
      const errorBody = (await response
        .json()
        .catch(() => null)) as ErrorEnvelope | null;
      const message = errorBody
        ? Array.isArray(errorBody.message)
          ? errorBody.message.join(', ')
          : errorBody.message
        : response.statusText;
      throw new ApiError(response.status, message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const envelope = (await response.json()) as Envelope<T>;
    return envelope.data;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshing) return this.refreshing;

    this.refreshing = (async () => {
      const refreshToken = await this.config.tokenStore.getRefreshToken();
      if (!refreshToken) return null;

      const response = await fetch(`${this.config.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await this.config.tokenStore.clearTokens();
        return null;
      }

      const envelope = (await response.json()) as Envelope<{
        accessToken: string;
        refreshToken: string;
      }>;
      await this.config.tokenStore.setTokens(
        envelope.data.accessToken,
        envelope.data.refreshToken,
      );
      return envelope.data.accessToken;
    })();

    try {
      return await this.refreshing;
    } finally {
      this.refreshing = null;
    }
  }
}
