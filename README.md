
<img width="831" height="294" alt="20250925_2353_Futuristic Knowrithm Logo_simple_compose_01k616ywakf1r91ekdeb54xy9p" src="https://github.com/user-attachments/assets/9b621a87-60d8-4d0f-80f2-f581bad19ce5" />


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
- [Request Configuration](#request-configuration)
- [Automatic Task Resolution](#automatic-task-resolution)
- [File Uploads](#file-uploads)
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
  - [WebsiteService](#websiteservice)
- [High-Level Wrappers](#high-level-wrappers)
- [Streaming Messages](#streaming-messages)
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

// Create an agent (enable autoResolveTasks to resolve async tasks automatically)
const agent = await client.agents.createAgent({
  name: 'Support Bot',
  description: 'Customer support assistant',
  status: 'active',
  // Provide provider/model IDs to auto-provision agent-level settings
  llm_provider_id: '6fa1fc5e-a7de-4c98-b203-20e063db89fe',
  llm_model_id: '8f3c2d09-0d0f-4fcf-83da-79d58a0d30d5',
  embedding_provider_id: '75d4ceaf-6a3c-4bd3-98f0-0bcf2bb9c2d4',
  embedding_model_id: 'bc03b08f-8f44-4a1e-9227-f0022f8b5d4e',
});

console.log('Agent ID:', agent.agent.id);
console.log('Settings ID:', agent.settings.id);

// Or create the agent using provider/model names (no IDs required)
const agentByNames = await client.agents.createSdkAgent({
  name: 'Support Bot (SDK)',
  status: 'active',
  settings: {
    llm_provider: 'openai',
    llm_model: 'gpt-3.5-turbo-16k',
    embedding_provider: 'openai',
    embedding_model: 'text-embedding-ada-002',
  },
});

console.log('Agent (lookup) ID:', agentByNames.agent.id);
console.log('Settings (lookup) ID:', agentByNames.settings.id);

// Upload supporting documents
await client.documents.uploadDocuments(agent.agent.id, {
  filePaths: ['./docs/knowledge-base.pdf'],
});

// Start a conversation and send a message
const conversation = await client.conversations.createConversation(agent.agent.id);
const reply = await client.messages.sendMessage(
  conversation.conversation.id,
  'Hello there!'
);

console.log(`${reply.role}: ${reply.content}`);
```

> **Optional automatic polling.** Set `autoResolveTasks: true` when constructing the client to have the SDK wait for asynchronous tasks (agent creation, document ingestion, message generation, etc.) and return the completed payload once the task succeeds. If the task fails, a `KnowrithmAPIError` is raised with the task details.

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

Use JWT tokens for user-specific operations. You can either initialize the client with a bearer token or pass the header per request.

```typescript
const jwtClient = new KnowrithmClient({
  bearerToken: 'your-jwt-access-token',
});

// Or obtain tokens using API key credentials and reuse them
const authClient = new KnowrithmClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});
const authResponse = await authClient.auth.login('user@example.com', 'password');
const accessToken = authResponse.access_token;

const headers = { Authorization: `Bearer ${accessToken}` }; // Per-request override
const user = await authClient.auth.getCurrentUser(headers);

const refreshed = await authClient.auth.refreshAccessToken(authResponse.refresh_token);
```

> **Note**: Unless a route explicitly states otherwise, supply either `X-API-Key` + `X-API-Secret` with proper scopes or `Authorization: Bearer <JWT>`. All service methods accept an optional `headers` parameter for custom authentication.

## Request Configuration

Configure timeouts and retry behavior globally when constructing the client, or override them for specific calls when needed.

### Global Defaults

```typescript
const client = new KnowrithmClient({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  timeout: 60_000,           // 60 seconds
  maxRetries: 5,
  retryDelay: 1_500,         // milliseconds before first retry
  backoffMultiplier: 2,      // exponential backoff factor
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  taskPollingInterval: 1_000, // default polling cadence for async tasks
  taskPollingTimeout: 120_000 // max time to wait for task completion
});
```

### Per-Request Overrides

DocumentService helpers that previously accepted an optional `headers` argument now support a richer options object:

```typescript
await client.documents.uploadDocuments(agentId, {
  filePaths: ['./large-manual.pdf'],
}, {
  timeout: 120_000,              // 2 minutes for large uploads
  maxRetries: 6,
  retryDelay: 2_000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  headers: { 'X-Debug': 'true' },
  operationName: 'uploadDocuments (large file)',
});
```

If you only need to pass headers, you can still provide a plain `Record<string, string>` and the SDK will keep existing behavior.

Timeout-related failures now include additional context in the thrown `KnowrithmAPIError`, such as `operation`, `attemptNumber`, `timeoutValue`, and remediation suggestions.

---

## Automatic Task Resolution

Many Knowrithm endpoints are asynchronous and normally respond with HTTP `202 Accepted` plus a `task_id`. When you enable `autoResolveTasks` on the client, the SDK resolves those tasks for you:

- The initial `202` response (or any payload containing `status_url`/`task_id`) triggers a background poll of `/api/v1/tasks/<task_id>/status`.
- Successful task responses resolve to the task's `result` (or `data`) so your method call returns the *final* API payload.
- Failed tasks throw a `KnowrithmAPIError` that includes the task metadata, status, and error message from the backend.

You can enable and tune the polling behaviour through the client configuration:

```typescript
const client = new KnowrithmClient({
  apiKey: process.env.KNOWRITHM_KEY!,
  apiSecret: process.env.KNOWRITHM_SECRET!,
  autoResolveTasks: true,
  taskPollingInterval: 1_500,    // milliseconds between polls (default: 1000)
  taskPollingTimeout: 180_000,   // total wait time in ms (default: 120000)
  taskSuccessStatuses: ['completed', 'success'],
  taskFailureStatuses: ['failed', 'error', 'cancelled'],
});
```

If a task does not complete before the timeout, the promise rejects with a `KnowrithmAPIError` indicating the last known payload and status URL. Use shorter intervals for rapid feedback, or longer timeouts for large document ingestions and analytics exports.

---

## File Uploads

Use `client.documents.uploadDocuments` to stream files and URLs into an agent's knowledge base. The SDK automatically applies your configured authentication headers (API key + secret or bearer token) and manages multipart boundaries, so you do not need to set `Content-Type` manually.

### Local Files

```typescript
const result = await client.documents.uploadDocuments(agentId, {
  filePaths: ['./docs/intro.pdf', './docs/faq.docx'],
});

console.log(result.documents_processed, result.total_submitted);
```

> Absolute Windows paths such as `D:\DevOps\crm\docs\terms.pdf` are supported; the SDK automatically resolves relative paths against `process.cwd()`.

### Remote URLs and Mixed Sources

```typescript
const result = await client.documents.uploadDocuments(agentId, {
  filePaths: ['./docs/local.pdf'],
  urls: ['https://example.com/remote-handbook.pdf'],
  metadata: { source: 'sdk-demo' },
});
```

### Advanced File Descriptors

Provide in-memory buffers, streams, or browser `File` objects with an explicit filename via the `files` option.

```typescript
import fs from 'node:fs/promises';

const pdf = await fs.readFile('./docs/training-pack.pdf');

await client.documents.uploadDocuments(agentId, {
  files: [
    { data: pdf, filename: 'training-pack.pdf' },
  ],
});

// Node.js Buffers and typed arrays are automatically converted to Blob instances before upload.
```

### Extended Timeouts & Retries

Long-running uploads can override the default timeout and retry strategy using the third argument:

```typescript
await client.documents.uploadDocuments(agentId, {
  filePaths: ['./docs/large-whitepaper.pdf'],
}, {
  timeout: 120_000,
  maxRetries: 6,
  retryDelay: 2_000,
  backoffMultiplier: 2,
  headers: { 'X-Upload-Intent': 'large' },
});
```

### Response Shape & Troubleshooting

- Returns an `UploadDocumentsResponse` containing counts (`documents_processed`, `documents_failed`, `total_submitted`), any queued `task_ids`, and per-document metadata.
- A `207 Multi-Status` indicates partial success—check the `errors` array and `error_summary` map for details.
- A `401 Missing Authorization Header` response means the client was instantiated without credentials; provide `apiKey` + `apiSecret` or a `bearerToken`.
- Uploads are rate limited (`20/min`). Retry with exponential backoff or batch requests accordingly.

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
  - Creates new AI agent and provisions dedicated LLM + embedding settings
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`)
  - Payload: `{ name, llm_provider_id, llm_model_id, embedding_provider_id, embedding_model_id, company_id?, description?, avatar_url?, llm_api_key?, llm_api_base_url?, llm_temperature?, llm_max_tokens?, llm_additional_params?, embedding_api_key?, embedding_api_base_url?, embedding_dimension?, embedding_additional_params?, widget_script_url?, widget_config?, personality_traits?, capabilities?, operating_hours?, languages?, status? }`
  - Returns: `Promise<{ agent: Agent; settings: LLMSettings }>`

- **`createSdkAgent(payload, headers)`** - `POST /v1/sdk/agent`
  - Creates new AI agent using provider/model names with automatic settings provisioning
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`)
  - Payload: `{ name, company_id?, description?, avatar_url?, personality_traits?, capabilities?, operating_hours?, languages?, status?, settings: { llm_provider, llm_provider_id?, llm_model, llm_model_id?, llm_api_key?, llm_api_base_url?, llm_temperature?, llm_max_tokens?, llm_additional_params?, embedding_provider, embedding_provider_id?, embedding_model, embedding_model_id?, embedding_api_key?, embedding_api_base_url?, embedding_dimension?, embedding_additional_params?, widget_script_url?, widget_config? } }`
  - Returns: `Promise<{ message: string; agent: Agent; settings: LLMSettings }>`

- **`getAgent(agentId, headers?)`** - `GET /v1/agent/<id>`
  - Retrieves agent details
  - Public endpoint
  - Returns: `Promise<Agent>`

- **`getAgentByName(name, params?, headers)`** - `GET /v1/agent/by-name/<name>`
  - Retrieves agent by name (case-insensitive)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Params: `{ company_id? }` (super-admin can scope to a company)
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

- **`uploadDocuments(agentId, options?, requestOptions?)`** - `POST /v1/document/upload`
  - Upload files or scrape URLs and enqueue processing
  - Automatically attaches `X-API-Key`/`X-API-Secret` or `Authorization: Bearer` headers based on client configuration
  - The SDK manages multipart boundaries—do not set the `Content-Type` header manually
  - Options: `{ filePaths?: string[]; files?: UploadDocumentsFileDescriptor[]; url?: string; urls?: string[]; metadata?: Record<string, unknown> }`
  - Request options: `{ headers?: Record<string, string>; timeout?: number; maxRetries?: number; retryDelay?: number; backoffMultiplier?: number; retryableStatusCodes?: number[]; operationName?: string }`
  - Returns: `Promise<UploadDocumentsResponse>`

- **`listDocuments(params?, requestOptions?)`** - `GET /v1/document`
  - List documents for the company
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Document[]>`

- **`deleteDocument(documentId, requestOptions?)`** - `DELETE /v1/document/<id>`
  - Soft delete a document
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`deleteDocumentChunk(chunkId, requestOptions?)`** - `DELETE /v1/document/chunk/<id>`
  - Soft delete a single document chunk
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<void>`

- **`deleteAllDocumentChunks(documentId, requestOptions?)`** - `DELETE /v1/document/<id>/chunk`
  - Delete all chunks for a document
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ deleted: number }>`

- **`restoreDocument(documentId, requestOptions?)`** - `PATCH /v1/document/<id>/restore`
  - Restore a soft-deleted document
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<Document>`

- **`restoreDocumentChunk(chunkId, requestOptions?)`** - `PATCH /v1/document/chunk/<id>/restore`
  - Restore a soft-deleted chunk
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<DocumentChunk>`

- **`listDeletedDocuments(requestOptions?)`** - `GET /v1/document/deleted`
  - List deleted documents
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<Document[]>`

- **`listDeletedDocumentChunks(requestOptions?)`** - `GET /v1/document/chunk/deleted`
  - List deleted document chunks
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<DocumentChunk[]>`

- **`restoreAllDocumentChunks(documentId, requestOptions?)`** - `PATCH /v1/document/<id>/chunk/restore-all`
  - Restore all chunks for a document
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Returns: `Promise<{ restored: number }>`

- **`bulkDeleteDocuments(documentIds, requestOptions?)`** - `DELETE /v1/document/bulk-delete`
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

- **`getConversationsByEntity(entityId, params?, headers)`** - `GET /v1/conversation/entity/<entity_id>`
  - Lists conversations for a specific entity (user or lead)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Params: `{ entity_type?, status?, page?, per_page? }`
  - Returns: `Promise<PaginatedResponse<Conversation>>`

- **`getConversationsByAgent(agentId, params?, headers)`** - `GET /v1/conversation/agent/<agent_id>`
  - Lists conversations handled by a specific agent
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Params: `{ status?, page?, per_page? }`
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
  - Uses the client's API credentials automatically; pass `options.headers` to extend or override per request.
  - `raw_events: true` disables JSON parsing so your handler receives the raw SSE payload strings (default: parsed JSON objects when possible).

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

- **`createSdkSettings(payload, headers)`** - `POST /v1/sdk/settings`
  - Creates LLM configuration using provider/model names (no IDs required)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Payload: `{ agent_id?, llm_provider, llm_provider_id?, llm_model, llm_model_id?, llm_api_key?, llm_api_base_url?, llm_temperature?, llm_max_tokens?, llm_additional_params?, embedding_provider, embedding_provider_id?, embedding_model, embedding_model_id?, embedding_api_key?, embedding_api_base_url?, embedding_dimension?, embedding_additional_params?, widget_script_url?, widget_config?, is_default? }`
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
---

### WebsiteService (`client.websites`)

Website crawling and page awareness for agent knowledge bases.

#### Methods

- **`registerWebsiteSource(payload, headers)`** - `POST /v1/website/source`
  - Registers a domain for crawling and links it to an agent
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Payload: `{ agent_id, base_url, seed_urls?, allowed_paths?, disallowed_paths?, crawl_frequency_minutes?, max_pages?, max_depth?, notes? }`
  - Returns: `Promise<{ website_source: WebsiteSource }>`

- **`listWebsiteSources(params, headers)`** - `GET /v1/website/source`
  - Lists website sources for the authenticated company (optionally filtered by `agent_id`)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<{ website_sources: WebsiteSource[] }>`

- **`listWebsitePages(sourceId, headers)`** - `GET /v1/website/source/<source_id>/pages`
  - Retrieves a website source together with its crawled pages
  - Requires: `X-API-Key` + `X-API-Secret` (scope `read`) or JWT
  - Returns: `Promise<{ website_source: WebsiteSource; pages: WebsitePage[] }>`

- **`triggerWebsiteCrawl(sourceId, payload, headers)`** - `POST /v1/website/source/<source_id>/crawl`
  - Queues a fresh crawl for the website source (optionally overriding `max_pages`)
  - Requires: `X-API-Key` + `X-API-Secret` (scope `write`) or JWT
  - Payload: `{ max_pages? }`
  - Returns: `Promise<{ status: string; task_id?: string; website_source_id: string }>`

- **`handshake(payload, headers)`** - `POST /v1/website/handshake`
  - Declares the active page from an embedded widget and can optionally trigger a crawl
  - Requires: none (public endpoint)
  - Payload: `{ agent_id, url, title?, trigger_crawl? }`
  - Returns: `Promise<{ website_source?: WebsiteSource; website_page?: WebsitePage; crawl_task_id?: string | null }>`



