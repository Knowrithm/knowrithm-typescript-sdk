
// src/services/database.ts
import { KnowrithmClient } from '../client';

export interface CreateDatabaseConnectionPayload {
  name: string;
  url: string;
  database_type: string;
  agent_id: string;
  connection_params?: Record<string, any>;
  company_id?: string;
  user_id?: string;
  [key: string]: any;
}

export interface CreateDatabaseConnectionResponse {
  connection: Record<string, any>;
  test_result?: string | null;
  is_active?: boolean;
  [key: string]: any;
}

export interface UpdateDatabaseConnectionResponse {
  connection: Record<string, any>;
  updated_fields?: string[];
  initiated_by?: string | null;
  [key: string]: any;
}

export interface DeleteDatabaseConnectionResponse {
  connection_id: string;
  deleted_tables_count?: number;
  initiated_by?: string | null;
  [key: string]: any;
}

export class DatabaseService {
  constructor(private client: KnowrithmClient) {}

  async createConnection(
    payload: CreateDatabaseConnectionPayload,
    headers?: Record<string, string>
  ): Promise<CreateDatabaseConnectionResponse>;
  async createConnection(
    name: string,
    url: string,
    databaseType: string,
    agentId: string,
    connectionParams?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<CreateDatabaseConnectionResponse>;
  async createConnection(...args: any[]): Promise<CreateDatabaseConnectionResponse> {
    const payloadOrName = args[0] as CreateDatabaseConnectionPayload | string;
    let data: CreateDatabaseConnectionPayload;
    let resolvedHeaders: Record<string, string> | undefined;

    if (typeof payloadOrName === 'string') {
      const [, url, databaseType, agentId, connectionParams, headers] = args as [
        string,
        string,
        string,
        string,
        Record<string, any> | undefined,
        Record<string, string> | undefined
      ];

      if (!url || !databaseType || !agentId) {
        throw new Error(
          'createConnection(name, url, databaseType, agentId, connectionParams?, headers?) requires all required arguments.'
        );
      }
      data = {
        name: payloadOrName,
        url,
        database_type: databaseType,
        agent_id: agentId,
      };
      if (connectionParams) {
        data.connection_params = connectionParams;
      }
      resolvedHeaders = headers;
    } else {
      const headersOverride = args[1] as Record<string, string> | undefined;
      const { headers: payloadHeaders, ...rest } = payloadOrName as CreateDatabaseConnectionPayload & {
        headers?: Record<string, string>;
      };
      data = rest;
      resolvedHeaders = headersOverride ?? payloadHeaders;
    }

    return this.client.makeRequest('POST', '/sdk/database', { data, headers: resolvedHeaders });
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
  ): Promise<UpdateDatabaseConnectionResponse> {
    return this.client.makeRequest('PUT', `/sdk/database/${connectionId}`, {
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

  async deleteConnection(
    connectionId: string,
    headers?: Record<string, string>
  ): Promise<DeleteDatabaseConnectionResponse> {
    return this.client.makeRequest('DELETE', `/sdk/database/${connectionId}`, { headers });
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
