export class KnowrithmConfig {
  baseUrl: string;
  apiVersion: string;
  timeout: number;
  maxRetries: number;
  retryBackoffFactor: number;
  verifySsl: boolean;
  streamPathTemplate?: string;
  streamBaseUrl?: string;
  streamTimeout?: number;

  constructor(options?: Partial<KnowrithmConfig>) {
    this.baseUrl = options?.baseUrl || 'https://app.knowrithm.org/api';
    this.apiVersion = options?.apiVersion || 'v1';
    this.timeout = options?.timeout || 30000; // milliseconds
    this.maxRetries = options?.maxRetries || 3;
    this.retryBackoffFactor = options?.retryBackoffFactor || 1.5;
    this.verifySsl = options?.verifySsl ?? true;
    this.streamPathTemplate = options?.streamPathTemplate || '/conversation/{conversation_id}/messages/stream';
    this.streamBaseUrl = options?.streamBaseUrl;
    this.streamTimeout = options?.streamTimeout;
  }
}