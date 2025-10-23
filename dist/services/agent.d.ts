import { KnowrithmClient } from '../client';
export interface CreateAgentPayload {
    name: string;
    llm_provider_id: string;
    llm_model_id: string;
    embedding_provider_id: string;
    embedding_model_id: string;
    company_id?: string;
    description?: string;
    avatar_url?: string;
    llm_api_key?: string;
    llm_api_base_url?: string;
    llm_temperature?: number;
    llm_max_tokens?: number;
    llm_additional_params?: Record<string, any>;
    embedding_api_key?: string;
    embedding_api_base_url?: string;
    embedding_dimension?: number;
    embedding_additional_params?: Record<string, any>;
    widget_script_url?: string;
    widget_config?: Record<string, any>;
    personality_traits?: Record<string, any>;
    capabilities?: string[];
    operating_hours?: Record<string, any>;
    languages?: string[];
    status?: string;
}
export interface SdkAgentSettingsPayload {
    llm_provider: string;
    llm_provider_id?: string;
    llm_model: string;
    llm_model_id?: string;
    llm_api_key?: string;
    llm_api_base_url?: string;
    llm_temperature?: number;
    llm_max_tokens?: number;
    llm_additional_params?: Record<string, any>;
    embedding_provider: string;
    embedding_provider_id?: string;
    embedding_model: string;
    embedding_model_id?: string;
    embedding_api_key?: string;
    embedding_api_base_url?: string;
    embedding_dimension?: number;
    embedding_additional_params?: Record<string, any>;
    widget_script_url?: string;
    widget_config?: Record<string, any>;
}
export interface CreateSdkAgentPayload {
    name: string;
    company_id?: string;
    description?: string;
    avatar_url?: string;
    personality_traits?: Record<string, any>;
    capabilities?: string[];
    operating_hours?: Record<string, any>;
    languages?: string[];
    status?: string;
    settings: SdkAgentSettingsPayload;
}
export interface UpdateAgentPayload {
    name?: string;
    description?: string;
    avatar_url?: string;
    llm_settings_id?: string;
    personality_traits?: Record<string, any>;
    capabilities?: string[];
    operating_hours?: Record<string, any>;
    languages?: string[];
    status?: string;
}
export interface UpdateAgentResponse {
    agent: Record<string, any>;
    initiated_by?: string | null;
    [key: string]: any;
}
export interface DeleteAgentResponse {
    agent_id: string;
    initiated_by?: string | null;
    [key: string]: any;
}
export interface ListAgentsParams {
    company_id?: string;
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
}
export interface CloneAgentPayload {
    name?: string;
    llm_settings_id?: string;
}
export interface GetAgentByNameParams {
    company_id?: string;
}
/**
 * Thin wrapper around agent endpoints. Provides a typed interface
 * for creating and managing Knowrithm agents.
 */
export declare class AgentService {
    private client;
    constructor(client: KnowrithmClient);
    /**
     * Create a new agent bound to the authenticated company
     *
     * Automatically provisions LLM + embedding settings when provider/model IDs are supplied.
     * Endpoint: `POST /v1/agent`
     */
    createAgent(payload: CreateAgentPayload, headers?: Record<string, string>): Promise<any>;
    /**
     * Create an agent by referencing provider/model names instead of IDs
     *
     * Useful for SDK integrations that manage provider catalogs client-side.
     * Endpoint: `POST /v1/sdk/agent`
     */
    createSdkAgent(payload: CreateSdkAgentPayload, headers?: Record<string, string>): Promise<any>;
    /**
     * Retrieve agent details by identifier (public endpoint)
     *
     * Endpoint: `GET /v1/agent/<agent_id>`
     */
    getAgent(agentId: string, headers?: Record<string, string>): Promise<any>;
    /**
     * Retrieve an agent by name (case-insensitive)
     *
     * Endpoint: `GET /v1/agent/by-name/<name>`
     */
    getAgentByName(name: string, params?: GetAgentByNameParams, headers?: Record<string, string>): Promise<any>;
    /**
     * List agents that belong to the current company or to a specific company for super admins
     *
     * Endpoint: `GET /v1/agent`
     */
    listAgents(params?: ListAgentsParams, headers?: Record<string, string>): Promise<any>;
    /**
     * Replace an agent's metadata and associated LLM settings
     *
     * Endpoint: `PUT /v1/sdk/agent/<agent_id>`
     */
    updateAgent(agentId: string, payload: UpdateAgentPayload, headers?: Record<string, string>): Promise<UpdateAgentResponse>;
    /**
     * Soft-delete an agent (must have no active conversations)
     *
     * Endpoint: `DELETE /v1/sdk/agent/<agent_id>`
     */
    deleteAgent(agentId: string, headers?: Record<string, string>): Promise<DeleteAgentResponse>;
    /**
     * Restore a soft-deleted agent
     *
     * Endpoint: `PATCH /v1/agent/<agent_id>/restore`
     */
    restoreAgent(agentId: string, headers?: Record<string, string>): Promise<any>;
    /**
     * Retrieve the embed code that powers the public chat widget for this agent
     *
     * Endpoint: `GET /v1/agent/<agent_id>/embed-code`
     */
    getEmbedCode(agentId: string, headers?: Record<string, string>): Promise<any>;
    /**
     * Run a test prompt against the agent
     *
     * Endpoint: `POST /v1/agent/<agent_id>/test`
     */
    testAgent(agentId: string, query?: string, headers?: Record<string, string>): Promise<any>;
    /**
     * Retrieve aggregate statistics for an agent
     *
     * Endpoint: `GET /v1/agent/<agent_id>/stats`
     */
    getAgentStats(agentId: string, headers?: Record<string, string>): Promise<any>;
    /**
     * Duplicate an agent configuration
     *
     * Endpoint: `POST /v1/agent/<agent_id>/clone`
     */
    cloneAgent(agentId: string, payload?: CloneAgentPayload, headers?: Record<string, string>): Promise<any>;
    /**
     * Download the public widget JavaScript bundle
     *
     * Endpoint: `GET /widget.js`
     */
    fetchWidgetScript(headers?: Record<string, string>): Promise<string>;
    /**
     * Request the internal widget test page
     *
     * Endpoint: `POST /test`
     */
    renderTestPage(bodyHtml: string, headers?: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=agent.d.ts.map