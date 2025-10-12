"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.UserStatus = exports.DocumentStatus = exports.EntityType = exports.ConversationStatus = exports.AgentStatus = void 0;
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["ACTIVE"] = "active";
    AgentStatus["INACTIVE"] = "inactive";
    AgentStatus["TRAINING"] = "training";
    AgentStatus["MAINTENANCE"] = "maintenance";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["ACTIVE"] = "active";
    ConversationStatus["ARCHIVED"] = "archived";
    ConversationStatus["DELETED"] = "deleted";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
var EntityType;
(function (EntityType) {
    EntityType["USER"] = "user";
    EntityType["LEAD"] = "lead";
})(EntityType || (exports.EntityType = EntityType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "pending";
    DocumentStatus["PROCESSING"] = "processing";
    DocumentStatus["PROCESSED"] = "processed";
    DocumentStatus["FAILED"] = "failed";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING_VERIFICATION"] = "pending_verification";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=enums.js.map