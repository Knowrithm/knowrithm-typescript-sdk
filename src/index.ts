
// src/index.ts
// Main client
export { KnowrithmClient } from './client';

// Configuration
export { KnowrithmConfig } from './config';

// Errors
export { KnowrithmAPIError } from './errors';

// Services
export { AuthService, ApiKeyService, UserService } from './services/auth';
export { AgentService } from './services/agent';
export { CompanyService } from './services/company';
export { ConversationService, MessageService, MessageStream, ChatEvent } from './services/conversation';
export { DocumentService } from './services/document';
export { DatabaseService } from './services/database';
export { AnalyticsService } from './services/analytics';
export { AddressService } from './services/address';
export { AdminService } from './services/admin';
export { SettingsService, ProviderService } from './services/settings';
export { LeadService } from './services/lead';
export { WebsiteService } from './services/website';

// High-level wrappers
export { KnowrithmAgent } from './wrappers/agent';
export { KnowrithmCompany } from './wrappers/company';
export { KnowrithmConversation } from './wrappers/conversation';

// Service payload types
export type {
  CreateAgentPayload,
  CreateSdkAgentPayload,
  SdkAgentSettingsPayload,
  UpdateAgentPayload,
  ListAgentsParams,
  CloneAgentPayload,
  GetAgentByNameParams,
} from './services/agent';
export type {
  CreateSettingsPayload,
  CreateSdkSettingsPayload,
  UpdateSettingsPayload,
} from './services/settings';
export type {
  ConversationStatusFilter,
  ListEntityConversationsParams,
  ListAgentConversationsParams,
} from './services/conversation';
export type {
  WebsiteSource,
  WebsitePage,
  WebsiteCrawlStatus,
  WebsitePageStatus,
  RegisterWebsiteSourcePayload,
  ListWebsiteSourcesParams,
  ListWebsiteSourcesResponse,
  ListWebsitePagesResponse,
  TriggerWebsiteCrawlPayload,
  TriggerWebsiteCrawlResponse,
  WebsiteHandshakePayload,
  WebsiteHandshakeResponse,
} from './services/website';

// Types and enums
export * from './types/enums';
export * from './types/auth';
export * from './types/common';
export type {
  UploadDocumentsOptions,
  UploadDocumentsResponse,
  UploadedDocument,
  UploadDocumentsFileDescriptor,
  UploadDocumentsLegacyFileDescriptor,
  UploadDocumentsRequestOptions,
} from './types/document';
