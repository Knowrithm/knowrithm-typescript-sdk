export class KnowrithmAPIError extends Error {
  statusCode?: number;
  responseData?: Record<string, any>;
  errorCode?: string;

  constructor(
    message: string,
    statusCode?: number,
    responseData?: Record<string, any>,
    errorCode?: string
  ) {
    super(message);
    this.name = 'KnowrithmAPIError';
    this.statusCode = statusCode;
    this.responseData = responseData;
    this.errorCode = errorCode;
  }

  toString(): string {
    return `KnowrithmAPIError(status=${this.statusCode}, code=${this.errorCode}): ${this.message}`;
  }
}
