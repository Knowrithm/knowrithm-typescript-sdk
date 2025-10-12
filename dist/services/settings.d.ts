import { KnowrithmClient } from '../client';
export declare class SettingsService {
    private client;
    constructor(client: KnowrithmClient);
    createSettings(payload: {
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
    }, headers?: Record<string, string>): Promise<any>;
    updateSettings(settingsId: string, payload: Partial<{
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
    }>, headers?: Record<string, string>): Promise<any>;
    getSettings(settingsId: string, headers?: Record<string, string>): Promise<any>;
    listCompanySettings(companyId: string, headers?: Record<string, string>): Promise<any>;
    listAgentSettings(agentId: string, headers?: Record<string, string>): Promise<any>;
    deleteSettings(settingsId: string, headers?: Record<string, string>): Promise<any>;
    testSettings(settingsId: string, overrides?: Record<string, any>, headers?: Record<string, string>): Promise<any>;
    listSettingsProviders(headers?: Record<string, string>): Promise<any>;
    seedSettingsProviders(overrides?: Record<string, any>, headers?: Record<string, string>): Promise<any>;
}
export declare class ProviderService {
    private client;
    constructor(client: KnowrithmClient);
    createProvider(payload: {
        name: string;
        type: string;
        description?: string;
        api_base_url?: string;
        pricing?: Record<string, any>;
        status?: string;
    }, headers?: Record<string, string>): Promise<any>;
    updateProvider(providerId: string, payload: Partial<{
        name: string;
        type: string;
        description: string;
        api_base_url: string;
        pricing: Record<string, any>;
        status: string;
    }>, headers?: Record<string, string>): Promise<any>;
    deleteProvider(providerId: string, headers?: Record<string, string>): Promise<any>;
    listProviders(params?: Record<string, any>, headers?: Record<string, string>): Promise<any>;
    getProvider(providerId: string, headers?: Record<string, string>): Promise<any>;
    bulkImportProviders(payload: Record<string, any>, headers?: Record<string, string>): Promise<any>;
    createModel(providerId: string, payload: {
        name: string;
        type: string;
        provider_model_id?: string;
        context_window?: number;
        input_price?: number;
        output_price?: number;
        currency?: string;
        embedding_dimension?: number;
        status?: string;
    }, headers?: Record<string, string>): Promise<any>;
    updateModel(providerId: string, modelId: string, payload: Partial<{
        name: string;
        type: string;
        provider_model_id: string;
        context_window: number;
        input_price: number;
        output_price: number;
        currency: string;
        embedding_dimension: number;
        status: string;
    }>, headers?: Record<string, string>): Promise<any>;
    deleteModel(providerId: string, modelId: string, headers?: Record<string, string>): Promise<any>;
    listModels(providerId: string, headers?: Record<string, string>): Promise<any>;
    getModel(providerId: string, modelId: string, headers?: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=settings.d.ts.map