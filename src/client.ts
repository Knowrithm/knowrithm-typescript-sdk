// src/client.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { KnowrithmConfig } from './config';
import { KnowrithmAPIError } from './errors';
import { AddressService } from './services/address';
import { AdminService } from './services/admin';
import { AgentService } from './services/agent';
import { AuthService, ApiKeyService, UserService } from './services/auth';
import { CompanyService } from './services/company';
import { ConversationService, MessageService } from './services/conversation';
import { AnalyticsService } from './services/analytics';
import { DatabaseService } from './services/database';
import { DocumentService } from './services/document';
import { LeadService } from './services/lead';
import { SettingsService, ProviderService } from './services/settings';
import { WebsiteService } from './services/website';

const hasBlobSupport = typeof Blob !== 'undefined';
const hasFileSupport = typeof File !== 'undefined';

const cloneArrayBufferView = (view: ArrayBufferView): ArrayBuffer => {
  const copy = new Uint8Array(view.byteLength);
  copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  return copy.buffer;
};

const cloneSharedArrayBuffer = (buffer: SharedArrayBuffer): ArrayBuffer => {
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(new Uint8Array(buffer));
  return copy.buffer;
};

const normalizeFormDataValue = (value: any): any => {
  if (value == null) {
    return value;
  }

  if (value && typeof value === 'object' && typeof (value as NodeJS.ReadableStream).pipe === 'function') {
    return value;
  }

  if (hasFileSupport && value instanceof File) {
    return value;
  }

  if (hasBlobSupport && value instanceof Blob) {
    return value;
  }

  if (ArrayBuffer.isView(value)) {
    if (!hasBlobSupport) {
      return value;
    }

    const view = value as ArrayBufferView;
    return new Blob([cloneArrayBufferView(view)]);
  }

  if (value instanceof ArrayBuffer) {
    return hasBlobSupport ? new Blob([value]) : value;
  }

  if (typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer) {
    if (!hasBlobSupport) {
      return new Uint8Array(value);
    }
    return new Blob([cloneSharedArrayBuffer(value)]);
  }

  return value;
};

interface RequestRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
}

interface MakeRequestFileDescriptor {
  name: string;
  file: File | Blob | Buffer | ArrayBuffer | ArrayBufferView | NodeJS.ReadableStream | SharedArrayBuffer;
  filename?: string;
}

interface MakeRequestOptions extends RequestRetryOptions {
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  files?: MakeRequestFileDescriptor[];
  timeout?: number;
  operationName?: string;
}

const calculateBackoffDelay = (baseDelay: number, multiplier: number, attempt: number): number => {
  if (baseDelay <= 0) {
    return 0;
  }
  return Math.max(0, Math.round(baseDelay * Math.pow(multiplier, attempt)));
};

const sleep = (durationMs: number): Promise<void> =>
  durationMs > 0 ? new Promise((resolve) => setTimeout(resolve, durationMs)) : Promise.resolve();

interface KnowrithmClientOptions {
  apiKey?: string;
  apiSecret?: string;
  bearerToken?: string;
  baseUrl?: string;
  apiVersion?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  config?: Partial<KnowrithmConfig>;
  autoResolveTasks?: boolean;
}

/**
 * Main client for interacting with the Knowrithm API using API Key authentication
 * 
 * @example
 * ```typescript
 * // Initialize with API credentials
 * const client = new KnowrithmClient({
 *   apiKey: "your_api_key_here",
 *   apiSecret: "your_api_secret_here",
 *   baseUrl: "https://app.knowrithm.org"
 * });
 * 
 * // Create a company
 * const company = await client.companies.createCompany({
 *   name: "Acme Corp",
 *   email: "contact@acme.com"
 * });
 * 
 * // Create an agent
 * const agent = await client.agents.createAgent({
 *   name: "Customer Support Bot",
 *   company_id: company.id
 * });
 * ```
 */
export class KnowrithmClient {
  private apiKey?: string;
  private apiSecret?: string;
  private bearerToken?: string;
  public config: KnowrithmConfig;
  private axiosInstance: AxiosInstance;

  // Service modules
  public auth: AuthService;
  public apiKeys: ApiKeyService;
  public users: UserService;
  public companies: CompanyService;
  public agents: AgentService;
  public leads: LeadService;
  public documents: DocumentService;
  public databases: DatabaseService;
  public conversations: ConversationService;
  public messages: MessageService;
  public analytics: AnalyticsService;
  public addresses: AddressService;
  public admin: AdminService;
  public settings: SettingsService;
  public providers: ProviderService;
  public websites: WebsiteService;

  constructor(options: KnowrithmClientOptions) {
    const {
      apiKey,
      apiSecret,
      bearerToken,
      config,
      baseUrl,
      apiVersion,
      timeout,
      maxRetries,
      retryDelay,
      backoffMultiplier,
      retryableStatusCodes,
      autoResolveTasks,
    } = options;

    if ((!apiKey || !apiSecret) && !bearerToken) {
      throw new Error('KnowrithmClient requires either apiKey/apiSecret or bearerToken credentials.');
    }

    if ((apiKey && !apiSecret) || (!apiKey && apiSecret)) {
      throw new Error('KnowrithmClient requires both apiKey and apiSecret when using API key authentication.');
    }

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.bearerToken = bearerToken;
    const mergedConfig: Partial<KnowrithmConfig> = {
      ...config,
    };

    if (baseUrl !== undefined) {
      mergedConfig.baseUrl = baseUrl;
    }
    if (apiVersion !== undefined) {
      mergedConfig.apiVersion = apiVersion;
    }
    if (timeout !== undefined) {
      mergedConfig.timeout = timeout;
    }
    if (maxRetries !== undefined) {
      mergedConfig.maxRetries = maxRetries;
    }
    if (retryDelay !== undefined) {
      mergedConfig.retryInitialDelay = retryDelay;
    }
    if (backoffMultiplier !== undefined) {
      mergedConfig.retryBackoffFactor = backoffMultiplier;
    }
    if (retryableStatusCodes !== undefined) {
      mergedConfig.retryableStatusCodes = retryableStatusCodes;
    }
    if (autoResolveTasks !== undefined) {
      mergedConfig.autoResolveTasks = autoResolveTasks;
    }

    this.config = new KnowrithmConfig(mergedConfig);

    // Create axios instance
    this.axiosInstance = axios.create();

    // Initialize service modules
    this.auth = new AuthService(this);
    this.apiKeys = new ApiKeyService(this);
    this.users = new UserService(this);
    this.companies = new CompanyService(this);
    this.agents = new AgentService(this);
    this.leads = new LeadService(this);
    this.documents = new DocumentService(this);
    this.databases = new DatabaseService(this);
    this.conversations = new ConversationService(this);
    this.messages = new MessageService(this);
    this.analytics = new AnalyticsService(this);
    this.addresses = new AddressService(this);
    this.admin = new AdminService(this);
    this.settings = new SettingsService(this);
    this.providers = new ProviderService(this);
    this.websites = new WebsiteService(this);
  }

  get baseUrl(): string {
    return `${this.config.baseUrl}/${this.config.apiVersion}`;
  }

  /**
   * Headers required for authenticating requests directly with fetch/SSE.
   */
  public getAuthHeaders(): Record<string, string> {
    if (this.apiKey && this.apiSecret) {
      return {
        'X-API-Key': this.apiKey,
        'X-API-Secret': this.apiSecret,
      };
    }

    if (this.bearerToken) {
      return {
        Authorization: `Bearer ${this.bearerToken}`,
      };
    }

    return {};
  }

  private shouldResolveAsyncTask(response: AxiosResponse): boolean {
    if (!response) {
      return false;
    }

    if (!this.config.autoResolveTasks) {
      return false;
    }

    const status = response.status;
    const payload = response.data;
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    if (status === 202) {
      return true;
    }

    const statusUrl = this.extractStatusUrl(payload);
    return Boolean(statusUrl);
  }

  private extractStatusUrl(payload: Record<string, any>): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const candidateKeys = ['status_url', 'task_status_url'];
    for (const key of candidateKeys) {
      const value = payload[key];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    const taskId = payload.task_id || payload.taskId;
    if (typeof taskId === 'string' && taskId.length > 0) {
      return `tasks/${taskId}/status`;
    }

    return null;
  }

  private toAbsoluteUrl(pathOrUrl: string): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
    return new URL(pathOrUrl, base).toString();
  }

  private normalizeTaskStatus(payload: Record<string, any>): string | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const statusFields = ['status', 'state', 'task_status', 'taskState'];
    for (const field of statusFields) {
      const value = payload[field];
      if (value !== undefined && value !== null) {
        return String(value).toLowerCase();
      }
    }

    return undefined;
  }

  private isSuccessfulTaskPayload(payload: Record<string, any>): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const status = this.normalizeTaskStatus(payload);
    if (status && this.config.taskSuccessStatuses.includes(status)) {
      return true;
    }

    if (!status && (payload.result !== undefined || payload.success === true)) {
      return true;
    }

    return false;
  }

  private isFailedTaskPayload(payload: Record<string, any>): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const status = this.normalizeTaskStatus(payload);
    if (status && this.config.taskFailureStatuses.includes(status)) {
      return true;
    }

    if (payload.error || payload.errors) {
      return true;
    }

    return false;
  }

  private extractTaskResult(payload: Record<string, any>): any {
    return payload;
  }

  private async resolveAsyncTask<T>(
    response: AxiosResponse,
    requestHeaders: Record<string, string>,
    timeout: number,
    operationName: string
  ): Promise<T> {
    const initialPayload = (response.data && typeof response.data === 'object') ? response.data : {};
    const statusUrl = this.extractStatusUrl(initialPayload);

    if (!statusUrl) {
      return initialPayload as T;
    }

    const resolvedStatusUrl = this.toAbsoluteUrl(statusUrl);
    return this.waitForTaskResult<T>(resolvedStatusUrl, requestHeaders, timeout, operationName, initialPayload);
  }

  private async waitForTaskResult<T>(
    statusUrl: string,
    requestHeaders: Record<string, string>,
    timeout: number,
    operationName: string,
    initialPayload?: Record<string, any>
  ): Promise<T> {
    const pollInterval = Math.max(100, this.config.taskPollingInterval);
    const deadline = Date.now() + this.config.taskPollingTimeout;
    let attempt = 0;
    let payload: Record<string, any> | undefined = initialPayload;

    while (true) {
      if (payload && this.isSuccessfulTaskPayload(payload)) {
        return this.extractTaskResult(payload) as T;
      }

      if (payload && this.isFailedTaskPayload(payload)) {
        const normalizedStatus = this.normalizeTaskStatus(payload);
        const message =
          payload.error ||
          payload.message ||
          payload.detail ||
          `Asynchronous task ${normalizedStatus || 'failed'} (${operationName})`;

        throw new KnowrithmAPIError(message, undefined, {
          operation: operationName,
          task: payload,
        });
      }

      if (Date.now() > deadline) {
        throw new KnowrithmAPIError('Task polling timed out', undefined, {
          operation: operationName,
          task_status_url: statusUrl,
          last_payload: payload,
        });
      }

      const delay = attempt === 0 && payload ? 0 : pollInterval;
      if (delay > 0) {
        await sleep(delay);
      }

      const statusResponse = await this.axiosInstance.request({
        method: 'GET',
        url: statusUrl,
        headers: requestHeaders,
        timeout,
        validateStatus: () => true,
      });

      if (statusResponse.status >= 400) {
        let errorData: any = {};
        try {
          errorData = statusResponse.data ?? {};
        } catch {
          errorData = {};
        }

        const enrichedError =
          errorData && typeof errorData === 'object'
            ? { ...errorData, operation: operationName, attemptNumber: attempt + 1 }
            : {
                detail: errorData,
                operation: operationName,
                attemptNumber: attempt + 1,
              };

        throw new KnowrithmAPIError(
          enrichedError.detail || enrichedError.message || `HTTP ${statusResponse.status}`,
          statusResponse.status,
          enrichedError
        );
      }

      payload =
        statusResponse.data && typeof statusResponse.data === 'object'
          ? (statusResponse.data as Record<string, any>)
          : {};

      attempt += 1;
    }
  }

  /**
   * Make HTTP request with error handling and retries
   */
  async makeRequest<T = any>(
    method: string,
    endpoint: string,
    options: MakeRequestOptions = {}
  ): Promise<T> {
    const {
      data,
      params,
      headers,
      files,
      timeout: timeoutOverride,
      maxRetries: maxRetriesOverride,
      retryDelay,
      backoffMultiplier,
      retryableStatusCodes,
      operationName,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      ...this.getAuthHeaders(),
      ...headers,
    };

    let requestData: any = data;
    let isFormData = false;

    if (files && files.length > 0) {
      const formData = new FormData();

      files.forEach(({ name, file, filename }) => {
        const normalizedFile = normalizeFormDataValue(file);
        if (filename) {
          formData.append(name, normalizedFile as any, filename);
        } else {
          formData.append(name, normalizedFile as any);
        }
      });

      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(
              key,
              typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)
                ? JSON.stringify(value)
                : String(value)
            );
          }
        });
      }

      requestData = formData;
      isFormData = true;

      if (requestHeaders['Content-Type']) {
        delete requestHeaders['Content-Type'];
      }
    } else if (data && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const timeout = timeoutOverride ?? this.config.timeout;
    const totalAttempts = Math.max(1, maxRetriesOverride ?? this.config.maxRetries);
    const baseDelay = retryDelay ?? this.config.retryInitialDelay;
    const multiplier = backoffMultiplier ?? this.config.retryBackoffFactor;
    const retryStatuses = retryableStatusCodes ?? this.config.retryableStatusCodes;
    const resolvedOperationName = operationName ?? `${method.toUpperCase()} ${endpoint}`;

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      try {
        const axiosConfig: AxiosRequestConfig = {
          method: method.toUpperCase(),
          url,
          headers: requestHeaders,
          params,
          timeout,
          validateStatus: () => true,
        };

        if (requestData) {
          if (isFormData) {
            axiosConfig.data = requestData;
          } else if (method.toUpperCase() === 'GET') {
            axiosConfig.params = { ...axiosConfig.params, ...requestData };
          } else {
            axiosConfig.data = requestData;
          }
        }

        const response: AxiosResponse = await this.axiosInstance.request(axiosConfig);

        if (response.status >= 400) {
          let errorData: any = {};
          try {
            errorData = response.data;
          } catch {
            errorData = { detail: response.statusText };
          }

          const enrichedErrorData =
            errorData && typeof errorData === 'object'
              ? { ...errorData, operation: resolvedOperationName, attemptNumber: attempt + 1 }
              : {
                  detail: errorData,
                  operation: resolvedOperationName,
                  attemptNumber: attempt + 1,
                };

          if (retryStatuses.includes(response.status) && attempt < totalAttempts - 1) {
            const delay = calculateBackoffDelay(baseDelay, multiplier, attempt);
            await sleep(delay);
            continue;
          }

          throw new KnowrithmAPIError(
            enrichedErrorData.detail || enrichedErrorData.message || `HTTP ${response.status}`,
            response.status,
            enrichedErrorData,
            enrichedErrorData.error_code
          );
        }

        if (this.shouldResolveAsyncTask(response)) {
          return this.resolveAsyncTask<T>(response, requestHeaders, timeout, resolvedOperationName);
        }

        if (!response.data || Object.keys(response.data).length === 0) {
          return { success: true } as T;
        }

        return response.data as T;
      } catch (error) {
        if (error instanceof KnowrithmAPIError) {
          throw error;
        }

        const axiosError = axios.isAxiosError(error) ? (error as AxiosError) : undefined;
        const statusCode = axiosError?.response?.status;
        const isTimeoutError = axiosError?.code === 'ECONNABORTED';
        const shouldRetry =
          attempt < totalAttempts - 1 &&
          (isTimeoutError ||
            (statusCode !== undefined && retryStatuses.includes(statusCode)) ||
            !axiosError);

        if (shouldRetry) {
          const delay = calculateBackoffDelay(baseDelay, multiplier, attempt);
          await sleep(delay);
          continue;
        }

        if (axiosError) {
          if (isTimeoutError) {
            throw new KnowrithmAPIError(
              `Request timed out after ${timeout} ms`,
              statusCode,
              {
                operation: resolvedOperationName,
                attemptNumber: attempt + 1,
                timeoutValue: timeout,
                suggestion: 'Consider increasing timeout or retries for long-running operations.',
              },
              'TIMEOUT'
            );
          }

          let errorData: any = {};
          try {
            errorData = axiosError.response?.data ?? {};
          } catch {
            errorData = {};
          }

          const enrichedErrorData =
            errorData && typeof errorData === 'object'
              ? { ...errorData, operation: resolvedOperationName, attemptNumber: attempt + 1 }
              : {
                  detail: errorData,
                  operation: resolvedOperationName,
                  attemptNumber: attempt + 1,
                };

          throw new KnowrithmAPIError(
            axiosError.message,
            statusCode,
            enrichedErrorData,
            axiosError.code
          );
        }

        const failureMessage =
          error instanceof Error ? error.message : String(error);

        throw new KnowrithmAPIError(
          `Request failed: ${failureMessage}`,
          undefined,
          {
            operation: resolvedOperationName,
            attemptNumber: attempt + 1,
          }
        );
      }
    }

    throw new KnowrithmAPIError('Max retries exceeded');
  }
}
