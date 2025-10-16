// src/services/website.ts
import { KnowrithmClient } from '../client';

export type WebsiteCrawlStatus = 'active' | 'inactive' | 'crawling' | 'failed';
export type WebsitePageStatus = 'pending' | 'crawled' | 'failed' | 'excluded';

export interface WebsiteSource {
  id: string;
  company_id: string;
  agent_id: string;
  domain?: string;
  base_url: string;
  seed_urls?: string[];
  allowed_paths?: string[];
  disallowed_paths?: string[];
  crawl_config?: Record<string, any> | null;
  max_depth?: number | null;
  max_pages?: number | null;
  crawl_frequency_minutes?: number | null;
  last_crawl_started_at?: string | null;
  last_crawl_completed_at?: string | null;
  last_crawl_status?: WebsiteCrawlStatus | null;
  last_error?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsitePage {
  id: string;
  website_source_id: string;
  canonical_url: string;
  path: string;
  title?: string | null;
  last_crawled_at?: string | null;
  last_crawl_status?: WebsitePageStatus | null;
  last_http_status?: number | null;
  content_hash?: string | null;
  content_length?: number | null;
  language?: string | null;
  checksum?: string | null;
  next_crawl_at?: string | null;
  change_frequency_minutes?: number | null;
  raw_storage_path?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RegisterWebsiteSourcePayload {
  agent_id: string;
  base_url: string;
  seed_urls?: string[];
  allowed_paths?: string[];
  disallowed_paths?: string[];
  crawl_frequency_minutes?: number;
  max_pages?: number;
  max_depth?: number;
  notes?: string;
}

export interface ListWebsiteSourcesParams {
  agent_id?: string;
}

export interface ListWebsiteSourcesResponse {
  website_sources: WebsiteSource[];
}

export interface ListWebsitePagesResponse {
  website_source: WebsiteSource;
  pages: WebsitePage[];
}

export interface TriggerWebsiteCrawlPayload {
  max_pages?: number;
}

export interface TriggerWebsiteCrawlResponse {
  status: string;
  task_id?: string;
  website_source_id: string;
}

export interface WebsiteHandshakePayload {
  agent_id: string;
  url: string;
  title?: string;
  trigger_crawl?: boolean;
}

export interface WebsiteHandshakeResponse {
  website_source?: WebsiteSource;
  website_page?: WebsitePage;
  crawl_task_id?: string | null;
}

/**
 * Client for managing website awareness and crawling operations.
 */
export class WebsiteService {
  constructor(private client: KnowrithmClient) {}

  /**
   * Register a website so an agent can crawl and ingest its content.
   *
   * Endpoint: `POST /v1/website/source`
   */
  async registerWebsiteSource(
    payload: RegisterWebsiteSourcePayload,
    headers?: Record<string, string>
  ): Promise<{ website_source: WebsiteSource }> {
    return this.client.makeRequest('POST', '/website/source', { data: payload, headers });
  }

  /**
   * List website sources configured for the authenticated company.
   *
   * Endpoint: `GET /v1/website/source`
   */
  async listWebsiteSources(
    params?: ListWebsiteSourcesParams,
    headers?: Record<string, string>
  ): Promise<ListWebsiteSourcesResponse> {
    return this.client.makeRequest('GET', '/website/source', { params, headers });
  }

  /**
   * Retrieve a website source along with its crawled pages.
   *
   * Endpoint: `GET /v1/website/source/<source_id>/pages`
   */
  async listWebsitePages(
    sourceId: string,
    headers?: Record<string, string>
  ): Promise<ListWebsitePagesResponse> {
    return this.client.makeRequest('GET', `/website/source/${sourceId}/pages`, { headers });
  }

  /**
   * Manually enqueue a crawl job for a registered website source.
   *
   * Endpoint: `POST /v1/website/source/<source_id>/crawl`
   */
  async triggerWebsiteCrawl(
    sourceId: string,
    payload?: TriggerWebsiteCrawlPayload,
    headers?: Record<string, string>
  ): Promise<TriggerWebsiteCrawlResponse> {
    return this.client.makeRequest('POST', `/website/source/${sourceId}/crawl`, {
      data: payload,
      headers,
    });
  }

  /**
   * Declare an active webpage context from an embedded widget.
   *
   * Endpoint: `POST /v1/website/handshake`
   */
  async handshake(
    payload: WebsiteHandshakePayload,
    headers?: Record<string, string>
  ): Promise<WebsiteHandshakeResponse> {
    return this.client.makeRequest('POST', '/website/handshake', { data: payload, headers });
  }
}

