export declare class KnowrithmConfig {
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
    constructor(options?: Partial<KnowrithmConfig>);
}
//# sourceMappingURL=config.d.ts.map