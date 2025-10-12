"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowrithmConversation = exports.KnowrithmCompany = exports.KnowrithmAgent = exports.LeadService = exports.ProviderService = exports.SettingsService = exports.AdminService = exports.AddressService = exports.AnalyticsService = exports.DatabaseService = exports.DocumentService = exports.MessageStream = exports.MessageService = exports.ConversationService = exports.CompanyService = exports.AgentService = exports.UserService = exports.ApiKeyService = exports.AuthService = exports.KnowrithmAPIError = exports.KnowrithmConfig = exports.KnowrithmClient = void 0;
// src/index.ts
// Main client
var client_1 = require("./client");
Object.defineProperty(exports, "KnowrithmClient", { enumerable: true, get: function () { return client_1.KnowrithmClient; } });
// Configuration
var config_1 = require("./config");
Object.defineProperty(exports, "KnowrithmConfig", { enumerable: true, get: function () { return config_1.KnowrithmConfig; } });
// Errors
var errors_1 = require("./errors");
Object.defineProperty(exports, "KnowrithmAPIError", { enumerable: true, get: function () { return errors_1.KnowrithmAPIError; } });
// Services
var auth_1 = require("./services/auth");
Object.defineProperty(exports, "AuthService", { enumerable: true, get: function () { return auth_1.AuthService; } });
Object.defineProperty(exports, "ApiKeyService", { enumerable: true, get: function () { return auth_1.ApiKeyService; } });
Object.defineProperty(exports, "UserService", { enumerable: true, get: function () { return auth_1.UserService; } });
var agent_1 = require("./services/agent");
Object.defineProperty(exports, "AgentService", { enumerable: true, get: function () { return agent_1.AgentService; } });
var company_1 = require("./services/company");
Object.defineProperty(exports, "CompanyService", { enumerable: true, get: function () { return company_1.CompanyService; } });
var conversation_1 = require("./services/conversation");
Object.defineProperty(exports, "ConversationService", { enumerable: true, get: function () { return conversation_1.ConversationService; } });
Object.defineProperty(exports, "MessageService", { enumerable: true, get: function () { return conversation_1.MessageService; } });
Object.defineProperty(exports, "MessageStream", { enumerable: true, get: function () { return conversation_1.MessageStream; } });
var document_1 = require("./services/document");
Object.defineProperty(exports, "DocumentService", { enumerable: true, get: function () { return document_1.DocumentService; } });
var database_1 = require("./services/database");
Object.defineProperty(exports, "DatabaseService", { enumerable: true, get: function () { return database_1.DatabaseService; } });
var analytics_1 = require("./services/analytics");
Object.defineProperty(exports, "AnalyticsService", { enumerable: true, get: function () { return analytics_1.AnalyticsService; } });
var address_1 = require("./services/address");
Object.defineProperty(exports, "AddressService", { enumerable: true, get: function () { return address_1.AddressService; } });
var admin_1 = require("./services/admin");
Object.defineProperty(exports, "AdminService", { enumerable: true, get: function () { return admin_1.AdminService; } });
var settings_1 = require("./services/settings");
Object.defineProperty(exports, "SettingsService", { enumerable: true, get: function () { return settings_1.SettingsService; } });
Object.defineProperty(exports, "ProviderService", { enumerable: true, get: function () { return settings_1.ProviderService; } });
var lead_1 = require("./services/lead");
Object.defineProperty(exports, "LeadService", { enumerable: true, get: function () { return lead_1.LeadService; } });
// High-level wrappers
var agent_2 = require("./wrappers/agent");
Object.defineProperty(exports, "KnowrithmAgent", { enumerable: true, get: function () { return agent_2.KnowrithmAgent; } });
var company_2 = require("./wrappers/company");
Object.defineProperty(exports, "KnowrithmCompany", { enumerable: true, get: function () { return company_2.KnowrithmCompany; } });
var conversation_2 = require("./wrappers/conversation");
Object.defineProperty(exports, "KnowrithmConversation", { enumerable: true, get: function () { return conversation_2.KnowrithmConversation; } });
// Types and enums
__exportStar(require("./types/enums"), exports);
__exportStar(require("./types/auth"), exports);
__exportStar(require("./types/common"), exports);
//# sourceMappingURL=index.js.map