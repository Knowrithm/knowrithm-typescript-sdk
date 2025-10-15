// src/services/agent.ts
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
export class AgentService {
  constructor(private client: KnowrithmClient) {}

  /**
   * Create a new agent bound to the authenticated company
   * 
   * Automatically provisions LLM + embedding settings when provider/model IDs are supplied.
   * Endpoint: `POST /v1/agent`
   */
  async createAgent(
    payload: CreateAgentPayload,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('POST', '/agent', { data: payload, headers });
  }

  /**
   * Create an agent by referencing provider/model names instead of IDs
   * 
   * Useful for SDK integrations that manage provider catalogs client-side.
   * Endpoint: `POST /v1/sdk/agent`
   */
  async createSdkAgent(
    payload: CreateSdkAgentPayload,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('POST', '/sdk/agent', { data: payload, headers });
  }

  /**
   * Retrieve agent details by identifier (public endpoint)
   * 
   * Endpoint: `GET /v1/agent/<agent_id>`
   */
  async getAgent(agentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/agent/${agentId}`, { headers });
  }

  /**
   * Retrieve an agent by name (case-insensitive)
   * 
   * Endpoint: `GET /v1/agent/by-name/<name>`
   */
  async getAgentByName(
    name: string,
    params?: GetAgentByNameParams,
    headers?: Record<string, string>
  ): Promise<any> {
    const encodedName = encodeURIComponent(name);
    return this.client.makeRequest('GET', `/agent/by-name/${encodedName}`, { params, headers });
  }

  /**
   * List agents that belong to the current company or to a specific company for super admins
   * 
   * Endpoint: `GET /v1/agent`
   */
  async listAgents(
    params?: ListAgentsParams,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('GET', '/agent', { params, headers });
  }

  /**
   * Replace an agent's metadata and associated LLM settings
   * 
   * Endpoint: `PUT /v1/agent/<agent_id>`
   */
  async updateAgent(
    agentId: string,
    payload: UpdateAgentPayload,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('PUT', `/agent/${agentId}`, { data: payload, headers });
  }

  /**
   * Soft-delete an agent (must have no active conversations)
   * 
   * Endpoint: `DELETE /v1/agent/<agent_id>`
   */
  async deleteAgent(agentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/agent/${agentId}`, { headers });
  }

  /**
   * Restore a soft-deleted agent
   * 
   * Endpoint: `PATCH /v1/agent/<agent_id>/restore`
   */
  async restoreAgent(agentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('PATCH', `/agent/${agentId}/restore`, { headers });
  }

  /**
   * Retrieve the embed code that powers the public chat widget for this agent
   * 
   * Endpoint: `GET /v1/agent/<agent_id>/embed-code`
   */
  async getEmbedCode(agentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/agent/${agentId}/embed-code`, { headers });
  }

  /**
   * Run a test prompt against the agent
   * 
   * Endpoint: `POST /v1/agent/<agent_id>/test`
   */
  async testAgent(
    agentId: string,
    query?: string,
    headers?: Record<string, string>
  ): Promise<any> {
    const data = query ? { query } : undefined;
    return this.client.makeRequest('POST', `/agent/${agentId}/test`, { data, headers });
  }

  /**
   * Retrieve aggregate statistics for an agent
   * 
   * Endpoint: `GET /v1/agent/<agent_id>/stats`
   */
  async getAgentStats(agentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/agent/${agentId}/stats`, { headers });
  }

  /**
   * Duplicate an agent configuration
   * 
   * Endpoint: `POST /v1/agent/<agent_id>/clone`
   */
  async cloneAgent(
    agentId: string,
    payload?: CloneAgentPayload,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('POST', `/agent/${agentId}/clone`, { 
      data: payload, 
      headers 
    });
  }

  /**
   * Download the public widget JavaScript bundle
   * 
   * Endpoint: `GET /widget.js`
   */
  async fetchWidgetScript(headers?: Record<string, string>): Promise<string> {
    const response = await this.client.makeRequest<string>('GET', '/widget.js', { headers });
    return typeof response === 'string' ? response : JSON.stringify(response);
  }

  /**
   * Request the internal widget test page
   * 
   * Endpoint: `POST /test`
   */
  async renderTestPage(
    bodyHtml: string,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('POST', '/test', { 
      data: { body: bodyHtml }, 
      headers 
    });
  }
}
