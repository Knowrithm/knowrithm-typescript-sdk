import { KnowrithmClient } from '../client';
export interface CreateAgentPayload {
    name: string;
    description?: string;
    avatar_url?: string;
    llm_settings_id?: string;
    personality_traits?: Record<string, any>;
    capabilities?: string[];
    operating_hours?: Record<string, any>;
    languages?: string[];
    status?: string;
}
export interface UpdateAgentPayload extends Partial<CreateAgentPayload> {
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
     * Endpoint: `POST /v1/agent`
     */
    createAgent(payload: CreateAgentPayload, headers?: Record<string, string>): Promise<any>;
    /**
     * Retrieve agent details by identifier (public endpoint)
     *
     * Endpoint: `GET /v1/agent/<agent_id>`
     */
    getAgent(agentId: string, headers?: Record<string, string>): Promise<any>;
    /**
     * List agents that belong to the current company or to a specific company for super admins
     *
     * Endpoint: `GET /v1/agent`
     */
    listAgents(params?: ListAgentsParams, headers?: Record<string, string>): Promise<any>;
    /**
     * Replace an agent's metadata and associated LLM settings
     *
     * Endpoint: `PUT /v1/agent/<agent_id>`
     */
    updateAgent(agentId: string, payload: UpdateAgentPayload, headers?: Record<string, string>): Promise<any>;
    /**
     * Soft-delete an agent (must have no active conversations)
     *
     * Endpoint: `DELETE /v1/agent/<agent_id>`
     */
    deleteAgent(agentId: string, headers?: Record<string, string>): Promise<any>;
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