export class KnowrithmConfig {
  baseUrl: string;
  apiVersion: string;
  timeout: number;
  maxRetries: number;
  retryBackoffFactor: number;
  retryInitialDelay: number;
  retryableStatusCodes: number[];
  verifySsl: boolean;
  streamPathTemplate?: string;
  streamBaseUrl?: string;
  streamTimeout?: number;
  taskPollingInterval: number;
  taskPollingTimeout: number;
  taskSuccessStatuses: string[];
  taskFailureStatuses: string[];
  autoResolveTasks: boolean;

  constructor(options?: Partial<KnowrithmConfig>) {
    this.baseUrl = options?.baseUrl || 'https://app.knowrithm.org/api';
    this.apiVersion = options?.apiVersion || 'v1';
    this.timeout = options?.timeout || 30000; // milliseconds
    this.maxRetries = options?.maxRetries || 3;
    this.retryBackoffFactor = options?.retryBackoffFactor || 1.5;
    this.retryInitialDelay = options?.retryInitialDelay ?? 1000;
    this.retryableStatusCodes =
      options?.retryableStatusCodes && options.retryableStatusCodes.length > 0
        ? options.retryableStatusCodes
        : [408, 429, 500, 502, 503, 504];
    this.verifySsl = options?.verifySsl ?? true;
    this.streamPathTemplate = options?.streamPathTemplate || '/conversation/{conversation_id}/messages/stream';
    this.streamBaseUrl = options?.streamBaseUrl;
    this.streamTimeout = options?.streamTimeout;
    this.taskPollingInterval = options?.taskPollingInterval ?? 1000;
    this.taskPollingTimeout = options?.taskPollingTimeout ?? 120000;
    this.taskSuccessStatuses = (options?.taskSuccessStatuses ??
      ['success', 'completed', 'finished', 'done', 'succeeded']).map((status) => status.toLowerCase());
    this.taskFailureStatuses = (options?.taskFailureStatuses ??
      ['failed', 'failure', 'error', 'cancelled', 'timeout', 'revoked']).map((status) => status.toLowerCase());
    this.autoResolveTasks = options?.autoResolveTasks ?? true;
  }
}
