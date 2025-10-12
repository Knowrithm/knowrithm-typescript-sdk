// src/services/agent.ts
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

export interface UpdateAgentPayload extends Partial<CreateAgentPayload> {}

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
export class AgentService {
  constructor(private client: KnowrithmClient) {}

  /**
   * Create a new agent bound to the authenticated company
   * 
   * Endpoint: `POST /v1/agent`
   */
  async createAgent(
    payload: CreateAgentPayload,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('POST', '/agent', { data: payload, headers });
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