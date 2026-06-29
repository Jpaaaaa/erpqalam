"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_USER_PERMISSIONS = exports.UserPermission = void 0;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
const client_1 = require("../../../generated/prisma/client");
Object.defineProperty(exports, "UserPermission", { enumerable: true, get: function () { return client_1.UserPermission; } });
exports.ALL_USER_PERMISSIONS = [
    client_1.UserPermission.USER_MANAGEMENT,
    client_1.UserPermission.STUDENT_REGISTRATION,
];
function hasPermission(role, permissions, required) {
    if (role === client_1.UserRole.MANAGER) {
        return true;
    }
    return permissions?.includes(required) ?? false;
}
function hasAnyPermission(role, permissions, required) {
    if (role === client_1.UserRole.MANAGER) {
        return true;
    }
    if (!required.length) {
        return true;
    }
    return required.some((permission) => permissions?.includes(permission));
}
//# sourceMappingURL=user-permissions.js.map