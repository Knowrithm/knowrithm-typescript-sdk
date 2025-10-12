"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
class CompanyService {
    constructor(client) {
        this.client = client;
    }
    async createCompany(payload, logoFile, headers) {
        const files = logoFile ? [{ name: 'logo', ...logoFile }] : undefined;
        return this.client.makeRequest('POST', '/company', { data: payload, files, headers });
    }
    async listCompanies(page, perPage, headers) {
        return this.client.makeRequest('GET', '/super-admin/company', {
            params: { page, per_page: perPage },
            headers
        });
    }
    async getCompany(headers) {
        return this.client.makeRequest('GET', '/company', { headers });
    }
    async getCompanyStatistics(companyId, days, headers) {
        const endpoint = companyId ? `/company/${companyId}/statistics` : '/company/statistics';
        return this.client.makeRequest('GET', endpoint, { params: { days }, headers });
    }
    async listDeletedCompanies(headers) {
        return this.client.makeRequest('GET', '/company/deleted', { headers });
    }
    async updateCompany(companyId, payload, logoFile, headers) {
        const files = logoFile ? [{ name: 'logo', ...logoFile }] : undefined;
        return this.client.makeRequest('PUT', `/company/${companyId}`, {
            data: payload,
            files,
            headers
        });
    }
    async patchCompany(companyId, payload, headers) {
        return this.client.makeRequest('PATCH', `/company/${companyId}`, { data: payload, headers });
    }
    async deleteCompany(companyId, headers) {
        return this.client.makeRequest('DELETE', `/company/${companyId}`, { headers });
    }
    async restoreCompany(companyId, headers) {
        return this.client.makeRequest('PATCH', `/company/${companyId}/restore`, { headers });
    }
    async cascadeDeleteCompany(companyId, deleteRelated, headers) {
        const data = deleteRelated !== undefined ? { delete_related: deleteRelated } : undefined;
        return this.client.makeRequest('DELETE', `/company/${companyId}/cascade-delete`, {
            data,
            headers
        });
    }
    async getRelatedDataSummary(companyId, headers) {
        return this.client.makeRequest('GET', `/company/${companyId}/related-data`, { headers });
    }
    async bulkDeleteCompanies(companyIds, headers) {
        return this.client.makeRequest('DELETE', '/company/bulk-delete', {
            data: { company_ids: companyIds },
            headers
        });
    }
    async bulkRestoreCompanies(companyIds, headers) {
        return this.client.makeRequest('PATCH', '/company/bulk-restore', {
            data: { company_ids: companyIds },
            headers
        });
    }
}
exports.CompanyService = CompanyService;
// Export all services
__exportStar(require("./agent"), exports);
__exportStar(require("./conversation"), exports);
__exportStar(require("./document"), exports);
__exportStar(require("./database"), exports);
__exportStar(require("./analytics"), exports);
__exportStar(require("./address"), exports);
__exportStar(require("./admin"), exports);
__exportStar(require("./settings"), exports);
//# sourceMappingURL=company.js.map