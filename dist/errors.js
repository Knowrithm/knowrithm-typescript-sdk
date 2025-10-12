"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowrithmAPIError = void 0;
class KnowrithmAPIError extends Error {
    constructor(message, statusCode, responseData, errorCode) {
        super(message);
        this.name = 'KnowrithmAPIError';
        this.statusCode = statusCode;
        this.responseData = responseData;
        this.errorCode = errorCode;
    }
    toString() {
        return `KnowrithmAPIError(status=${this.statusCode}, code=${this.errorCode}): ${this.message}`;
    }
}
exports.KnowrithmAPIError = KnowrithmAPIError;
//# sourceMappingURL=errors.js.map