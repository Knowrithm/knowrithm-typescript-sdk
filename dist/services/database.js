"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
class DatabaseService {
    constructor(client) {
        this.client = client;
    }
    async createConnection(name, url, databaseType, agentId, connectionParams, headers) {
        const data = { name, url, database_type: databaseType, agent_id: agentId };
        if (connectionParams)
            data.connection_params = connectionParams;
        return this.client.makeRequest('POST', '/database-connection', { data, headers });
    }
    async listConnections(params, headers) {
        return this.client.makeRequest('GET', '/database-connection', { params, headers });
    }
    async getConnection(connectionId, headers) {
        return this.client.makeRequest('GET', `/database-connection/${connectionId}`, { headers });
    }
    async updateConnection(connectionId, updates, headers) {
        return this.client.makeRequest('PUT', `/database-connection/${connectionId}`, {
            data: updates,
            headers,
        });
    }
    async patchConnection(connectionId, updates, headers) {
        return this.client.makeRequest('PATCH', `/database-connection/${connectionId}`, {
            data: updates,
            headers,
        });
    }
    async deleteConnection(connectionId, headers) {
        return this.client.makeRequest('DELETE', `/database-connection/${connectionId}`, { headers });
    }
    async restoreConnection(connectionId, headers) {
        return this.client.makeRequest('PATCH', `/database-connection/${connectionId}/restore`, { headers });
    }
    async listDeletedConnections(headers) {
        return this.client.makeRequest('GET', '/database-connection/deleted', { headers });
    }
    async testConnection(connectionId, headers) {
        return this.client.makeRequest('POST', `/database-connection/${connectionId}/test`, { headers });
    }
    async analyzeConnection(connectionId, headers) {
        return this.client.makeRequest('POST', `/database-connection/${connectionId}/analyze`, { headers });
    }
    async analyzeMultipleConnections(payload, headers) {
        return this.client.makeRequest('POST', '/database-connection/analyze', { data: payload, headers });
    }
    async listTables(connectionId, headers) {
        return this.client.makeRequest('GET', `/database-connection/${connectionId}/table`, { headers });
    }
    async getTable(tableId, headers) {
        return this.client.makeRequest('GET', `/database-connection/table/${tableId}`, { headers });
    }
    async deleteTable(tableId, headers) {
        return this.client.makeRequest('DELETE', `/database-connection/table/${tableId}`, { headers });
    }
    async deleteTablesForConnection(connectionId, headers) {
        return this.client.makeRequest('DELETE', `/database-connection/${connectionId}/table`, { headers });
    }
    async restoreTable(tableId, headers) {
        return this.client.makeRequest('PATCH', `/database-connection/table/${tableId}/restore`, { headers });
    }
    async listDeletedTables(headers) {
        return this.client.makeRequest('GET', '/database-connection/table/deleted', { headers });
    }
    async getSemanticSnapshot(connectionId, headers) {
        return this.client.makeRequest('GET', `/database-connection/${connectionId}/semantic-snapshot`, { headers });
    }
    async getKnowledgeGraph(connectionId, headers) {
        return this.client.makeRequest('GET', `/database-connection/${connectionId}/knowledge-graph`, { headers });
    }
    async getSampleQueries(connectionId, headers) {
        return this.client.makeRequest('GET', `/database-connection/${connectionId}/sample-queries`, { headers });
    }
    async textToSql(connectionId, question, execute, resultLimit, headers) {
        const data = { question };
        if (execute !== undefined)
            data.execute = execute;
        if (resultLimit !== undefined)
            data.result_limit = resultLimit;
        return this.client.makeRequest('POST', `/database-connection/${connectionId}/text-to-sql`, {
            data,
            headers,
        });
    }
    async exportConnection(connectionId, headers) {
        return this.client.makeRequest('POST', '/database-connection/export', {
            data: { connection_id: connectionId },
            headers,
        });
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.js.map