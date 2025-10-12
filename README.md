
// README.md
# Knowrithm TypeScript SDK

TypeScript/JavaScript SDK for interacting with the Knowrithm API.

## Installation

```bash
npm install @knowrithm/sdk
# or
yarn add @knowrithm/sdk
```

## Quick Start

```typescript
import { KnowrithmClient } from '@knowrithm/sdk';

// Initialize the client
const client = new KnowrithmClient({
  apiKey: 'your_api_key',
  apiSecret: 'your_api_secret',
});

// Create a company
const company = await client.companies.createCompany({
  name: 'Acme Corp',
  email: 'contact@acme.com',
});

// Create an agent
const agent = await client.agents.createAgent({
  name: 'Customer Support Bot',
  company_id: company.id,
  description: 'AI-powered customer support',
});

// Create a conversation and send a message
const conversation = await client.conversations.createConversation(agent.id);
const response = await client.messages.sendMessage(
  conversation.id,
  'Hello, how can I help you today?'
);

console.log(response);
```

## High-Level API

The SDK provides high-level wrapper classes for common workflows:

### Agent Wrapper

```typescript
import { KnowrithmAgent } from '@knowrithm/sdk';

const agent = new KnowrithmAgent(client, 'agent-id');

// Chat with the agent
const response = await agent.chat('What are your business hours?');

// Get agent details
const details = await agent.getDetails();

// Get metrics
const metrics = await agent.getMetrics();

// Clone the agent
const clonedAgent = await agent.clone('New Agent Name');
```

### Company Wrapper

```typescript
import { KnowrithmCompany } from '@knowrithm/sdk';

const company = new KnowrithmCompany(client, 'company-id');

// Create an agent
const agent = await company.createAgent('Support Bot', 'Handles customer queries');

// List agents
const agents = await company.listAgents();

// Create a lead
const lead = await company.createLead('John', 'Doe', 'john@example.com');

// Get analytics
const analytics = await company.getAnalytics();
```

### Conversation Wrapper

```typescript
import { KnowrithmConversation } from '@knowrithm/sdk';

const conversation = new KnowrithmConversation(client, 'conversation-id');

// Send a message
const response = await conversation.sendMessage('Hello!');

// Get messages
const messages = await conversation.getMessages();

// Stream messages
const stream = await conversation.streamMessages();
stream.on('event', (event) => {
  console.log('Event:', event);
});
```

## Streaming Messages

The SDK supports Server-Sent Events (SSE) for real-time message streaming:

```typescript
// Stream with async iterator
const stream = await client.messages.sendMessage(conversationId, 'Hello', {
  stream: true,
});

for await (const event of stream) {
  console.log('Event type:', event.event);
  console.log('Data:', event.data);
}

// Or use event listeners
stream.on('message', (data) => {
  console.log('Message:', data);
});

stream.on('error', (error) => {
  console.error('Stream error:', error);
});

stream.on('end', () => {
  console.log('Stream ended');
});

// Clean up
stream.close();
```

## File Uploads

Upload documents to an agent:

```typescript
import fs from 'fs';

// Upload files
const fileBuffer = fs.readFileSync('document.pdf');
const result = await client.documents.uploadDocuments('agent-id', {
  filePaths: [
    { file: fileBuffer, filename: 'document.pdf' }
  ],
  metadata: {
    tags: ['support', 'faq']
  }
});

// Upload from URLs
const urlResult = await client.documents.uploadDocuments('agent-id', {
  urls: ['https://example.com/doc.pdf'],
  metadata: {
    source: 'web'
  }
});
```

## Database Connections

Manage database connections for text-to-SQL:

```typescript
// Create a database connection
const connection = await client.databases.createConnection(
  'My Database',
  'postgresql://user:pass@localhost:5432/mydb',
  'postgres',
  'agent-id'
);

// Test the connection
const testResult = await client.databases.testConnection(connection.id);

// Text-to-SQL
const sqlResult = await client.databases.textToSql(
  connection.id,
  'Show me all users who signed up last month',
  true, // execute the query
  100   // result limit
);

console.log('Generated SQL:', sqlResult.sql);
console.log('Results:', sqlResult.results);
```

## Authentication

### API Key Authentication (Default)

```typescript
const client = new KnowrithmClient({
  apiKey: 'your_api_key',
  apiSecret: 'your_api_secret',
});
```

### JWT Authentication

```typescript
// Login to get JWT
const authResponse = await client.auth.login('user@example.com', 'password');
const accessToken = authResponse.access_token;

// Use JWT for authenticated requests
const headers = { Authorization: `Bearer ${accessToken}` };
const user = await client.auth.getCurrentUser(headers);

// Refresh token
const refreshed = await client.auth.refreshAccessToken(authResponse.refresh_token);
```

## Configuration

Customize the client configuration:

```typescript
import { KnowrithmClient, KnowrithmConfig } from '@knowrithm/sdk';

const client = new KnowrithmClient({
  apiKey: 'your_api_key',
  apiSecret: 'your_api_secret',
  config: {
    baseUrl: 'https://app.knowrithm.org/api',
    apiVersion: 'v1',
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    retryBackoffFactor: 1.5,
    verifySsl: true,
    streamPathTemplate: '/conversation/{conversation_id}/messages/stream',
    streamTimeout: 60000, // 60 seconds for streaming
  }
});
```

## Error Handling

```typescript
import { KnowrithmAPIError } from '@knowrithm/sdk';

try {
  const agent = await client.agents.getAgent('invalid-id');
} catch (error) {
  if (error instanceof KnowrithmAPIError) {
    console.error('Status:', error.statusCode);
    console.error('Error code:', error.errorCode);
    console.error('Message:', error.message);
    console.error('Response data:', error.responseData);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Analytics and Metrics

```typescript
// Dashboard overview
const overview = await client.analytics.getDashboardOverview();

// Agent analytics
const agentMetrics = await client.analytics.getAgentAnalytics(
  'agent-id',
  '2024-01-01',
  '2024-12-31'
);

// Lead analytics
const leadMetrics = await client.analytics.getLeadAnalytics(
  '2024-01-01',
  '2024-12-31'
);

// Export analytics
const exportResult = await client.analytics.exportAnalytics(
  'conversations', // type: conversations | leads | agents | usage
  'csv',           // format: json | csv
  '2024-01-01',
  '2024-12-31'
);
```

## Admin Operations

```typescript
// List users with filters
const users = await client.admin.listUsers({
  status: 'active',
  role: 'admin',
  page: 1,
  per_page: 50,
});

// Update user status
await client.admin.updateUserStatus('user-id', 'suspended', 'Policy violation');

// Force password reset
await client.admin.forcePasswordReset('user-id');

// Get system configuration
const config = await client.admin.getSystemConfiguration();

// Update configuration
await client.admin.upsertSystemConfiguration(
  'max_upload_size',
  10485760, // 10MB
  {
    config_type: 'integer',
    description: 'Maximum file upload size in bytes',
  }
);

// Audit logs
const logs = await client.admin.getAuditLogs({
  entity_type: 'user',
  event_type: 'login',
  limit: 100,
});
```

## LLM Settings

```typescript
// Create LLM settings
const settings = await client.settings.createSettings({
  llm_provider_id: 'openai',
  llm_model_id: 'gpt-4',
  embedding_provider_id: 'openai',
  embedding_model_id: 'text-embedding-ada-002',
  llm_temperature: 0.7,
  llm_max_tokens: 2000,
  agent_id: 'agent-id',
});

// Test settings
const testResult = await client.settings.testSettings(settings.id);

// List providers
const providers = await client.providers.listProviders();

// Create custom model
await client.providers.createModel('provider-id', {
  name: 'Custom Model',
  type: 'llm',
  context_window: 8192,
  input_price: 0.01,
  output_price: 0.02,
  currency: 'USD',
});
```

## Geographic Data

```typescript
// Seed reference data (countries, states, cities)
await client.addresses.seedReferenceData();

// List countries
const countries = await client.addresses.listCountries();

// Get states by country
const states = await client.addresses.listStatesByCountry(1); // USA

// Get cities by state
const cities = await client.addresses.listCitiesByState(5); // California

// Create company address
await client.addresses.createAddress(
  '123 Main St',
  cityId,
  stateId,
  countryId,
  {
    postal_code: '12345',
    lat: 37.7749,
    lan: -122.4194,
    is_primary: true,
  }
);
```

## TypeScript Types

The SDK is fully typed with TypeScript:

```typescript
import {
  AgentStatus,
  ConversationStatus,
  DocumentStatus,
  UserStatus,
  UserRole,
  EntityType,
  AuthResponse,
  PaginationParams,
  PaginatedResponse,
  DateRangeParams,
} from '@knowrithm/sdk';

// Use enums for type safety
const status: AgentStatus = AgentStatus.ACTIVE;
const entityType: EntityType = EntityType.USER;

// Typed responses
const agents: PaginatedResponse<any> = await client.agents.listAgents({
  page: 1,
  per_page: 20,
  status: AgentStatus.ACTIVE,
});
```

## Browser Usage

For browser environments, ensure you have a fetch polyfill for older browsers:

```typescript
import 'whatwg-fetch'; // if needed for older browsers
import { KnowrithmClient } from '@knowrithm/sdk';

const client = new KnowrithmClient({
  apiKey: process.env.REACT_APP_API_KEY!,
  apiSecret: process.env.REACT_APP_API_SECRET!,
});

// Use in React, Vue, Angular, etc.
async function loadAgents() {
  try {
    const agents = await client.agents.listAgents();
    return agents;
  } catch (error) {
    console.error('Failed to load agents:', error);
  }
}
```

## Node.js Usage

Works seamlessly in Node.js environments:

```typescript
import { KnowrithmClient } from '@knowrithm/sdk';
import fs from 'fs';

const client = new KnowrithmClient({
  apiKey: process.env.KNOWRITHM_API_KEY!,
  apiSecret: process.env.KNOWRITHM_API_SECRET!,
});

// File uploads in Node.js
const fileBuffer = fs.readFileSync('./document.pdf');
await client.documents.uploadDocuments('agent-id', {
  filePaths: [{ file: fileBuffer, filename: 'document.pdf' }],
});
```

## API Reference

For detailed API documentation, visit [https://docs.knowrithm.org](https://docs.knowrithm.org)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@knowrithm.org or visit our [support portal](https://support.knowrithm.org).


// Example usage file: examples/basic-usage.ts
```typescript
import { KnowrithmClient, KnowrithmAgent } from '@knowrithm/sdk';

async function main() {
  // Initialize client
  const client = new KnowrithmClient({
    apiKey: process.env.KNOWRITHM_API_KEY!,
    apiSecret: process.env.KNOWRITHM_API_SECRET!,
  });

  try {
    // Create a company
    console.log('Creating company...');
    const company = await client.companies.createCompany({
      name: 'My Tech Company',
      email: 'contact@mytech.com',
      website: 'https://mytech.com',
    });
    console.log('Company created:', company.id);

    // Create an agent
    console.log('Creating agent...');
    const agentData = await client.agents.createAgent({
      name: 'Support Assistant',
      description: 'Helps customers with technical support',
      company_id: company.id,
    });
    console.log('Agent created:', agentData.id);

    // Use high-level agent wrapper
    const agent = new KnowrithmAgent(client, agentData.id);

    // Chat with the agent
    console.log('Starting conversation...');
    const response = await agent.chat('What services do you offer?');
    console.log('Agent response:', response);

    // Get agent metrics
    const metrics = await agent.getMetrics();
    console.log('Agent metrics:', metrics);

    // Upload a document
    console.log('Uploading document...');
    await client.documents.uploadDocuments(agentData.id, {
      urls: ['https://example.com/faq.pdf'],
      metadata: { category: 'FAQ' },
    });
    console.log('Document uploaded successfully');

    // List conversations
    const conversations = await agent.getConversations(10);
    console.log(`Found ${conversations.length} conversations`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

// Example streaming: examples/streaming.ts
```typescript
import { KnowrithmClient } from '@knowrithm/sdk';

async function streamingExample() {
  const client = new KnowrithmClient({
    apiKey: process.env.KNOWRITHM_API_KEY!,
    apiSecret: process.env.KNOWRITHM_API_SECRET!,
  });

  // Create conversation
  const conversation = await client.conversations.createConversation('agent-id');

  // Send message with streaming
  const stream = await client.messages.sendMessage(
    conversation.id,
    'Tell me a long story',
    { stream: true }
  );

  console.log('Streaming response...');

  // Use async iterator
  for await (const event of stream) {
    if (event.event === 'message') {
      process.stdout.write(event.data.content || '');
    } else if (event.event === 'error') {
      console.error('Error:', event.data);
    }
  }

  console.log('\nStream completed');
}

streamingExample();

```typescript

// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};

// .gitignore
node_modules/
dist/
*.log
.env
.DS_Store
coverage/
*.tsbuildinfo
```