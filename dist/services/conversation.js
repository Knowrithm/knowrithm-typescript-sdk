"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = exports.ConversationService = exports.MessageStream = void 0;
const events_1 = require("events");
class MessageStream extends events_1.EventEmitter {
    constructor(metadata, reader, streamUrl, acceptedEvents, parseJson) {
        super();
        this.metadata = metadata;
        this.reader = reader;
        this.streamUrl = streamUrl;
        this.acceptedEvents = acceptedEvents;
        this.parseJson = parseJson ?? true;
        this.startReading();
    }
    getMetadata() {
        return this.metadata;
    }
    get taskId() {
        return this.metadata.task_id;
    }
    get messageId() {
        return this.metadata.message_id;
    }
    async startReading() {
        if (!this.reader)
            return;
        const decoder = new TextDecoder();
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await this.reader.read();
                if (done) {
                    // Process any remaining data in buffer
                    if (buffer.trim()) {
                        this.processLines(buffer.split('\n'));
                    }
                    this.emit('end');
                    break;
                }
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                // Keep the last incomplete chunk in buffer
                buffer = lines.pop() || '';
                // Process complete events
                for (const eventBlock of lines) {
                    if (eventBlock.trim()) {
                        this.processLines(eventBlock.split('\n'));
                    }
                }
            }
        }
        catch (error) {
            this.emit('error', error);
        }
        finally {
            this.close();
        }
    }
    processLines(lines) {
        const event = this.parseSSEEvent(lines);
        if (event && (!this.acceptedEvents || this.acceptedEvents.has(event.event))) {
            this.emit('event', event);
            this.emit(event.event, event.data);
        }
    }
    parseSSEEvent(lines) {
        if (!lines || lines.length === 0)
            return null;
        let eventName = 'message';
        const dataLines = [];
        let eventId;
        let retry;
        for (const rawLine of lines) {
            if (!rawLine || rawLine.startsWith(':'))
                continue;
            const colonIndex = rawLine.indexOf(':');
            if (colonIndex === -1)
                continue;
            const field = rawLine.substring(0, colonIndex);
            let value = rawLine.substring(colonIndex + 1);
            // Remove leading space
            if (value.startsWith(' ')) {
                value = value.substring(1);
            }
            if (field === 'event' && value) {
                eventName = value;
            }
            else if (field === 'data') {
                dataLines.push(value);
            }
            else if (field === 'id' && value) {
                eventId = value;
            }
            else if (field === 'retry' && value) {
                const retryNum = parseInt(value, 10);
                if (!isNaN(retryNum)) {
                    retry = retryNum;
                }
            }
        }
        const rawData = dataLines.join('\n');
        let payload = rawData;
        // Try to parse as JSON when enabled
        if (this.parseJson && rawData) {
            try {
                payload = JSON.parse(rawData);
            }
            catch {
                // Keep as string if not valid JSON
                payload = rawData;
            }
        }
        return {
            event: eventName || 'message',
            data: payload,
            id: eventId,
            retry,
            raw: rawData || undefined,
        };
    }
    close() {
        if (this.reader) {
            this.reader.cancel();
            this.reader = undefined;
        }
        this.removeAllListeners();
    }
    async *[Symbol.asyncIterator]() {
        const eventQueue = [];
        let resolveNext = null;
        let rejectNext = null;
        let ended = false;
        const onEvent = (event) => {
            if (resolveNext) {
                resolveNext({ value: event, done: false });
                resolveNext = null;
                rejectNext = null;
            }
            else {
                eventQueue.push(event);
            }
        };
        const onEnd = () => {
            ended = true;
            if (resolveNext) {
                resolveNext({ value: undefined, done: true });
                resolveNext = null;
                rejectNext = null;
            }
        };
        const onError = (error) => {
            if (rejectNext) {
                rejectNext(error);
                resolveNext = null;
                rejectNext = null;
            }
        };
        this.on('event', onEvent);
        this.on('end', onEnd);
        this.on('error', onError);
        try {
            while (true) {
                if (eventQueue.length > 0) {
                    yield eventQueue.shift();
                }
                else if (ended) {
                    break;
                }
                else {
                    await new Promise((resolve, reject) => {
                        resolveNext = resolve;
                        rejectNext = reject;
                    }).then(result => {
                        if (!result.done) {
                            return result.value;
                        }
                        throw new Error('Stream ended');
                    });
                }
            }
        }
        finally {
            this.off('event', onEvent);
            this.off('end', onEnd);
            this.off('error', onError);
        }
    }
}
exports.MessageStream = MessageStream;
class ConversationService {
    constructor(client) {
        this.client = client;
    }
    async createConversation(agentId, options, headers) {
        const data = { agent_id: agentId, ...options };
        return this.client.makeRequest('POST', '/conversation', { data, headers });
    }
    async listConversations(page, perPage, headers) {
        return this.client.makeRequest('GET', '/conversation', {
            params: { page, per_page: perPage },
            headers,
        });
    }
    async listConversationsForEntity(page, perPage, headers) {
        return this.client.makeRequest('GET', '/conversation/entity', {
            params: { page, per_page: perPage },
            headers,
        });
    }
    async listDeletedConversations(headers) {
        return this.client.makeRequest('GET', '/conversation/deleted', { headers });
    }
    async listConversationMessages(conversationId, page, perPage, headers) {
        return this.client.makeRequest('GET', `/conversation/${conversationId}/messages`, {
            params: { page, per_page: perPage },
            headers,
        });
    }
    async deleteConversation(conversationId, headers) {
        return this.client.makeRequest('DELETE', `/conversation/${conversationId}`, { headers });
    }
    async deleteConversationMessages(conversationId, headers) {
        return this.client.makeRequest('DELETE', `/conversation/${conversationId}/messages`, { headers });
    }
    async restoreConversation(conversationId, headers) {
        return this.client.makeRequest('PATCH', `/conversation/${conversationId}/restore`, { headers });
    }
    async restoreAllMessages(conversationId, headers) {
        return this.client.makeRequest('PATCH', `/conversation/${conversationId}/message/restore-all`, {
            headers,
        });
    }
}
exports.ConversationService = ConversationService;
class MessageService {
    constructor(client) {
        this.client = client;
    }
    async sendMessage(conversationId, message, options) {
        const payload = { message };
        const responsePayload = await this.client.makeRequest('POST', `/conversation/${conversationId}/chat`, {
            data: payload,
            headers: options?.headers,
        });
        if (!options?.stream) {
            return responsePayload;
        }
        return this.streamConversationMessages(conversationId, {
            headers: options.headers,
            streamUrl: options.streamUrl,
            streamTimeout: options.streamTimeout,
            eventTypes: options.eventTypes,
            rawEvents: options.rawEvents,
            initialMetadata: responsePayload,
        });
    }
    async deleteMessage(messageId, headers) {
        return this.client.makeRequest('DELETE', `/message/${messageId}`, { headers });
    }
    async restoreMessage(messageId, headers) {
        return this.client.makeRequest('PATCH', `/message/${messageId}/restore`, { headers });
    }
    async listDeletedMessages(headers) {
        return this.client.makeRequest('GET', '/message/deleted', { headers });
    }
    async streamConversationMessages(conversationId, options) {
        const resolvedUrl = this.resolveStreamUrl(conversationId, options?.initialMetadata, options?.streamUrl);
        if (!resolvedUrl) {
            throw new Error("Streaming is not configured. Provide 'streamUrl' or set KnowrithmConfig.streamPathTemplate/streamBaseUrl.");
        }
        const allowedEvents = options?.eventTypes ? new Set(options.eventTypes) : undefined;
        const metadata = { conversation_id: conversationId };
        if (options?.initialMetadata) {
            Object.assign(metadata, options.initialMetadata);
        }
        const parseJson = options?.rawEvents ? false : true;
        return this.openStream(resolvedUrl, metadata, options?.headers, options?.streamTimeout, allowedEvents, parseJson);
    }
    resolveStreamUrl(conversationId, responsePayload, streamUrlOverride) {
        if (streamUrlOverride) {
            return this.normalizeStreamUrl(streamUrlOverride);
        }
        const payload = responsePayload || {};
        for (const key of ['stream_url', 'sse_url', 'socket_url']) {
            const candidate = payload[key];
            if (candidate) {
                return this.normalizeStreamUrl(String(candidate));
            }
        }
        const template = this.client.config.streamPathTemplate;
        if (!template) {
            return null;
        }
        const tokens = {
            conversation_id: conversationId,
            message_id: payload.message_id || '',
            task_id: payload.task_id || '',
        };
        let formattedPath = template;
        for (const [key, value] of Object.entries(tokens)) {
            formattedPath = formattedPath.replace(`{${key}}`, value);
        }
        return this.normalizeStreamUrl(formattedPath);
    }
    normalizeStreamUrl(pathOrUrl) {
        if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
            return pathOrUrl;
        }
        if (pathOrUrl.startsWith('ws://') || pathOrUrl.startsWith('wss://')) {
            throw new Error('WebSocket URLs are not supported; provide an SSE http(s) endpoint.');
        }
        const baseUrl = this.client.config.streamBaseUrl || this.client.baseUrl;
        if (pathOrUrl.startsWith('/')) {
            return `${baseUrl.replace(/\/$/, '')}${pathOrUrl}`;
        }
        return `${baseUrl.replace(/\/$/, '')}/${pathOrUrl}`;
    }
    async openStream(streamUrl, initialPayload, headers, timeoutOverride, allowedEvents, parseJson = true) {
        const authHeaders = this.client.getAuthHeaders();
        const requestHeaders = {
            ...authHeaders,
            Accept: 'text/event-stream',
            ...headers,
        };
        const timeout = timeoutOverride ?? this.client.config.streamTimeout ?? this.client.config.timeout;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(streamUrl, {
                headers: requestHeaders,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                }
                catch {
                    errorData = { detail: response.statusText };
                }
                const message = errorData.detail || errorData.message || `HTTP ${response.status}`;
                throw new Error(`${message} (GET ${streamUrl})`);
            }
            if (!response.body) {
                throw new Error('Response body is not readable');
            }
            const reader = response.body.getReader();
            const metadata = { ...initialPayload, stream_url: streamUrl };
            return new MessageStream(metadata, reader, streamUrl, allowedEvents, parseJson);
        }
        catch (error) {
            throw new Error(`Failed to open chat stream: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.MessageService = MessageService;
//# sourceMappingURL=conversation.js.map
