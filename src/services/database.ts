
// src/services/database.ts
import { KnowrithmClient } from '../client';

export class DatabaseService {
  constructor(private client: KnowrithmClient) {}

  async createConnection(
    name: string,
    url: string,
    databaseType: string,
    agentId: string,
    connectionParams?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = { name, url, database_type: databaseType, agent_id: agentId };
    if (connectionParams) data.connection_params = connectionParams;
    return this.client.makeRequest('POST', '/database-connection', { data, headers });
  }

  async listConnections(params?: Record<string, any>, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/database-connection', { params, headers });
  }

  async getConnection(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/database-connection/${connectionId}`, { headers });
  }

  async updateConnection(
    connectionId: string,
    updates: {
      name?: string;
      url?: string;
      database_type?: string;
      connection_params?: Record<string, any>;
      agent_id?: string;
    },
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('PUT', `/database-connection/${connectionId}`, {
      data: updates,
      headers,
    });
  }

  async patchConnection(
    connectionId: string,
    updates: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('PATCH', `/database-connection/${connectionId}`, {
      data: updates,
      headers,
    });
  }

  async deleteConnection(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/database-connection/${connectionId}`, { headers });
  }

  async restoreConnection(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('PATCH', `/database-connection/${connectionId}/restore`, { headers });
  }

  async listDeletedConnections(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/database-connection/deleted', { headers });
  }

  async testConnection(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', `/database-connection/${connectionId}/test`, { headers });
  }

  async analyzeConnection(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', `/database-connection/${connectionId}/analyze`, { headers });
  }

  async analyzeMultipleConnections(payload?: Record<string, any>, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/database-connection/analyze', { data: payload, headers });
  }

  async listTables(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/database-connection/${connectionId}/table`, { headers });
  }

  async getTable(tableId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/database-connection/table/${tableId}`, { headers });
  }

  async deleteTable(tableId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/database-connection/table/${tableId}`, { headers });
  }

  async deleteTablesForConnection(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/database-connection/${connectionId}/table`, { headers });
  }

  async restoreTable(tableId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('PATCH', `/database-connection/table/${tableId}/restore`, { headers });
  }

  async listDeletedTables(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/database-connection/table/deleted', { headers });
  }

  async getSemanticSnapshot(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/database-connection/${connectionId}/semantic-snapshot`, { headers });
  }

  async getKnowledgeGraph(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/database-connection/${connectionId}/knowledge-graph`, { headers });
  }

  async getSampleQueries(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/database-connection/${connectionId}/sample-queries`, { headers });
  }

  async textToSql(
    connectionId: string,
    question: string,
    execute?: boolean,
    resultLimit?: number,
    headers?: Record<string, string>
  ): Promise<any> {
    const data: any = { question };
    if (execute !== undefined) data.execute = execute;
    if (resultLimit !== undefined) data.result_limit = resultLimit;
    return this.client.makeRequest('POST', `/database-connection/${connectionId}/text-to-sql`, {
      data,
      headers,
    });
  }

  async exportConnection(connectionId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/database-connection/export', {
      data: { connection_id: connectionId },
      headers,
    });
  }
}