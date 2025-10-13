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
  - [SettingsService](#settingsservice)
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
git clone https://github.com/Knowrithm/knowrithm-typescript-sdk.git
cd knowrithm-typescript-sdk
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
console.log('Task ID:', queued.task_id);
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

- **`createUser(payload, headers)`** - `POST /v1/auth/user`
  - Admin-only user creation within the authenticated company
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT (admin/super-admin)
  - Payload: `{ email, username, password, first_name, last_name, company_id? }` (company_id only for super-admin)
  - Returns: `Promise<{ user: User }>`

- **`getUser(userId, headers)`** - `GET /v1/user/<user_id>`
  - Fetches user details within the company
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT (admin)
  - Returns: `Promise<User>`

- **`login(email, password, headers?)`** - `POST /v1/auth/login`
  - Authenticates user and returns JWT tokens
  - Public endpoint
  - Returns: `Promise<AuthResponse>` with `access_token` and `refresh_token`

- **`getCurrentUser(headers)`** - `GET /v1/auth/user/me`
  - Returns authenticated user with active company
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<{ user: User; company: Company }>`

- **`logout(headers)`** - `POST /v1/auth/logout`
  - Revokes the current JWT session
  - Requires: `Authorization: Bearer <JWT>`
  - Returns: `Promise<void>`

- **`sendVerificationEmail(email, headers?)`** - `POST /v1/send`
  - Initiates email verification flow
  - Public endpoint
  - Returns: `Promise<any>`

- **`verifyEmail(token, headers?)`** - `POST /v1/verify`
  - Confirms email ownership with verification token
  - Public endpoint
  - Returns: `Promise<any>`

- **`refreshAccessToken(refreshToken, headers?)`** - `POST /v1/auth/refresh`
  - Exchanges refresh token for new access token
  - Pass `Authorization: Bearer <refresh JWT>` in headers
  - Returns: `Promise<{ access_token: string }>`

---

### ApiKeyService (`client.api_keys`)

Manages API key lifecycle and usage analytics.

#### Methods

- **`createApiKey(payload, headers)`** - `POST /v1/auth/api-keys`
  - Creates new API key for authenticated user
  - Requires: `Authorization: Bearer <JWT>`
  - Payload: `{ name?, scopes?, permissions?, expires_in_days? }`
  - Returns: `Promise<{ api_key: ApiKey; secret: string }>`

- **`listApiKeys(headers)`** - `GET /v1/auth/api-keys`
  - Lists all active API keys owned by user
  - Requires: `Authorization: Bearer <JWT>`
  - Returns: `Promise<{ api_keys: ApiKey[] }>`

- **`deleteApiKey(apiKeyId, headers)`** - `DELETE /v1/auth/api-keys/<id>`
  - Revokes an API key permanently
  - Requires: `Authorization: Bearer <JWT>`
  - Returns: `Promise<void>`

- **`validateCredentials(headers)`** - `GET /v1/auth/validate`
  - Validates current credentials and returns metadata
  - Requires: `Authorization: Bearer <JWT>`
  - Returns: `Promise<{ valid: boolean; metadata: any }>`

- **`getApiKeyOverview(days?, headers)`** - `GET /v1/overview`
  - High-level analytics for API key usage
  - Requires: `X-API-Key` + `X-API-Secret` (scopes `read`, `admin`) or JWT (admin)
  - Parameters: `days` (default: 30)
  - Returns: `Promise<ApiKeyOverview>`

- **`getUsageTrends(days?, granularity?, headers)`** - `GET /v1/usage-trends`
  - Returns usage patterns by day/hour
  - Requires: `X-API-Key` + `X-API-Secret` (scopes `read`, `admin`) or JWT (admin)
  - Parameters: `days`, `granularity` ('daily' | 'hourly')
  - Returns: `Promise<UsageTrend[]>`

- **`getTopEndpoints(days?, headers)`** - `GET /v1/top-endpoints`
  - Most frequently used endpoints per company
  - Requires: `X-API-Key` + `X-API-Secret` (scopes `read`, `admin`) or JWT (admin)
  - Returns: `Promise<EndpointUsage[]>`

- **`getApiKeyPerformance(days?, headers)`** - `GET /v1/api-key-performance`
  - Performance metrics grouped by key
  - Requires: `X-API-Key` + `X-API-Secret` (scopes `read`, `admin`) or JWT (admin)
  - Returns: `Promise<KeyPerformance[]>`

- **`getErrorAnalysis(days?, headers)`** - `GET /v1/error-analysis`
  - Error distribution and status codes
  - Requires: `X-API-Key` + `X-API-Secret` (scopes `read`, `admin`) or JWT (admin)
  - Returns: `Promise<ErrorAnalysis>`

- **`getRateLimitAnalysis(days?, headers)`** - `GET /v1/rate-limit-analysis`
  - Rate limit consumption overview
  - Requires: `X-API-Key` + `X-API-Secret` (scopes `read`, `admin`) or JWT (admin)
  - Returns: `Promise<RateLimitAnalysis>`

- **`getDetailedUsage(apiKeyId, days?, headers)`** - `GET /v1/detailed-usage/<id>`
  - Fine-grained request logs for specific key
  - Requires: `X-API-Key` + `X-API-Secret` (scopes `read`, `admin`) or JWT (admin)
  - Returns: `Promise<DetailedUsageLog[]>`

---

### UserService (`client.users`)

User profile management operations.

#### Methods

- **`getProfile(headers)`** - `GET /v1/user/profile`
  - Returns authenticated user's profile
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<UserProfile>`

- **`updateProfile(payload, headers)`** - `PUT /v1/user/profile`
  - Updates user profile fields
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Payload: `{ first_name?, last_name?, timezone?, language?, preferences? }`
  - Returns: `Promise<UserProfile>`

---

### AddressService (`client.addresses`)

Geographic data and company address management.

#### Methods

- **`seedReferenceData(headers?)`** - `GET /v1/address-seed`
  - Populates countries, states, and cities reference data
  - Public endpoint
  - Returns: `Promise<{ message: string }>`

- **`createCountry(name, isoCode?, headers)`** - `POST /v1/country`
  - Admin-only country creation
  - Requires: `Authorization: Bearer <JWT>` (admin role)
  - Returns: `Promise<Country>`

- **`listCountries(headers?)`** - `GET /v1/country`
  - Fetches all countries
  - Public endpoint
  - Returns: `Promise<Country[]>`

- **`getCountry(countryId, headers?)`** - `GET /v1/country/<id>`
  - Returns country with nested states
  - Public endpoint
  - Returns: `Promise<CountryWithStates>`

- **`updateCountry(countryId, name?, isoCode?, headers)`** - `PATCH /v1/country/<id>`
  - Updates country information
  - Requires: `Authorization: Bearer <JWT>` (admin role)
  - Returns: `Promise<Country>`

- **`createState(name, countryId, headers)`** - `POST /v1/state`
  - Admin-only state creation
  - Requires: `Authorization: Bearer <JWT>` (admin role)
  - Returns: `Promise<State>`

- **`listStatesByCountry(countryId, headers?)`** - `GET /v1/state/country/<country_id>`
  - Lists all states in a country
  - Public endpoint
  - Returns: `Promise<State[]>`

- **`getState(stateId, headers?)`** - `GET /v1/state/<id>`
  - Returns state with nested cities
  - Public endpoint
  - Returns: `Promise<StateWithCities>`

- **`updateState(stateId, name?, countryId?, headers)`** - `PATCH /v1/state/<id>`
  - Updates state information
  - Requires: `Authorization: Bearer <JWT>` (admin role)
  - Returns: `Promise<State>`

- **`createCity(name, stateId, postalCodePrefix?, headers)`** - `POST /v1/city`
  - Admin-only city creation
  - Requires: `Authorization: Bearer <JWT>` (admin role)
  - Returns: `Promise<City>`

- **`listCitiesByState(stateId, headers?)`** - `GET /v1/city/state/<state_id>`
  - Lists all cities in a state
  - Public endpoint
  - Returns: `Promise<City[]>`

- **`getCity(cityId, headers?)`** - `GET /v1/city/<id>`
  - Returns city details
  - Public endpoint
  - Returns: `Promise<City>`

- **`updateCity(cityId, name?, stateId?, postalCodePrefix?, headers)`** - `PATCH /v1/city/<id>`
  - Updates city information
  - Requires: `Authorization: Bearer <JWT>` (admin role)
  - Returns: `Promise<City>`

- **`createAddress(address, cityId, stateId, countryId, options?, headers)`** - `POST /v1/address`
  - Creates company address with coordinates
  - Requires: `Authorization: Bearer <JWT>` (admin role)
  - Options: `{ postal_code?, lat?, lan?, is_primary? }`
  - Returns: `Promise<Address>`

- **`getCompanyAddress(headers)`** - `GET /v1/address`
  - Fetches authenticated company's address
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Address>`

---

### AdminService (`client.admin`)

Administrative operations for user and system management.

#### Methods

- **`listUsers(params?, headers)`** - `GET /v1/admin/user` or `/v1/super-admin/company/<id>/user`
  - Lists users with filtering and pagination
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`) or JWT (admin/super-admin)
  - Params: `{ company_id?, status?, role?, email_verified?, two_factor_enabled?, search?, created_after?, created_before?, last_login_after?, last_login_before?, never_logged_in?, locked?, high_login_attempts?, timezone?, language?, include_deleted?, only_deleted?, page?, per_page?, sort_by?, sort_order? }`
  - Returns: `Promise<PaginatedResponse<User>>`

- **`getUser(userId, headers)`** - `GET /v1/admin/user/<user_id>`
  - Gets detailed user information
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`) or JWT (admin)
  - Returns: `Promise<User>`

- **`getCompanySystemMetrics(companyId?, headers)`** - `GET /v1/admin/system-metric` or `/v1/super-admin/company/<id>/system-metric`
  - Retrieves system performance metrics
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`) or JWT (admin/super-admin)
  - Returns: `Promise<SystemMetrics>`

- **`getAuditLogs(params?, headers)`** - `GET /v1/audit-log`
  - Fetches audit logs with filters
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`)
  - Params: `{ entity_type?, event_type?, risk_level?, limit?, offset? }`
  - Returns: `Promise<PaginatedResponse<AuditLog>>`

- **`getSystemConfiguration(headers)`** - `GET /v1/config`
  - Reads system configuration values
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`)
  - Sensitive keys hidden from non-super-admins
  - Returns: `Promise<SystemConfig[]>`

- **`upsertSystemConfiguration(key, value, options?, headers)`** - `PATCH /v1/config`
  - Creates or updates configuration entry
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`)
  - Options: `{ config_type?, description?, is_sensitive? }`
  - Returns: `Promise<SystemConfig>`

- **`forcePasswordReset(userId, headers)`** - `POST /v1/user/<id>/force-password-reset`
  - Forces user to reset password on next login
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`)
  - Returns: `Promise<void>`

- **`impersonateUser(userId, headers)`** - `POST /v1/user/<id>/impersonate`
  - Generates impersonation token for user
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`, super-admin role)
  - Returns: `Promise<{ token: string }>`

- **`updateUserStatus(userId, status, reason?, headers)`** - `PATCH /v1/user/<id>/status`
  - Updates user account status
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`)
  - Status: `'active' | 'suspended' | 'inactive'`
  - Returns: `Promise<User>`

- **`updateUserRole(userId, role, headers)`** - `PATCH /v1/user/<id>/role`
  - Changes user role
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`, super-admin role)
  - Role: `'super_admin' | 'admin' | 'user' | 'viewer'`
  - Returns: `Promise<User>`

---

### AgentService (`client.agents`)

AI agent creation and management.

#### Methods

- **`createAgent(payload, headers)`** - `POST /v1/agent`
  - Creates new AI agent
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`)
  - Payload: `{ name, description?, avatar_url?, llm_settings_id?, personality_traits?, capabilities?, operating_hours?, languages?, status? }`
  - Returns: `Promise<{ agent: Agent }>`

- **`getAgent(agentId, headers?)`** - `GET /v1/agent/<id>`
  - Retrieves agent details
  - Public endpoint
  - Returns: `Promise<Agent>`

- **`listAgents(params?, headers)`** - `GET /v1/agent`
  - Lists agents with filtering
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Params: `{ company_id?, status?, search?, page?, per_page? }` (company_id only for super-admin)
  - Returns: `Promise<PaginatedResponse<Agent>>`

- **`updateAgent(agentId, payload, headers)`** - `PUT /v1/agent/<id>`
  - Updates agent configuration
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Agent>`

- **`deleteAgent(agentId, headers)`** - `DELETE /v1/agent/<id>`
  - Soft deletes an agent (requires no active conversations)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`restoreAgent(agentId, headers)`** - `PATCH /v1/agent/<id>/restore`
  - Restores soft-deleted agent
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Agent>`

- **`getEmbedCode(agentId, headers)`** - `GET /v1/agent/<id>/embed-code`
  - Generates widget embed code
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<{ embed_code: string }>`

- **`testAgent(agentId, query?, headers)`** - `POST /v1/agent/<id>/test`
  - Tests agent with sample query
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<{ response: string }>`

- **`getAgentStats(agentId, headers)`** - `GET /v1/agent/<id>/stats`
  - Retrieves agent usage statistics
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<AgentStats>`

- **`cloneAgent(agentId, name?, llmSettingsId?, headers)`** - `POST /v1/agent/<id>/clone`
  - Clones agent with optional new name
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Agent>`

- **`fetchWidgetScript(headers?)`** - `GET /widget.js`
  - Returns public widget JavaScript
  - Public endpoint
  - Returns: `Promise<string>`

- **`renderTestPage(bodyHtml, headers?)`** - `POST /test`
  - Renders test HTML page
  - Public endpoint (internal use)
  - Returns: `Promise<string>`

---

### AnalyticsService (`client.analytics`)

Analytics, metrics, and data export capabilities.

#### Methods

- **`getDashboardOverview(companyId?, headers)`** - `GET /v1/analytic/dashboard`
  - High-level dashboard metrics
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<DashboardOverview>`

- **`getAgentAnalytics(agentId, startDate?, endDate?, headers)`** - `GET /v1/analytic/agent/<agent_id>`
  - Detailed agent performance metrics
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<AgentAnalytics>`

- **`getAgentPerformanceComparison(agentId, startDate?, endDate?, headers)`** - `GET /v1/analytic/agent/<agent_id>/performance-comparison`
  - Compares agent performance over time
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<PerformanceComparison>`

- **`getConversationAnalytics(conversationId, headers)`** - `GET /v1/analytic/conversation/<conversation_id>`
  - Analytics for specific conversation
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<ConversationAnalytics>`

- **`getLeadAnalytics(startDate?, endDate?, companyId?, headers)`** - `GET /v1/analytic/leads`
  - Lead generation and conversion metrics
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<LeadAnalytics>`

- **`getUsageMetrics(startDate?, endDate?, headers)`** - `GET /v1/analytic/usage`
  - Platform usage statistics
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<UsageMetrics>`

- **`searchDocuments(query, agentId, limit?, headers)`** - `POST /v1/search/document`
  - Semantic document search
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<DocumentSearchResult[]>`

- **`searchDatabase(query, connectionId?, headers)`** - `POST /v1/search/database`
  - Database schema search
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<DatabaseSearchResult[]>`

- **`triggerSystemMetricCollection(headers)`** - `POST /v1/system-metric`
  - Manually triggers metric collection
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`exportAnalytics(exportType, exportFormat, startDate?, endDate?, headers)`** - `POST /v1/analytic/export`
  - Exports analytics data
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
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
  - Creates new company (supports multipart for logo or JSON)
  - Public endpoint (typically internal use)
  - Payload: `{ name, email, website?, phone?, industry?, logo?, address_id? }`
  - Returns: `Promise<Company>`

- **`listCompanies(page?, perPage?, headers)`** - `GET /v1/super-admin/company`
  - Lists all companies (super-admin only)
  - Requires: `Authorization: Bearer <JWT>` (super-admin)
  - Returns: `Promise<PaginatedResponse<Company>>`

- **`getCompany(headers)`** - `GET /v1/company`
  - Gets authenticated company details
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Company>`

- **`getCompanyStatistics(companyId?, days?, headers)`** - `GET /v1/company/<id>/statistics` or `/v1/company/statistics`
  - Retrieves company statistics
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<CompanyStatistics>`

- **`listDeletedCompanies(headers)`** - `GET /v1/company/deleted`
  - Lists soft-deleted companies
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Company[]>`

- **`updateCompany(companyId, payload, logoPath?, headers)`** - `PUT /v1/company/<id>`
  - Updates company (full replacement)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `admin`) or JWT (admin/super-admin)
  - Returns: `Promise<Company>`

- **`patchCompany(companyId, payload, headers)`** - `PATCH /v1/company/<id>`
  - Partial company update
  - Requires: `Authorization: Bearer <JWT>` (super-admin)
  - Returns: `Promise<Company>`

- **`deleteCompany(companyId, headers)`** - `DELETE /v1/company/<id>`
  - Soft deletes company
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`restoreCompany(companyId, headers)`** - `PATCH /v1/company/<id>/restore`
  - Restores soft-deleted company
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Company>`

- **`cascadeDeleteCompany(companyId, deleteRelated?, headers)`** - `DELETE /v1/company/<id>/cascade-delete`
  - Hard deletes company and optionally related data
  - Requires: `Authorization: Bearer <JWT>` (super-admin)
  - Returns: `Promise<void>`

- **`getRelatedDataSummary(companyId, headers)`** - `GET /v1/company/<id>/related-data`
  - Summarizes related entities before deletion
  - Requires: `Authorization: Bearer <JWT>` (super-admin)
  - Returns: `Promise<RelatedDataSummary>`

- **`bulkDeleteCompanies(companyIds, headers)`** - `DELETE /v1/company/bulk-delete`
  - Soft deletes multiple companies
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ deleted: number }>`

- **`bulkRestoreCompanies(companyIds, headers)`** - `PATCH /v1/company/bulk-restore`
  - Restores multiple companies
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ restored: number }>`

---

### DatabaseService (`client.databases`)

Database connection management and text-to-SQL functionality.

#### Methods

- **`createConnection(name, url, databaseType, agentId, connectionParams?, headers)`** - `POST /v1/database-connection`
  - Creates database connection
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Database types: `'postgres' | 'mysql' | 'mongodb' | 'sqlite'`
  - Returns: `Promise<DatabaseConnection>`

- **`listConnections(params?, headers)`** - `GET /v1/database-connection`
  - Lists database connections with filtering
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<PaginatedResponse<DatabaseConnection>>`

- **`getConnection(connectionId, headers)`** - `GET /v1/database-connection/<id>`
  - Gets connection details
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<DatabaseConnection>`

- **`updateConnection(connectionId, payload, headers)`** - `PUT /v1/database-connection/<id>`
  - Updates connection (full replacement)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<DatabaseConnection>`

- **`patchConnection(connectionId, updates, headers)`** - `PATCH /v1/database-connection/<id>`
  - Partial connection update
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<DatabaseConnection>`

- **`deleteConnection(connectionId, headers)`** - `DELETE /v1/database-connection/<id>`
  - Soft deletes connection
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`restoreConnection(connectionId, headers)`** - `PATCH /v1/database-connection/<id>/restore`
  - Restores deleted connection
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<DatabaseConnection>`

- **`listDeletedConnections(headers)`** - `GET /v1/database-connection/deleted`
  - Lists soft-deleted connections
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<DatabaseConnection[]>`

- **`testConnection(connectionId, headers)`** - `POST /v1/database-connection/<id>/test`
  - Tests database connectivity
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ status: 'success' | 'failed'; message: string }>`

- **`analyzeConnection(connectionId, headers)`** - `POST /v1/database-connection/<id>/analyze`
  - Analyzes schema and generates metadata
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<SchemaAnalysis>`

- **`analyzeMultipleConnections(payload?, headers)`** - `POST /v1/database-connection/analyze`
  - Batch analyzes multiple connections
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<SchemaAnalysis[]>`

- **`listTables(connectionId, headers)`** - `GET /v1/database-connection/<id>/table`
  - Lists tables in connection
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<DatabaseTable[]>`

- **`getTable(tableId, headers)`** - `GET /v1/database-connection/table/<table_id>`
  - Gets table details with columns
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<DatabaseTable>`

- **`deleteTable(tableId, headers)`** - `DELETE /v1/database-connection/table/<table_id>`
  - Soft deletes table metadata
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`deleteTablesForConnection(connectionId, headers)`** - `DELETE /v1/database-connection/<id>/table`
  - Deletes all tables for connection
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ deleted: number }>`

- **`restoreTable(tableId, headers)`** - `PATCH /v1/database-connection/table/<table_id>/restore`
  - Restores deleted table
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<DatabaseTable>`

- **`listDeletedTables(headers)`** - `GET /v1/database-connection/table/deleted`
  - Lists soft-deleted tables
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<DatabaseTable[]>`

- **`getSemanticSnapshot(connectionId, headers)`** - `GET /v1/database-connection/<id>/semantic-snapshot`
  - Gets semantic understanding of schema
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<SemanticSnapshot>`

- **`getKnowledgeGraph(connectionId, headers)`** - `GET /v1/database-connection/<id>/knowledge-graph`
  - Returns relationship graph
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<KnowledgeGraph>`

- **`getSampleQueries(connectionId, headers)`** - `GET /v1/database-connection/<id>/sample-queries`
  - Generates sample natural language queries
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<SampleQuery[]>`

- **`textToSql(connectionId, question, execute?, resultLimit?, headers)`** - `POST /v1/database-connection/<id>/text-to-sql`
  - Converts natural language to SQL
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Parameters: `execute` (boolean), `resultLimit` (number)
  - Returns: `Promise<{ sql: string; results?: any[]; explanation: string }>`

- **`exportConnection(connectionId, headers)`** - `POST /v1/database-connection/export`
  - Exports connection configuration to documents
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<string>`

---

### DocumentService (`client.documents`)

Document upload and management for agent knowledge bases.

#### Methods

- **`uploadDocuments(agentId, payload, headers)`** - `POST /v1/document/upload`
  - Upload files or scrape URLs and enqueue processing
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Use `Content-Type: multipart/form-data` for file uploads or `application/json` for URL submission
  - Payload: `{ agent_id (required), files? (multiple), url?, urls?, metadata? }`
  - Returns: `Promise<DocumentUploadResult>`

- **`listDocuments(headers)`** - `GET /v1/document`
  - List documents for the company
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Document[]>`

- **`deleteDocument(documentId, headers)`** - `DELETE /v1/document/<id>`
  - Soft delete a document
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`deleteDocumentChunk(chunkId, headers)`** - `DELETE /v1/document/chunk/<id>`
  - Soft delete a single document chunk
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`deleteAllDocumentChunks(documentId, headers)`** - `DELETE /v1/document/<id>/chunk`
  - Delete all chunks for a document
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ deleted: number }>`

- **`restoreDocument(documentId, headers)`** - `PATCH /v1/document/<id>/restore`
  - Restore a soft-deleted document
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Document>`

- **`restoreDocumentChunk(chunkId, headers)`** - `PATCH /v1/document/chunk/<id>/restore`
  - Restore a soft-deleted chunk
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<DocumentChunk>`

- **`listDeletedDocuments(headers)`** - `GET /v1/document/deleted`
  - List deleted documents
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Document[]>`

- **`listDeletedDocumentChunks(headers)`** - `GET /v1/document/chunk/deleted`
  - List deleted document chunks
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<DocumentChunk[]>`

- **`restoreAllDocumentChunks(documentId, headers)`** - `PATCH /v1/document/<id>/chunk/restore-all`
  - Restore all chunks for a document
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ restored: number }>`

- **`bulkDeleteDocuments(documentIds, headers)`** - `DELETE /v1/document/bulk-delete`
  - Bulk delete documents
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Body: `{ document_ids: [uuid, ...] }`
  - Returns: `Promise<{ deleted: number }>`

---

### ConversationService (`client.conversations`) & MessageService (`client.messages`)

Conversation lifecycle and message handling.

#### ConversationService Methods

- **`createConversation(agentId, title?, metadata?, maxContextLength?, headers)`** - `POST /v1/conversation`
  - Creates new conversation for the authenticated entity
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ conversation: Conversation }>`

- **`listConversations(page?, perPage?, headers)`** - `GET /v1/conversation`
  - Lists company conversations (active)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<PaginatedResponse<Conversation>>`

- **`listConversationsForEntity(page?, perPage?, headers)`** - `GET /v1/conversation/entity`
  - Lists conversations for the authenticated entity (user/lead)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<PaginatedResponse<Conversation>>`

- **`listDeletedConversations(headers)`** - `GET /v1/conversation/deleted`
  - Lists soft-deleted conversations
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Conversation[]>`

- **`listConversationMessages(conversationId, page?, perPage?, headers)`** - `GET /v1/conversation/<id>/messages`
  - Lists messages in conversation
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<PaginatedResponse<Message>>`

- **`deleteConversation(conversationId, headers)`** - `DELETE /v1/conversation/<id>`
  - Soft deletes conversation
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`deleteConversationMessages(conversationId, headers)`** - `DELETE /v1/conversation/<id>/messages`
  - Deletes all messages in conversation
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ deleted: number }>`

- **`restoreConversation(conversationId, headers)`** - `PATCH /v1/conversation/<id>/restore`
  - Restores deleted conversation
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Conversation>`

- **`restoreAllMessages(conversationId, headers)`** - `PATCH /v1/conversation/<id>/message/restore-all`
  - Restores all deleted messages
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ restored: number }>`

#### MessageService Methods

- **`sendMessage(conversationId, message, options?)`** - `POST /v1/conversation/<id>/chat`
  - Queues a chat message for asynchronous AI processing
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Body: `{ message: string (required) }`
  - Returns: `202 Accepted` with `Promise<{ status: "queued", task_id, conversation_id, message_id, poll_url }>`
  - Options: `{ headers?, stream?, stream_url?, stream_timeout?, event_types?, raw_events? }`
  - Note: Returns `MessageStream` if `stream: true` is passed in options
  
- **`streamConversationMessages(conversationId, options?)`** - `GET /v1/conversation/<id>/messages/stream`
  - Opens Server-Sent Events (SSE) stream for conversation updates
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `MessageStream` with events: `queued`, `completed`, `failed`, and heartbeat
  - Returns `503` if streaming is not configured
  - Options: `{ headers?, event_types?, raw_events? }`

- **`deleteMessage(messageId, headers)`** - `DELETE /v1/message/<id>`
  - Soft deletes a message
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`restoreMessage(messageId, headers)`** - `PATCH /v1/message/<id>/restore`
  - Restores deleted message
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Message>`

- **`listDeletedMessages(headers)`** - `GET /v1/message/deleted`
  - Lists all soft-deleted messages
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Message[]>`

---

### LeadService (`client.leads`)

Lead capture and management for the widget.

#### Methods

- **`registerLead(payload, headers?)`** - `POST /v1/lead/register`
  - Public widget registration endpoint with automatic JWT issuance
  - Public endpoint (no authentication required)
  - Payload: `{ agent_id, first_name, last_name, email, phone?, source?, notes?, consent_marketing?, consent_data_processing? }`
  - Returns: `Promise<Lead>` with JWT token for widget authentication

- **`createLead(payload, headers)`** - `POST /v1/lead`
  - Admin-created lead via authenticated API
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Lead>`

- **`getLead(leadId, headers)`** - `GET /v1/lead/<id>`
  - Gets lead details
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Lead>`

- **`listCompanyLeads(page?, perPage?, status?, search?, headers)`** - `GET /v1/lead/company`
  - Lists company leads with filtering
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Status: `'new' | 'contacted' | 'qualified' | 'converted' | 'lost'`
  - Returns: `Promise<PaginatedResponse<Lead>>`

- **`updateLead(leadId, payload, headers)`** - `PUT /v1/lead/<id>`
  - Updates lead information
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Lead>`

- **`deleteLead(leadId, headers)`** - `DELETE /v1/lead/<id>`
  - Soft deletes lead
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

---

### SettingsService (`client.settings`)

LLM configuration and model settings.

#### Methods

- **`createSettings(payload, headers)`** - `POST /v1/settings`
  - Creates LLM configuration for a company or agent
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Payload: `{ llm_provider_id, llm_model_id, embedding_provider_id, embedding_model_id, agent_id?, llm_api_key?, llm_api_base_url?, llm_temperature?, llm_max_tokens?, llm_additional_params?, embedding_api_key?, embedding_api_base_url?, embedding_dimension?, embedding_additional_params?, widget_script_url?, widget_config?, is_default? }`
  - Returns: `Promise<LLMSettings>`

- **`getSettings(settingsId, headers)`** - `GET /v1/settings/<id>`
  - Retrieves settings configuration
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<LLMSettings>`

- **`listSettingsByCompany(companyId, headers)`** - `GET /v1/settings/company/<company_id>`
  - Lists company-level settings
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<LLMSettings[]>`

- **`listSettingsByAgent(agentId, headers)`** - `GET /v1/settings/agent/<agent_id>`
  - Lists settings tied to an agent
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<LLMSettings[]>`

- **`updateSettings(settingsId, payload, headers)`** - `PUT /v1/settings/<id>`
  - Updates LLM settings
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<LLMSettings>`

- **`deleteSettings(settingsId, headers)`** - `DELETE /v1/settings/<id>`
  - Deletes settings configuration
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`testSettings(settingsId, headers)`** - `POST /v1/settings/test/<id>`
  - Tests LLM configuration
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ status: string; response: string }>`

- **`listProvidersWithSettings(headers)`** - `GET /v1/settings/providers`
  - Lists providers with settings context
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Provider[]>`

- **`seedProviders(headers)`** - `POST /v1/settings/providers/seed`
  - Seeds default providers/models
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<any>`

---

### ProviderService (`client.providers`)

LLM and embedding provider management.

#### Methods

- **`listProviders(headers)`** - `GET /v1/providers`
  - Lists all available providers
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Provider[]>`

- **`getProvider(providerId, headers)`** - `GET /v1/providers/<id>`
  - Gets provider details with models
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<ProviderWithModels>`

- **`createProvider(payload, headers)`** - `POST /v1/providers`
  - Creates custom provider (admin only)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Payload: `{ name, type, description?, api_base_url?, pricing?, status? }`
  - Returns: `Promise<Provider>`

- **`updateProvider(providerId, payload, headers)`** - `PUT /v1/providers/<id>`
  - Updates provider configuration
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Provider>`

- **`deleteProvider(providerId, headers)`** - `DELETE /v1/providers/<id>`
  - Deletes provider
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`listModelsByProvider(providerId, headers)`** - `GET /v1/providers/<provider_id>/models`
  - Lists models for a provider
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Model[]>`

- **`getModel(providerId, modelId, headers)`** - `GET /v1/providers/<provider_id>/models/<model_id>`
  - Gets model details
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Model>`

- **`createModel(providerId, payload, headers)`** - `POST /v1/providers/<provider_id>/models`
  - Creates custom model
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Payload: `{ name, provider_model_id?, type, context_window?, input_price?, output_price?, currency?, embedding_dimension?, status? }`
  - Returns: `Promise<Model>`

- **`updateModel(providerId, modelId, payload, headers)`** - `PUT /v1/providers/<provider_id>/models/<model_id>`
  - Updates model configuration
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Model>`

- **`deleteModel(providerId, modelId, headers)`** - `DELETE /v1/providers/<provider_id>/models/<model_id>`
  - Deletes model
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`bulkImportProviders(payload, headers)`** - `POST /v1/providers/bulk-import`
  - Bulk import providers/models definitions
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<any>`