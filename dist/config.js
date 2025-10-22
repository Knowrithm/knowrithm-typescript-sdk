"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowrithmConfig = void 0;
class KnowrithmConfig {
    constructor(options) {
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
    }
}
exports.KnowrithmConfig = KnowrithmConfig;
//# sourceMappingURL=config.js.map