
// src/services/settings.ts
import { KnowrithmClient } from '../client';

export class SettingsService {
  constructor(private client: KnowrithmClient) {}

  async createSettings(payload: {
    llm_provider_id: string;
    llm_model_id: string;
    embedding_provider_id: string;
    embedding_model_id: string;
    agent_id?: string;
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
    is_default?: boolean;
  }, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/settings', { data: payload, headers });
  }

  async updateSettings(
    settingsId: string,
    payload: Partial<{
      llm_provider_id: string;
      llm_model_id: string;
      embedding_provider_id: string;
      embedding_model_id: string;
      agent_id: string;
      llm_api_key: string;
      llm_api_base_url: string;
      llm_temperature: number;
      llm_max_tokens: number;
      llm_additional_params: Record<string, any>;
      embedding_api_key: string;
      embedding_api_base_url: string;
      embedding_dimension: number;
      embedding_additional_params: Record<string, any>;
      widget_script_url: string;
      widget_config: Record<string, any>;
      is_default: boolean;
    }>,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('PUT', `/settings/${settingsId}`, { data: payload, headers });
  }

  async getSettings(settingsId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/settings/${settingsId}`, { headers });
  }

  async listCompanySettings(companyId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/settings/company/${companyId}`, { headers });
  }

  async listAgentSettings(agentId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/settings/agent/${agentId}`, { headers });
  }

  async deleteSettings(settingsId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/settings/${settingsId}`, { headers });
  }

  async testSettings(
    settingsId: string,
    overrides?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('POST', `/settings/test/${settingsId}`, { data: overrides, headers });
  }

  async listSettingsProviders(headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/settings/providers', { headers });
  }

  async seedSettingsProviders(overrides?: Record<string, any>, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/settings/providers/seed', { data: overrides, headers });
  }
}

export class ProviderService {
  constructor(private client: KnowrithmClient) {}

  async createProvider(payload: {
    name: string;
    type: string;
    description?: string;
    api_base_url?: string;
    pricing?: Record<string, any>;
    status?: string;
  }, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/providers', { data: payload, headers });
  }

  async updateProvider(
    providerId: string,
    payload: Partial<{
      name: string;
      type: string;
      description: string;
      api_base_url: string;
      pricing: Record<string, any>;
      status: string;
    }>,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('PUT', `/providers/${providerId}`, { data: payload, headers });
  }

  async deleteProvider(providerId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/providers/${providerId}`, { headers });
  }

  async listProviders(params?: Record<string, any>, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', '/providers', { params, headers });
  }

  async getProvider(providerId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/providers/${providerId}`, { headers });
  }

  async bulkImportProviders(payload: Record<string, any>, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('POST', '/providers/bulk-import', { data: payload, headers });
  }

  async createModel(
    providerId: string,
    payload: {
      name: string;
      type: string;
      provider_model_id?: string;
      context_window?: number;
      input_price?: number;
      output_price?: number;
      currency?: string;
      embedding_dimension?: number;
      status?: string;
    },
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('POST', `/providers/${providerId}/models`, { data: payload, headers });
  }

  async updateModel(
    providerId: string,
    modelId: string,
    payload: Partial<{
      name: string;
      type: string;
      provider_model_id: string;
      context_window: number;
      input_price: number;
      output_price: number;
      currency: string;
      embedding_dimension: number;
      status: string;
    }>,
    headers?: Record<string, string>
  ): Promise<any> {
    return this.client.makeRequest('PUT', `/providers/${providerId}/models/${modelId}`, { 
      data: payload, 
      headers 
    });
  }

  async deleteModel(providerId: string, modelId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('DELETE', `/providers/${providerId}/models/${modelId}`, { headers });
  }

  async listModels(providerId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/providers/${providerId}/models`, { headers });
  }

  async getModel(providerId: string, modelId: string, headers?: Record<string, string>): Promise<any> {
    return this.client.makeRequest('GET', `/providers/${providerId}/models/${modelId}`, { headers });
  }
}