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
export declare class DatabaseService {
    private client;
    constructor(client: KnowrithmClient);
    createConnection(payload: CreateDatabaseConnectionPayload, headers?: Record<string, string>): Promise<CreateDatabaseConnectionResponse>;
    createConnection(name: string, url: string, databaseType: string, agentId: string, connectionParams?: Record<string, any>, headers?: Record<string, string>): Promise<CreateDatabaseConnectionResponse>;
    listConnections(params?: Record<string, any>, headers?: Record<string, string>): Promise<any>;
    getConnection(connectionId: string, headers?: Record<string, string>): Promise<any>;
    updateConnection(connectionId: string, updates: {
        name?: string;
        url?: string;
        database_type?: string;
        connection_params?: Record<string, any>;
        agent_id?: string;
    }, headers?: Record<string, string>): Promise<UpdateDatabaseConnectionResponse>;
    patchConnection(connectionId: string, updates: Record<string, any>, headers?: Record<string, string>): Promise<any>;
    deleteConnection(connectionId: string, headers?: Record<string, string>): Promise<DeleteDatabaseConnectionResponse>;
    restoreConnection(connectionId: string, headers?: Record<string, string>): Promise<any>;
    listDeletedConnections(headers?: Record<string, string>): Promise<any>;
    testConnection(connectionId: string, headers?: Record<string, string>): Promise<any>;
    analyzeConnection(connectionId: string, headers?: Record<string, string>): Promise<any>;
    analyzeMultipleConnections(payload?: Record<string, any>, headers?: Record<string, string>): Promise<any>;
    listTables(connectionId: string, headers?: Record<string, string>): Promise<any>;
    getTable(tableId: string, headers?: Record<string, string>): Promise<any>;
    deleteTable(tableId: string, headers?: Record<string, string>): Promise<any>;
    deleteTablesForConnection(connectionId: string, headers?: Record<string, string>): Promise<any>;
    restoreTable(tableId: string, headers?: Record<string, string>): Promise<any>;
    listDeletedTables(headers?: Record<string, string>): Promise<any>;
    getSemanticSnapshot(connectionId: string, headers?: Record<string, string>): Promise<any>;
    getKnowledgeGraph(connectionId: string, headers?: Record<string, string>): Promise<any>;
    getSampleQueries(connectionId: string, headers?: Record<string, string>): Promise<any>;
    textToSql(connectionId: string, question: string, execute?: boolean, resultLimit?: number, headers?: Record<string, string>): Promise<any>;
    exportConnection(connectionId: string, headers?: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=database.d.ts.map