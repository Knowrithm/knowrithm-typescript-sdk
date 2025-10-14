import { KnowrithmClient } from '../client';
import { EventEmitter } from 'events';
export interface ChatEvent {
    event: string;
    data: any;
    id?: string;
    retry?: number;
    raw?: string;
}
export declare class MessageStream extends EventEmitter {
    private reader?;
    private metadata;
    streamUrl: string;
    acceptedEvents?: Set<string>;
    private parseJson;
    constructor(metadata: Record<string, any>, reader: ReadableStreamDefaultReader<Uint8Array>, streamUrl: string, acceptedEvents?: Set<string>, parseJson?: boolean);
    getMetadata(): Record<string, any>;
    get taskId(): string | undefined;
    get messageId(): string | undefined;
    private startReading;
    private processLines;
    private parseSSEEvent;
    close(): void;
    [Symbol.asyncIterator](): AsyncIterableIterator<ChatEvent>;
}
export declare class ConversationService {
    private client;
    constructor(client: KnowrithmClient);
    createConversation(agentId: string, options?: {
        title?: string;
        metadata?: Record<string, any>;
        max_context_length?: number;
    }, headers?: Record<string, string>): Promise<any>;
    listConversations(page?: number, perPage?: number, headers?: Record<string, string>): Promise<any>;
    listConversationsForEntity(page?: number, perPage?: number, headers?: Record<string, string>): Promise<any>;
    listDeletedConversations(headers?: Record<string, string>): Promise<any>;
    listConversationMessages(conversationId: string, page?: number, perPage?: number, headers?: Record<string, string>): Promise<any>;
    deleteConversation(conversationId: string, headers?: Record<string, string>): Promise<any>;
    deleteConversationMessages(conversationId: string, headers?: Record<string, string>): Promise<any>;
    restoreConversation(conversationId: string, headers?: Record<string, string>): Promise<any>;
    restoreAllMessages(conversationId: string, headers?: Record<string, string>): Promise<any>;
}
export declare class MessageService {
    private client;
    constructor(client: KnowrithmClient);
    sendMessage(conversationId: string, message: string, options?: {
        headers?: Record<string, string>;
        stream?: boolean;
        streamUrl?: string;
        streamTimeout?: number;
        eventTypes?: string[];
        rawEvents?: boolean;
    }): Promise<any | MessageStream>;
    deleteMessage(messageId: string, headers?: Record<string, string>): Promise<any>;
    restoreMessage(messageId: string, headers?: Record<string, string>): Promise<any>;
    listDeletedMessages(headers?: Record<string, string>): Promise<any>;
    streamConversationMessages(conversationId: string, options?: {
        headers?: Record<string, string>;
        streamUrl?: string;
        streamTimeout?: number;
        eventTypes?: string[];
        rawEvents?: boolean;
        initialMetadata?: Record<string, any>;
    }): Promise<MessageStream>;
    private resolveStreamUrl;
    private normalizeStreamUrl;
    private openStream;
}
//# sourceMappingURL=conversation.d.ts.map
