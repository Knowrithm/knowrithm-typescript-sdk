# Knowrithm TypeScript SDK

[![npm version](https://badge.fury.io/js/%40knowrithm%2Fsdk.svg)](https://badge.fury.io/js/%40knowrithm%2Fsdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

The Knowrithm TypeScript SDK provides a comprehensive, type-safe interface for interacting with the Knowrithm platform. It wraps every documented API route with typed helpers, covers authentication primitives, and includes pragmatic conveniences such as automatic retries, streaming support, and multipart upload handling.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Service Reference](#service-reference)
  - [AuthService](#authservice)
  - [ApiKeyService](#apikeyservice)
  - [UserService](#userservice)
  - [AddressService](#addressservice)
  - [AdminService](#adminservice)
  - [AgentService](#agentservice)
  - [AnalyticsService](#analyticsservice)
  - [CompanyService](#companyservice)
  - [DatabaseService](#databaseservice)
  - [DocumentService](#documentservice)
  - [ConversationService & MessageService](#conversationservice--messageservice)
  - [LeadService](#leadservice)
  - [LLMSettingsService](#llmsettingsservice)
  - [ProviderService](#providerservice)
- [High-Level Wrappers](#high-level-wrappers)
- [Streaming Messages](#streaming-messages)
- [File Uploads](#file-uploads)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)
- [Configuration](#configuration)
- [Examples](#examples)
- [Browser and Node.js Usage](#browser-and-nodejs-usage)
- [Support](#support)
- [License](#license)

---

## Installation

```bash
npm install @knowrithm/sdk
# or
yarn add @knowrithm/sdk
# or
pnpm add @knowrithm/sdk
```

For local development:

```bash
git clone https://github.com/Knowrithm/knowrithm-sdk-ts.git
cd knowrithm-sdk-ts
npm install
npm run build
```

---

## Quick Start

```typescript
import { KnowrithmClient } from '@knowrithm/sdk';

// Initialize the client with API credentials
const client = new KnowrithmClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});

// Create an agent
const agent = await client.agents.createAgent({
  name: 'Support Bot',
  description: 'Customer support assistant',
  status: 'active',
});

console.log('Agent ID:', agent.agent.id);

// Upload supporting documents
await client.documents.uploadDocuments(agent.agent.id, {
  filePaths: [{ file: documentBuffer, filename: 'knowledge-base.pdf' }],
});

// Start a conversation and send a message
const conversation = await client.conversations.createConversation(agent.agent.id);
const queued = await client.messages.sendMessage(
  conversation.conversation.id,
  'Hello there!'
);

console.log('Status:', queued.status);        // -> "queued"
console.log('Poll URL:', queued.poll_url);    // -> "/v1/conversation/<id>/messages"

// Poll for new messages once the task completes
const messages = await client.conversations.listConversationMessages(
  conversation.conversation.id
);

messages.messages?.forEach((entry) => {
  console.log(`${entry.role}: ${entry.content}`);
});
```

---

## Authentication

The SDK supports two primary authentication methods:

### API Key Authentication (Default)

Recommended for server-to-server communication. Requires both API key and secret with appropriate scopes.

```typescript
const client = new KnowrithmClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});
```

### JWT Authentication

Use JWT tokens for user-specific operations. You can either set tokens globally or pass them per request.

```typescript
// Login to obtain JWT tokens
const authResponse = await client.auth.login('user@example.com', 'password');
const accessToken = authResponse.access_token;

// Option 1: Pass JWT in headers for individual requests
const headers = { Authorization: `Bearer ${accessToken}` };
const user = await client.auth.getCurrentUser(headers);

// Option 2: Refresh token when expired
const refreshed = await client.auth.refreshAccessToken(authResponse.refresh_token);
```

> **Note**: Unless a route explicitly states otherwise, supply either `X-API-Key` + `X-API-Secret` with proper scopes or `Authorization: Bearer <JWT>`. All service methods accept an optional `headers` parameter for custom authentication.

---

## Service Reference

Each service is accessible through the `KnowrithmClient` instance (e.g., `client.agents`). Every method forwards to the documented REST endpoint and returns a typed response.

### AuthService (`client.auth`)

Handles user authentication, registration, and session management.

#### Methods

- **`seedSuperAdmin(headers?)`** - `GET /v1/auth/super-admin`
  - Seeds the platform super admin from environment variables
  - Public endpoint, no authentication required
  - Returns: `Promise<any>`

- **`registerAdmin(payload, headers?)`** - `POST /v1/auth/register`
  - Public registration for a company admin
  - Payload: `{ company_id, email, username, password, first_name, last_name }`
  - Returns: `Promise<any>`

- **`login(email, password, headers?)`** - `POST /v1/auth/login`
  - Authenticates user and returns JWT tokens
  - Returns: `Promise<AuthResponse>` with `access_token` and `refresh_token`

- **`refreshAccessToken(refreshToken, headers?)`** - `POST /v1/auth/refresh`
  - Exchanges refresh token for new access token
  - Pass `Authorization: Bearer <refresh JWT>` in headers
  - Returns: `Promise<{ access_token: string }>`

- **`logout(headers)`** - `POST /v1/auth/logout`
  - Revokes the current JWT session
  - Requires authentication
  - Returns: `Promise<void>`

- **`sendVerificationEmail(email, headers?)`** - `POST /v1/send`
  - Initiates email verification flow
  - Public endpoint
  - Returns: `Promise<any>`

- **`verifyEmail(token, headers?)`** - `POST /v1/verify`
  - Confirms email ownership with verification token
  - Returns: `Promise<any>`

- **`getCurrentUser(headers)`** - `GET /v1/auth/user/me`
  - Returns authenticated user with active company
  - Requires JWT authentication
  - Returns: `Promise<{ user: User; company: Company }>`

- **`createUser(payload, headers?)`** - `POST /v1/auth/user`
  - Admin-only user creation
  - Payload: `{ email, username, password, company_id? }`
  - Returns: `Promise<{ user: User }>`

---

### ApiKeyService (`client.api_keys`)

Manages API key lifecycle and usage analytics.

#### Methods

- **`createApiKey(payload, headers?)`** - `POST /v1/auth/api-keys`
  - Creates new API key for authenticated user
  - Payload: `{ name?, scopes?, permissions?, expires_at? }`
  - Returns: `Promise<{ api_key: ApiKey; secret: string }>`

- **`listApiKeys(headers)`** - `GET /v1/auth/api-keys`
  - Lists all active API keys owned by user
  - Returns: `Promise<{ api_keys: ApiKey[] }>`

- **`deleteApiKey(apiKeyId, headers)`** - `DELETE /v1/auth/api-keys/<id>`
  - Revokes an API key permanently
  - Returns: `Promise<void>`

- **`validateCredentials(headers)`** - `GET /v1/auth/validate`
  - Validates current credentials and returns metadata
  - Returns: `Promise<{ valid: boolean; metadata: any }>`

- **`getApiKeyOverview(days?, headers?)`** - `GET /v1/overview`
  - High-level analytics for API key usage
  - Parameters: `days` (default: 30)
  - Returns: `Promise<ApiKeyOverview>`

- **`getUsageTrends(days?, granularity?, headers?)`** - `GET /v1/usage-trends`
  - Returns usage patterns by day/hour
  - Parameters: `days`, `granularity` ('daily' | 'hourly')
  - Returns: `Promise<UsageTrend[]>`

- **`getTopEndpoints(days?, headers?)`** - `GET /v1/top-endpoints`
  - Most frequently used endpoints per company
  - Returns: `Promise<EndpointUsage[]>`

- **`getApiKeyPerformance(days?, headers?)`** - `GET /v1/api-key-performance`
  - Performance metrics grouped by key
  - Returns: `Promise<KeyPerformance[]>`

- **`getErrorAnalysis(days?, headers?)`** - `GET /v1/error-analysis`
  - Error distribution and status codes
  - Returns: `Promise<ErrorAnalysis>`

- **`getRateLimitAnalysis(days?, headers?)`** - `GET /v1/rate-limit-analysis`
  - Rate limit consumption overview
  - Returns: `Promise<RateLimitAnalysis>`

- **`getDetailedUsage(apiKeyId, days?, headers?)`** - `GET /v1/detailed-usage/<id>`
  - Fine-grained request logs for specific key
  - Returns: `Promise<DetailedUsageLog[]>`

---

### UserService (`client.users`)

User profile management operations.

#### Methods

- **`getProfile(headers)`** - `GET /v1/user/profile`
  - Returns authenticated user's profile
  - Returns: `Promise<UserProfile>`

- **`updateProfile(payload, headers)`** - `PUT /v1/user/profile`
  - Updates user profile fields
  - Payload: `{ first_name?, last_name?, timezone?, language?, preferences? }`
  - Returns: `Promise<UserProfile>`

- **`getUser(userId, headers)`** - `GET /v1/user/<user_id>`
  - Fetches another user's details (admin only)
  - Returns: `Promise<User>`

---

### AddressService (`client.addresses`)

Geographic data and company address management.

#### Methods

- **`seedReferenceData(headers?)`** - `GET /v1/address-seed`
  - Populates countries, states, and cities reference data
  - Public endpoint
  - Returns: `Promise<{ message: string }>`

- **`createCountry(name, isoCode?, headers?)`** - `POST /v1/country`
  - Admin-only country creation
  - Returns: `Promise<Country>`

- **`listCountries(headers?)`** - `GET /v1/country`
  - Fetches all countries
  - Returns: `Promise<Country[]>`

- **`getCountry(countryId, headers?)`** - `GET /v1/country/<id>`
  - Returns country with nested states
  - Returns: `Promise<CountryWithStates>`

- **`updateCountry(countryId, name?, isoCode?, headers?)`** - `PATCH /v1/country/<id>`
  - Updates country information
  - Returns: `Promise<Country>`

- **`createState(name, countryId, headers?)`** - `POST /v1/state`
  - Admin-only state creation
  - Returns: `Promise<State>`

- **`listStatesByCountry(countryId, headers?)`** - `GET /v1/state/country/<country_id>`
  - Lists all states in a country
  - Returns: `Promise<State[]>`

- **`getState(stateId, headers?)`** - `GET /v1/state/<id>`
  - Returns state with nested cities
  - Returns: `Promise<StateWithCities>`

- **`updateState(stateId, name?, countryId?, headers?)`** - `PATCH /v1/state/<id>`
  - Updates state information
  - Returns: `Promise<State>`

- **`createCity(name, stateId, postalCodePrefix?, headers?)`** - `POST /v1/city`
  - Admin-only city creation
  - Returns: `Promise<City>`

- **`listCitiesByState(stateId, headers?)`** - `GET /v1/city/state/<state_id>`
  - Lists all cities in a state
  - Returns: `Promise<City[]>`

- **`getCity(cityId, headers?)`** - `GET /v1/city/<id>`
  - Returns city details
  - Returns: `Promise<City>`

- **`updateCity(cityId, name?, stateId?, postalCodePrefix?, headers?)`** - `PATCH /v1/city/<id>`
  - Updates city information
  - Returns: `Promise<City>`

- **`createAddress(address, cityId, stateId, countryId, options?, headers?)`** - `POST /v1/address`
  - Creates company address with coordinates
  - Options: `{ postal_code?, lat?, lan?, is_primary? }`
  - Admin-only
  - Returns: `Promise<Address>`

- **`getCompanyAddress(headers?)`** - `GET /v1/address`
  - Fetches authenticated company's address
  - Returns: `Promise<Address>`

---

### AdminService (`client.admin`)

Administrative operations for user and system management.

#### Methods

- **`listUsers(params?, headers?)`** - `GET /v1/admin/user` or `/v1/super-admin/company/<id>/user`
  - Lists users with filtering and pagination
  - Params: `{ company_id?, status?, role?, search?, start_date?, end_date?, page?, per_page?, sort_by?, sort_order? }`
  - Returns: `Promise<PaginatedResponse<User>>`

- **`getUser(userId, headers?)`** - `GET /v1/admin/user/<user_id>`
  - Gets detailed user information
  - Returns: `Promise<User>`

- **`getCompanySystemMetrics(companyId?, headers?)`** - `GET /v1/admin/system-metric`
  - Retrieves system performance metrics
  - Returns: `Promise<SystemMetrics>`

- **`getAuditLogs(params?, headers?)`** - `GET /v1/audit-log`
  - Fetches audit logs with filters
  - Params: `{ entity_type?, entity_id?, event_type?, user_id?, risk_level?, start_date?, end_date?, page?, limit? }`
  - Returns: `Promise<PaginatedResponse<AuditLog>>`

- **`getSystemConfiguration(headers?)`** - `GET /v1/config`
  - Reads system configuration values
  - Sensitive keys hidden from non-super-admins
  - Returns: `Promise<SystemConfig[]>`

- **`upsertSystemConfiguration(key, value, options?, headers?)`** - `PATCH /v1/config`
  - Creates or updates configuration entry
  - Options: `{ config_type?, description?, is_sensitive? }`
  - Returns: `Promise<SystemConfig>`

- **`forcePasswordReset(userId, headers?)`** - `POST /v1/user/<id>/force-password-reset`
  - Forces user to reset password on next login
  - Returns: `Promise<void>`

- **`impersonateUser(userId, headers?)`** - `POST /v1/user/<id>/impersonate`
  - Generates impersonation token for user
  - Super-admin only
  - Returns: `Promise<{ token: string }>`

- **`updateUserStatus(userId, status, reason?, headers?)`** - `PATCH /v1/user/<id>/status`
  - Updates user account status
  - Status: `'active' | 'suspended' | 'inactive'`
  - Returns: `Promise<User>`

- **`updateUserRole(userId, role, headers?)`** - `PATCH /v1/user/<id>/role`
  - Changes user role
  - Role: `'super_admin' | 'admin' | 'user' | 'viewer'`
  - Returns: `Promise<User>`

---

### AgentService (`client.agents`)

AI agent creation and management.

#### Methods

- **`createAgent(payload, headers?)`** - `POST /v1/agent`
  - Creates new AI agent
  - Payload: `{ name, description?, avatar_url?, llm_settings?, company_id? }`
  - Returns: `Promise<{ agent: Agent }>`

- **`getAgent(agentId, headers?)`** - `GET /v1/agent/<id>`
  - Retrieves agent details (public endpoint)
  - Returns: `Promise<Agent>`

- **`listAgents(params?, headers?)`** - `GET /v1/agent`
  - Lists agents with filtering
  - Params: `{ company_id?, status?, search?, page?, per_page? }`
  - Returns: `Promise<PaginatedResponse<Agent>>`

- **`updateAgent(agentId, payload, headers?)`** - `PUT /v1/agent/<id>`
  - Updates agent configuration
  - Returns: `Promise<Agent>`

- **`deleteAgent(agentId, headers?)`** - `DELETE /v1/agent/<id>`
  - Soft deletes an agent
  - Returns: `Promise<void>`

- **`restoreAgent(agentId, headers?)`** - `PATCH /v1/agent/<id>/restore`
  - Restores soft-deleted agent
  - Returns: `Promise<Agent>`

- **`getEmbedCode(agentId, headers?)`** - `GET /v1/agent/<id>/embed-code`
  - Generates widget embed code
  - Returns: `Promise<{ embed_code: string }>`

- **`testAgent(agentId, query?, headers?)`** - `POST /v1/agent/<id>/test`
  - Tests agent with sample query
  - Returns: `Promise<{ response: string }>`

- **`getAgentStats(agentId, headers?)`** - `GET /v1/agent/<id>/stats`
  - Retrieves agent usage statistics
  - Returns: `Promise<AgentStats>`

- **`cloneAgent(agentId, name?, llmSettingsId?, headers?)`** - `POST /v1/agent/<id>/clone`
  - Clones agent with optional new name
  - Returns: `Promise<Agent>`

- **`fetchWidgetScript(headers?)`** - `GET /widget.js`
  - Returns public widget JavaScript
  - Returns: `Promise<string>`

- **`renderTestPage(bodyHtml, headers?)`** - `POST /test`
  - Renders test HTML page
  - Returns: `Promise<string>`

---

### AnalyticsService (`client.analytics`)

Analytics, metrics, and data export capabilities.

#### Methods

- **`getDashboardOverview(companyId?, headers?)`** - `GET /v1/analytic/dashboard`
  - High-level dashboard metrics
  - Returns: `Promise<DashboardOverview>`

- **`getAgentAnalytics(agentId, startDate?, endDate?, headers?)`** - `GET /v1/analytic/agent/<agent_id>`
  - Detailed agent performance metrics
  - Returns: `Promise<AgentAnalytics>`

- **`getAgentPerformanceComparison(agentId, startDate?, endDate?, headers?)`** - `GET /v1/analytic/agent/<agent_id>/performance-comparison`
  - Compares agent performance over time
  - Returns: `Promise<PerformanceComparison>`

- **`getConversationAnalytics(conversationId, headers?)`** - `GET /v1/analytic/conversation/<conversation_id>`
  - Analytics for specific conversation
  - Returns: `Promise<ConversationAnalytics>`

- **`getLeadAnalytics(startDate?, endDate?, companyId?, headers?)`** - `GET /v1/analytic/leads`
  - Lead generation and conversion metrics
  - Returns: `Promise<LeadAnalytics>`

- **`getUsageMetrics(startDate?, endDate?, headers?)`** - `GET /v1/analytic/usage`
  - Platform usage statistics
  - Returns: `Promise<UsageMetrics>`

- **`searchDocuments(query, agentId, limit?, headers?)`** - `POST /v1/search/document`
  - Semantic document search
  - Returns: `Promise<DocumentSearchResult[]>`

- **`searchDatabase(query, connectionId?, headers?)`** - `POST /v1/search/database`
  - Database schema search
  - Returns: `Promise<DatabaseSearchResult[]>`

- **`triggerSystemMetricCollection(headers?)`** - `POST /v1/system-metric`
  - Manually triggers metric collection
  - Returns: `Promise<void>`

- **`exportAnalytics(exportType, exportFormat, startDate?, endDate?, headers?)`** - `POST /v1/analytic/export`
  - Exports analytics data
  - Type: `'conversations' | 'leads' | 'agents' | 'usage'`
  - Format: `'json' | 'csv'`
  - Returns: `Promise<Blob | string>`

- **`healthCheck(headers?)`** - `GET /health`
  - Public health check endpoint
  - Returns: `Promise<{ status: string }>`

---

### CompanyService (`client.companies`)

Company management and configuration.

#### Methods

- **`createCompany(payload, logoPath?, headers?)`** - `POST /v1/company`
  - Creates new company (supports multipart for logo)
  - Payload: `{ name, email, website?, phone?, industry? }`
  - Returns: `Promise<Company>`

- **`listCompanies(page?, perPage?, headers?)`** - `GET /v1/super-admin/company`
  - Lists all companies (super-admin only)
  - Returns: `Promise<PaginatedResponse<Company>>`

- **`getCompany(headers?)`** - `GET /v1/company`
  - Gets authenticated company details
  - Returns: `Promise<Company>`

- **`getCompanyStatistics(companyId?, days?, headers?)`** - `GET /v1/company/statistics`
  - Retrieves company statistics
  - Returns: `Promise<CompanyStatistics>`

- **`listDeletedCompanies(headers?)`** - `GET /v1/company/deleted`
  - Lists soft-deleted companies
  - Returns: `Promise<Company[]>`

- **`updateCompany(companyId, payload, logoPath?, headers?)`** - `PUT /v1/company/<id>`
  - Updates company (full replacement)
  - Returns: `Promise<Company>`

- **`patchCompany(companyId, payload, headers?)`** - `PATCH /v1/company/<id>`
  - Partial company update
  - Returns: `Promise<Company>`

- **`deleteCompany(companyId, headers?)`** - `DELETE /v1/company/<id>`
  - Soft deletes company
  - Returns: `Promise<void>`

- **`restoreCompany(companyId, headers?)`** - `PATCH /v1/company/<id>/restore`
  - Restores soft-deleted company
  - Returns: `Promise<Company>`

- **`cascadeDeleteCompany(companyId, deleteRelated?, headers?)`** - `DELETE /v1/company/<id>/cascade-delete`
  - Hard deletes company and optionally related data
  - Returns: `Promise<void>`

- **`getRelatedDataSummary(companyId, headers?)`** - `GET /v1/company/<id>/related-data`
  - Summarizes related entities before deletion
  - Returns: `Promise<RelatedDataSummary>`

- **`bulkDeleteCompanies(companyIds, headers?)`** - `DELETE /v1/company/bulk-delete`
  - Soft deletes multiple companies
  - Returns: `Promise<{ deleted: number }>`

- **`bulkRestoreCompanies(companyIds, headers?)`** - `PATCH /v1/company/bulk-restore`
  - Restores multiple companies
  - Returns: `Promise<{ restored: number }>`

---

### DatabaseService (`client.databases`)

Database connection management and text-to-SQL functionality.

#### Methods

- **`createConnection(name, url, databaseType, agentId, connectionParams?, headers?)`** - `POST /v1/database-connection`
  - Creates database connection
  - Database types: `'postgres' | 'mysql' | 'mongodb' | 'sqlite'`
  - Returns: `Promise<DatabaseConnection>`

- **`listConnections(params?, headers?)`** - `GET /v1/database-connection`
  - Lists database connections with filtering
  - Returns: `Promise<PaginatedResponse<DatabaseConnection>>`

- **`getConnection(connectionId, headers?)`** - `GET /v1/database-connection/<id>`
  - Gets connection details
  - Returns: `Promise<DatabaseConnection>`

- **`updateConnection(connectionId, payload, headers?)`** - `PUT /v1/database-connection/<id>`
  - Updates connection (full replacement)
  - Returns: `Promise<DatabaseConnection>`

- **`patchConnection(connectionId, updates, headers?)`** - `PATCH /v1/database-connection/<id>`
  - Partial connection update
  - Returns: `Promise<DatabaseConnection>`

- **`deleteConnection(connectionId, headers?)`** - `DELETE /v1/database-connection/<id>`
  - Soft deletes connection
  - Returns: `Promise<void>`

- **`restoreConnection(connectionId, headers?)`** - `PATCH /v1/database-connection/<id>/restore`
  - Restores deleted connection
  - Returns: `Promise<DatabaseConnection>`

- **`listDeletedConnections(headers?)`** - `GET /v1/database-connection/deleted`
  - Lists soft-deleted connections
  - Returns: `Promise<DatabaseConnection[]>`

- **`testConnection(connectionId, headers?)`** - `POST /v1/database-connection/<id>/test`
  - Tests database connectivity
  - Returns: `Promise<{ status: 'success' | 'failed'; message: string }>`

- **`analyzeConnection(connectionId, headers?)`** - `POST /v1/database-connection/<id>/analyze`
  - Analyzes schema and generates metadata
  - Returns: `Promise<SchemaAnalysis>`

- **`analyzeMultipleConnections(payload?, headers?)`** - `POST /v1/database-connection/analyze`
  - Batch analyzes multiple connections
  - Returns: `Promise<SchemaAnalysis[]>`

- **`listTables(connectionId, headers?)`** - `GET /v1/database-connection/<id>/table`
  - Lists tables in connection
  - Returns: `Promise<DatabaseTable[]>`

- **`getTable(tableId, headers?)`** - `GET /v1/database-connection/table/<table_id>`
  - Gets table details with columns
  - Returns: `Promise<DatabaseTable>`

- **`deleteTable(tableId, headers?)`** - `DELETE /v1/database-connection/table/<table_id>`
  - Soft deletes table metadata
  - Returns: `Promise<void>`

- **`deleteTablesForConnection(connectionId, headers?)`** - `DELETE /v1/database-connection/<id>/table`
  - Deletes all tables for connection
  - Returns: `Promise<{ deleted: number }>`

- **`restoreTable(tableId, headers?)`** - `PATCH /v1/database-connection/table/<table_id>/restore`
  - Restores deleted table
  - Returns: `Promise<DatabaseTable>`

- **`listDeletedTables(headers?)`** - `GET /v1/database-connection/table/deleted`
  - Lists soft-deleted tables
  - Returns: `Promise<DatabaseTable[]>`

- **`getSemanticSnapshot(connectionId, headers?)`** - `GET /v1/database-connection/<id>/semantic-snapshot`
  - Gets semantic understanding of schema
  - Returns: `Promise<SemanticSnapshot>`

- **`getKnowledgeGraph(connectionId, headers?)`** - `GET /v1/database-connection/<id>/knowledge-graph`
  - Returns relationship graph
  - Returns: `Promise<KnowledgeGraph>`

- **`getSampleQueries(connectionId, headers?)`** - `GET /v1/database-connection/<id>/sample-queries`
  - Generates sample natural language queries
  - Returns: `Promise<SampleQuery[]>`

- **`textToSql(connectionId, question, execute?, resultLimit?, headers?)`** - `POST /v1/database-connection/<id>/text-to-sql`
  - Converts natural language to SQL
  - Parameters: `execute` (boolean), `resultLimit` (number)
  - Returns: `Promise<{ sql: string; results?: any[]; explanation: string }>`

- **`exportConnection(connectionId, headers?)`** - `POST /v1/database-connection/export`
  - Exports connection configuration
  - Returns: `Promise<string>`

---

### ConversationService (`client.conversations`) & MessageService (`client.messages`)

Conversation lifecycle and message handling.

#### ConversationService Methods

- **`createConversation(agentId, title?, metadata?, maxContextLength?, headers?)`** - `POST /v1/conversation`
  - Creates new conversation
  - Returns: `Promise<{ conversation: Conversation }>`

- **`listConversations(page?, perPage?, headers?)`** - `GET /v1/conversation`
  - Lists conversations with pagination
  - Returns: `Promise<PaginatedResponse<Conversation>>`

- **`listConversationsForEntity(page?, perPage?, headers?)`** - `GET /v1/conversation/entity`
  - Lists conversations for current entity
  - Returns: `Promise<PaginatedResponse<Conversation>>`

- **`listDeletedConversations(headers?)`** - `GET /v1/conversation/deleted`
  - Lists soft-deleted conversations
  - Returns: `Promise<Conversation[]>`

- **`listConversationMessages(conversationId, page?, perPage?, headers?)`** - `GET /v1/conversation/<id>/messages`
  - Lists messages in conversation
  - Returns: `Promise<PaginatedResponse<Message>>`

- **`deleteConversation(conversationId, headers?)`** - `DELETE /v1/conversation/<id>`
  - Soft deletes conversation
  - Returns: `Promise<void>`

- **`deleteConversationMessages(conversationId, headers?)`** - `DELETE /v1/conversation/<id>/messages`
  - Deletes all messages in conversation
  - Returns: `Promise<{ deleted: number }>`

- **`restoreConversation(conversationId, headers?)`** - `PATCH /v1/conversation/<id>/restore`
  - Restores deleted conversation
  - Returns: `Promise<Conversation>`

- **`restoreAllMessages(conversationId, headers?)`** - `PATCH /v1/conversation/<id>/message/restore-all`
  - Restores all deleted messages
  - Returns: `Promise<{ restored: number }>`

#### MessageService Methods

- **`sendMessage(conversationId, message, options?)`** - `POST /v1/conversation/<id>/chat`
  - Sends message to agent
  - Options: `{ headers?, stream?, stream_url?, stream_timeout?, event_types?, raw_events? }`
  - Returns: `Promise<MessageResponse>` or `MessageStream` if streaming
  
- **`streamConversationMessages(conversationId, options?)`** - `GET /v1/conversation/<id>/messages/stream`
  - Opens SSE stream for conversation updates
  - Returns: `MessageStream`

- **`deleteMessage(messageId, headers?)`** - `DELETE /v1/message/<id>`
  - Soft deletes a message
  - Returns: `Promise<void>`

- **`restoreMessage(messageId, headers?)`** - `PATCH /v1/message/<id>/restore`
  - Restores deleted message
  - Returns: `Promise<Message>`

- **`listDeletedMessages(headers?)`** - `GET /v1/message/deleted`
  - Lists all soft-deleted messages
  - Returns: `Promise<Message[]>`

---

### LeadService (`client.leads`)

Lead capture and management for the widget.

#### Methods

- **`registerLead(payload, headers?)`** - `POST /v1/lead/register`
  - Public widget registration endpoint
  - Payload: `{ agent_id, first_name, last_name, email, phone?, consent_marketing?, consent_data_processing? }`
  - Returns: `Promise<Lead>`

- **`createLead(payload, headers?)`** - `POST /v1/lead`
  - Admin-created lead
  - Returns: `Promise<Lead>`

- **`getLead(leadId, headers?)`** - `GET /v1/lead/<id>`
  - Gets lead details
  - Returns: `Promise<Lead>`

- **`listCompanyLeads(page?, perPage?, status?, search?, headers?)`** - `GET /v1/lead/company`
  - Lists company leads with filtering
  - Status: `'new' | 'contacted' | 'qualified' | 'converted' | 'lost'`
  - Returns: `Promise<PaginatedResponse<Lead>>`

- **`updateLead(leadId, payload, headers?)`** - `PUT /v1/lead/<id>`
  - Updates lead information
  - Returns: `Promise<Lead>`

- **`deleteLead(leadId, headers?)`** - `DELETE /v1/lead/<id>`
  - Soft deletes lead
  - Returns: `Promise<void>`

---

### LLMSettingsService (`client.settings`)

LLM configuration and model settings.

#### Methods

- **`createSettings(payload, headers?)`** - `POST /v1/llm-settings`
  - Creates LLM configuration
  - Payload: `{ llm_provider_id, llm_model_id, embedding_provider_id, embedding_model_id, llm_temperature?, llm_max_tokens?, agent_id? }`
  - Returns: `Promise<LLMSettings>`

- **`getSettings(settingsId, headers?)`** - `GET /v1/llm-settings/<id>`
  - Retrieves settings configuration
  - Returns: `Promise<LLMSettings>`

- **`listSettings(headers?)`** - `GET /v1/llm-settings`
  - Lists all LLM settings
  - Returns: `Promise<LLMSettings[]>`

- **`updateSettings(settingsId, payload, headers?)`** - `PUT /v1/llm-settings/<id>`
  - Updates LLM settings
  - Returns: `Promise<LLMSettings>`

- **`deleteSettings(settingsId, headers?)`** - `DELETE /v1/llm-settings/<id>`
  - Deletes settings configuration
  - Returns: `Promise<void>`

- **`testSettings(settingsId, headers?)`** - `POST /v1/llm-settings/<id>/test`
  - Tests LLM configuration
  - Returns: `Promise<{ status: string; response: string }>`

---

### ProviderService (`client.providers`)

LLM and embedding provider management.

#### Methods

- **`listProviders(headers?)`** - `GET /v1/provider`
  - Lists all available providers
  - Returns: `Promise<Provider[]>`

- **`getProvider(providerId, headers?)`** - `GET /v1/provider/<id>`
  - Gets provider details with models
  - Returns: `Promise<ProviderWithModels>`

- **`createProvider(payload, headers?)`** - `POST /v1/provider`
  - Creates custom provider (admin only)
  - Returns: `Promise<Provider>`

- **`updateProvider(providerId, payload, headers?)`** - `PUT /v1/provider/<id>`
  - Updates provider configuration
  - Returns: `Promise<Provider>`

- **`deleteProvider(providerId, headers?)`** - `DELETE /v1/provider/<id>`
  - Deletes provider
  - Returns: `Promise<void>`

- **`listModels(providerId?, headers?)`** - `GET /v1/model`
  - Lists models, optionally filtered by provider
  - Returns: `Promise<Model[]>`

- **`getModel(modelId, headers?)`** - `GET /v1/model/<id>`
  - Gets model details
  - Returns: `Promise<Model>`

- **`createModel(providerId, payload, headers?)`** - `POST /v1/provider/<provider_id>/model`
  - Creates custom model
  - Payload: `{ name, type, context_window, input_price, output_price, currency }`
  - Returns: `Promise<Model>`

- **`updateModel(modelId, payload, headers?)`** - `PUT /v1/model/<id>`
  - Updates model configuration
  - Returns: `Promise<Model>`

- **`deleteModel(modelId, headers?)`** - `DELETE /v1/model/<id>`
  - Deletes model
  - Returns: `Promise<void>`

---

## High-Level Wrappers

The SDK provides convenient wrapper classes for common workflows that combine multiple API calls.

### KnowrithmAgent

High-level interface for agent interactions.

```typescript
import { KnowrithmAgent } from '@knowrithm/sdk';

const agent = new KnowrithmAgent(client, 'agent-id');

// Chat with the agent (creates conversation automatically)
const response = await agent.chat('What are your business hours?');
console.log(response);

// Get agent details
const details = await agent.getDetails();

// Get performance metrics
const metrics = await agent.getMetrics();

// List conversations
const conversations = await agent.getConversations(20); // limit: 20

// Clone the agent
const clonedAgent = await agent.clone('New Agent Name');

// Upload documents
await agent.uploadDocuments([
  { file: buffer, filename: 'doc.pdf' }
]);

// Test agent
const testResult = await agent.test('Sample query');
```

### KnowrithmCompany

Company-level operations wrapper.

```typescript
import { KnowrithmCompany } from '@knowrithm/sdk';

const company = new KnowrithmCompany(client, 'company-id');

// Create an agent
const agent = await company.createAgent('Support Bot', 'Handles customer queries');

// List all agents
const agents = await company.listAgents();

// Create a lead
const lead = await company.createLead({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
});

// Get company analytics
const analytics = await company.getAnalytics();

// Get statistics
const stats = await company.getStatistics(30); // last 30 days
```

### KnowrithmConversation

Conversation management wrapper.

```typescript
import { KnowrithmConversation } from '@knowrithm/sdk';

const conversation = new KnowrithmConversation(client, 'conversation-id');

// Send a message
const response = await conversation.sendMessage('Hello!');

// Get message history
const messages = await conversation.getMessages();

// Stream messages in real-time
const stream = await conversation.streamMessages();

for await (const event of stream) {
  console.log('Event:', event.event);
  console.log('Data:', event.data);
}

// Delete conversation
await conversation.delete();
```

---

## Streaming Messages

The SDK supports Server-Sent Events (SSE) for real-time message streaming. Configure the stream endpoint in the client or pass it per request.

### Configuration

```typescript
import { KnowrithmClient, KnowrithmConfig } from '@knowrithm/sdk';

const client = new KnowrithmClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  config: {
    streamPathTemplate: '/conversation/{conversation_id}/messages/stream',
    streamTimeout: 60000, // 60 seconds
  },
});
```

### Using Async Iterators

```typescript
const conversation = await client.conversations.createConversation('agent-id');

const stream = await client.messages.sendMessage(
  conversation.conversation.id,
  'Tell me a story',
  { stream: true }
);

console.log('Streaming response...');

for await (const event of stream) {
  if (event.event === 'message') {
    process.stdout.write(event.data.content || '');
  } else if (event.event === 'chat_status') {
    console.log('Status:', event.data.status);
  } else if (event.event === 'error') {
    console.error('Error:', event.data);
  }
}

console.log('\nStream completed');
```

### Using Event Listeners

```typescript
const stream = await client.messages.sendMessage(
  conversationId,
  'Hello',
  { stream: true }
);

stream.on('message', (data) => {
  console.log('Message chunk:', data);
});

stream.on('chat_status', (data) => {
  console.log('Status update:', data.status);
});

stream.on('chat_response', (data) => {
  console.log('Final response:', data);
});

stream.on('error', (error) => {
  console.error('Stream error:', error);
});

stream.on('end', () => {
  console.log('Stream ended');
});

// Clean up when done
stream.close();
```

### Direct Stream Access

```typescript
// Open stream without sending a message
const stream = await client.messages.streamConversationMessages(
  conversationId,
  {
    event_types: ['message', 'chat_status', 'chat_response'],
    raw_events: false, // Parse events automatically
  }
);

for await (const event of stream) {
  console.log(event);
}
```

### Fallback to Polling

If SSE returns 503 (streaming disabled), fall back to polling:

```typescript
try {
  const stream = await client.messages.sendMessage(
    conversationId,
    message,
    { stream: true }
  );
  
  for await (const event of stream) {
    // Handle events
  }
} catch (error) {
  if (error.statusCode === 503) {
    // Fall back to polling
    const queued = await client.messages.sendMessage(conversationId, message);
    
    // Poll for completion
    let messages;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      messages = await client.conversations.listConversationMessages(conversationId);
    } while (messages.messages?.[0]?.status === 'processing');
    
    console.log('Response:', messages.messages?.[0]?.content);
  }
}
```

---

## File Uploads

Upload documents to agents for knowledge base enhancement.

### Upload from File System (Node.js)

```typescript
import fs from 'fs';
import { KnowrithmClient } from '@knowrithm/sdk';

const client = new KnowrithmClient({
  apiKey: process.env.KNOWRITHM_API_KEY!,
  apiSecret: process.env.KNOWRITHM_API_SECRET!,
});

// Single file
const fileBuffer = fs.readFileSync('document.pdf');
const result = await client.documents.uploadDocuments('agent-id', {
  filePaths: [
    { file: fileBuffer, filename: 'document.pdf' }
  ],
  metadata: {
    tags: ['support', 'faq'],
    source: 'manual_upload',
  },
});

console.log('Upload result:', result);

// Multiple files
const files = ['doc1.pdf', 'doc2.pdf', 'doc3.pdf'].map(filename => ({
  file: fs.readFileSync(filename),
  filename,
}));

await client.documents.uploadDocuments('agent-id', {
  filePaths: files,
  metadata: { category: 'knowledge_base' },
});
```

### Upload from URLs

```typescript
const result = await client.documents.uploadDocuments('agent-id', {
  urls: [
    'https://example.com/doc.pdf',
    'https://example.com/guide.pdf',
  ],
  metadata: {
    source: 'web',
    imported_at: new Date().toISOString(),
  },
});
```

### Browser File Upload

```typescript
// In a React/Vue/Angular component
async function handleFileUpload(files: FileList, agentId: string) {
  const fileArray = Array.from(files).map(file => ({
    file,
    filename: file.name,
  }));

  try {
    const result = await client.documents.uploadDocuments(agentId, {
      filePaths: fileArray,
      metadata: { uploaded_by: 'user' },
    });
    
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### Mixed Upload (Files + URLs)

```typescript
const fileBuffer = fs.readFileSync('local.pdf');

await client.documents.uploadDocuments('agent-id', {
  filePaths: [
    { file: fileBuffer, filename: 'local.pdf' }
  ],
  urls: ['https://example.com/remote.pdf'],
  metadata: {
    batch_id: 'batch-123',
  },
});
```

---

## Error Handling

All service methods throw `KnowrithmAPIError` when the API returns a non-success status or when requests fail after retries.

### Basic Error Handling

```typescript
import { KnowrithmAPIError } from '@knowrithm/sdk';

try {
  const agent = await client.agents.getAgent('invalid-id');
} catch (error) {
  if (error instanceof KnowrithmAPIError) {
    console.error('API Error:', {
      status: error.statusCode,
      code: error.errorCode,
      message: error.message,
      data: error.responseData,
    });
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Handling Specific Error Codes

```typescript
try {
  await client.agents.createAgent({ name: 'Test Agent' });
} catch (error) {
  if (error instanceof KnowrithmAPIError) {
    switch (error.statusCode) {
      case 400:
        console.error('Validation error:', error.responseData);
        break;
      case 401:
        console.error('Authentication failed');
        // Refresh token or re-authenticate
        break;
      case 403:
        console.error('Insufficient permissions');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 429:
        console.error('Rate limit exceeded');
        // Implement backoff strategy
        break;
      case 500:
        console.error('Server error');
        // Retry or alert monitoring
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

### Retry Logic

The SDK includes automatic retry logic for transient failures. Configure retry behavior:

```typescript
const client = new KnowrithmClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  config: {
    maxRetries: 3,
    retryBackoffFactor: 1.5, // Exponential backoff
    timeout: 30000, // 30 seconds
  },
});
```

### Global Error Handler

```typescript
async function withErrorHandler<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof KnowrithmAPIError) {
      console.error(`${context} failed:`, {
        status: error.statusCode,
        message: error.message,
      });
      
      // Log to monitoring service
      // logToMonitoring(context, error);
    }
    return null;
  }
}

// Usage
const agent = await withErrorHandler(
  () => client.agents.getAgent('agent-id'),
  'Get Agent'
);
```

---

## TypeScript Types

The SDK is fully typed with comprehensive TypeScript definitions.

### Enums

```typescript
import {
  AgentStatus,
  ConversationStatus,
  DocumentStatus,
  UserStatus,
  UserRole,
  EntityType,
  DatabaseType,
  LeadStatus,
} from '@knowrithm/sdk';

// Agent statuses
const status: AgentStatus = AgentStatus.ACTIVE;
// Values: ACTIVE, INACTIVE, ARCHIVED, DELETED

// User roles
const role: UserRole = UserRole.ADMIN;
// Values: SUPER_ADMIN, ADMIN, USER, VIEWER

// Database types
const dbType: DatabaseType = DatabaseType.POSTGRESQL;
// Values: POSTGRESQL, MYSQL, MONGODB, SQLITE
```

### Interfaces

```typescript
import {
  Agent,
  Conversation,
  Message,
  User,
  Company,
  Lead,
  Document,
  DatabaseConnection,
  LLMSettings,
} from '@knowrithm/sdk';

// Typed agent
const agent: Agent = {
  id: 'agent-123',
  name: 'Support Bot',
  description: 'Customer support',
  status: AgentStatus.ACTIVE,
  company_id: 'company-456',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Typed conversation
const conversation: Conversation = {
  id: 'conv-789',
  agent_id: 'agent-123',
  title: 'Support Chat',
  status: ConversationStatus.ACTIVE,
  metadata: { source: 'widget' },
  created_at: '2024-01-01T00:00:00Z',
};
```

### Generic Types

```typescript
import {
  PaginatedResponse,
  PaginationParams,
  DateRangeParams,
  AuthResponse,
} from '@knowrithm/sdk';

// Paginated responses
const agents: PaginatedResponse<Agent> = await client.agents.listAgents({
  page: 1,
  per_page: 20,
  status: AgentStatus.ACTIVE,
});

console.log(agents.data);        // Agent[]
console.log(agents.pagination);  // { page, per_page, total, total_pages }

// Pagination parameters
const params: PaginationParams = {
  page: 1,
  per_page: 50,
};

// Date range parameters
const dateRange: DateRangeParams = {
  start_date: '2024-01-01',
  end_date: '2024-12-31',
};

// Authentication response
const auth: AuthResponse = await client.auth.login('user@example.com', 'password');
console.log(auth.access_token);
console.log(auth.refresh_token);
console.log(auth.expires_in);
```

### Type Guards

```typescript
import { isKnowrithmAPIError } from '@knowrithm/sdk';

try {
  await client.agents.getAgent('id');
} catch (error) {
  if (isKnowrithmAPIError(error)) {
    // TypeScript knows this is KnowrithmAPIError
    console.error(error.statusCode);
  }
}
```

---

## Configuration

Customize the SDK client with various configuration options.

### Full Configuration

```typescript
import { KnowrithmClient, KnowrithmConfig } from '@knowrithm/sdk';

const config: KnowrithmConfig = {
  baseUrl: 'https://app.knowrithm.org/api',
  apiVersion: 'v1',
  timeout: 30000,                    // Request timeout (ms)
  maxRetries: 3,                     // Retry attempts
  retryBackoffFactor: 1.5,           // Exponential backoff multiplier
  verifySsl: true,                   // SSL verification
  streamPathTemplate: '/conversation/{conversation_id}/messages/stream',
  streamTimeout: 60000,              // Stream timeout (ms)
};

const client = new KnowrithmClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  config,
});
```

### Environment-Specific Configuration

```typescript
// Development
const devClient = new KnowrithmClient({
  apiKey: process.env.DEV_API_KEY!,
  apiSecret: process.env.DEV_API_SECRET!,
  config: {
    baseUrl: 'https://dev.knowrithm.org/api',
    verifySsl: false, // For local development
  },
});

// Production
const prodClient = new KnowrithmClient({
  apiKey: process.env.PROD_API_KEY!,
  apiSecret: process.env.PROD_API_SECRET!,
  config: {
    baseUrl: 'https://app.knowrithm.org/api',
    verifySsl: true,
    maxRetries: 5,
    timeout: 60000,
  },
});
```

---

## Examples

### Complete Agent Workflow

```typescript
import { KnowrithmClient, KnowrithmAgent } from '@knowrithm/sdk';
import fs from 'fs';

async function completeWorkflow() {
  const client = new KnowrithmClient({
    apiKey: process.env.KNOWRITHM_API_KEY!,
    apiSecret: process.env.KNOWRITHM_API_SECRET!,
  });

  // Create company
  const company = await client.companies.createCompany({
    name: 'Tech Startup Inc',
    email: 'contact@techstartup.com',
    website: 'https://techstartup.com',
  });

  // Create agent
  const agentData = await client.agents.createAgent({
    name: 'Customer Support AI',
    description: 'Handles technical support queries',
    company_id: company.id,
  });

  // Use high-level wrapper
  const agent = new KnowrithmAgent(client, agentData.agent.id);

  // Upload knowledge base
  const docBuffer = fs.readFileSync('./kb/faq.pdf');
  await agent.uploadDocuments([
    { file: docBuffer, filename: 'faq.pdf' }
  ]);

  // Also upload from URL
  await client.documents.uploadDocuments(agentData.agent.id, {
    urls: ['https://techstartup.com/docs/api.pdf'],
  });

  // Test the agent
  const testResponse = await agent.test('How do I reset my password?');
  console.log('Test response:', testResponse);

  // Start a conversation
  const response = await agent.chat('What are your support hours?');
  console.log('Agent:', response);

  // Get metrics
  const metrics = await agent.getMetrics();
  console.log('Metrics:', metrics);
}

completeWorkflow().catch(console.error);
```

### Streaming with React

```typescript
import { useState, useEffect } from 'react';
import { KnowrithmClient } from '@knowrithm/sdk';

function ChatComponent() {
  const [client] = useState(() => new KnowrithmClient({
    apiKey: process.env.REACT_APP_API_KEY!,
    apiSecret: process.env.REACT_APP_API_SECRET!,
  }));
  
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(conversationId: string, message: string) {
    setLoading(true);
    setResponse('');

    try {
      const stream = await client.messages.sendMessage(
        conversationId,
        message,
        { stream: true }
      );

      for await (const event of stream) {
        if (event.event === 'message' && event.data.content) {
          setResponse(prev => prev + event.data.content);
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div>{response || (loading ? 'Typing...' : 'Send a message')}</div>
    </div>
  );
}
```

### Database Text-to-SQL

```typescript
async function textToSqlExample() {
  const client = new KnowrithmClient({
    apiKey: process.env.KNOWRITHM_API_KEY!,
    apiSecret: process.env.KNOWRITHM_API_SECRET!,
  });

  // Create database connection
  const connection = await client.databases.createConnection(
    'Analytics DB',
    'postgresql://user:pass@localhost:5432/analytics',
    'postgres',
    'agent-id'
  );

  // Test connection
  const testResult = await client.databases.testConnection(connection.id);
  console.log('Connection status:', testResult.status);

  // Analyze schema
  await client.databases.analyzeConnection(connection.id);

  // Get sample queries
  const samples = await client.databases.getSampleQueries(connection.id);
  console.log('Sample queries:', samples);

  // Convert natural language to SQL
  const result = await client.databases.textToSql(
    connection.id,
    'Show me the top 10 customers by revenue last month',
    true,  // execute the query
    10     // result limit
  );

  console.log('Generated SQL:', result.sql);
  console.log('Query results:', result.results);
  console.log('Explanation:', result.explanation);
}
```

### Lead Management

```typescript
async function leadManagementExample() {
  const client = new KnowrithmClient({
    apiKey: process.env.KNOWRITHM_API_KEY!,
    apiSecret: process.env.KNOWRITHM_API_SECRET!,
  });

  // Create lead from widget (public endpoint)
  const lead = await client.leads.registerLead({
    agent_id: 'agent-id',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    phone: '+1234567890',
    consent_marketing: true,
    consent_data_processing: true,
  });

  // List company leads
  const leads = await client.leads.listCompanyLeads({
    page: 1,
    per_page: 50,
    status: 'new',
    search: 'jane',
  });

  // Update lead status
  await client.leads.updateLead(lead.id, {
    status: 'contacted',
    notes: 'Called and left voicemail',
  });

  // Get lead analytics
  const analytics = await client.analytics.getLeadAnalytics(
    '2024-01-01',
    '2024-12-31'
  );
  
  console.log('Lead conversion rate:', analytics.conversion_rate);
}
```

---

## Browser and Node.js Usage

The SDK works seamlessly in both environments.

### Node.js

```typescript
import { KnowrithmClient } from '@knowrithm/sdk';
import fs from 'fs';
import path from 'path';

const client = new KnowrithmClient({
  apiKey: process.env.KNOWRITHM_API_KEY!,
  apiSecret: process.env.KNOWRITHM_API_SECRET!,
});

// File operations
const filePath = path.join(__dirname, 'document.pdf');
const fileBuffer = fs.readFileSync(filePath);

await client.documents.uploadDocuments('agent-id', {
  filePaths: [{ file: fileBuffer, filename: 'document.pdf' }],
});
```

### Browser (React Example)

```typescript
import { KnowrithmClient } from '@knowrithm/sdk';
import { useState, useEffect } from 'react';

function App() {
  const [client] = useState(() => new KnowrithmClient({
    apiKey: import.meta.env.VITE_API_KEY,
    apiSecret: import.meta.env.VITE_API_SECRET,
  }));

  const [agents, setAgents] = useState([]);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      const response = await client.agents.listAgents({ page: 1, per_page: 10 });
      setAgents(response.data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }

  return (
    <div>
      {agents.map(agent => (
        <div key={agent.id}>{agent.name}</div>
      ))}
    </div>
  );
}
```

### Browser File Upload

```typescript
function FileUploader({ agentId }: { agentId: string }) {
  const client = new KnowrithmClient({
    apiKey: import.meta.env.VITE_API_KEY,
    apiSecret: import.meta.env.VITE_API_SECRET,
  });

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files).map(file => ({
      file,
      filename: file.name,
    }));

    try {
      await client.documents.uploadDocuments(agentId, {
        filePaths: fileArray,
      });
      alert('Upload successful!');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  return <input type="file" multiple onChange={handleUpload} />;
}
```

---

## API Reference

For complete API documentation, visit [https://docs.knowrithm.org](https://docs.knowrithm.org)

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Passes all tests (`npm test`)
- Follows the coding style (`npm run lint`)
- Includes appropriate type definitions
- Updates documentation as needed

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

Need help? We're here for you:

- **Documentation**: [https://docs.knowrithm.org](https://docs.knowrithm.org)
- **GitHub Issues**: [https://github.com/Knowrithm/knowrithm-typescript-sdk/issues](https://github.com/Knowrithm/knowrithm-typescript-sdk/issues)
- **Email**: support@knowrithm.org
- **Support Portal**: [https://support.knowrithm.org](https://support.knowrithm.org)

---

## Changelog

### v1.0.0 (2025-10-12)
- Initial release
- Complete API coverage
- Streaming support
- High-level wrappers
- TypeScript type definitions
- File upload support
- Error handling and retries