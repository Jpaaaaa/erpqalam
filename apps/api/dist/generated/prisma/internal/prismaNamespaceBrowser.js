"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullsOrder = exports.QueryMode = exports.SortOrder = exports.RefreshTokenScalarFieldEnum = exports.UserScalarFieldEnum = exports.StudentScalarFieldEnum = exports.PendingStudentScalarFieldEnum = exports.SchoolScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = require("@prisma/client/runtime/index-browser");
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    School: 'School',
    PendingStudent: 'PendingStudent',
    Student: 'Student',
    User: 'User',
    RefreshToken: 'RefreshToken'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.SchoolScalarFieldEnum = {
    id: 'id',
    name: 'name',
    code: 'code',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.PendingStudentScalarFieldEnum = {
    id: 'id',
    firstName: 'firstName',
    secondName: 'secondName',
    thirdName: 'thirdName',
    fourthName: 'fourthName',
    section: 'section',
    phoneNumbers: 'phoneNumbers',
    guardianInfo: 'guardianInfo',
    comeViaWho: 'comeViaWho',
    schoolId: 'schoolId',
    submittedByUserId: 'submittedByUserId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.StudentScalarFieldEnum = {
    id: 'id',
    firstName: 'firstName',
    secondName: 'secondName',
    thirdName: 'thirdName',
    fourthName: 'fourthName',
    section: 'section',
    phoneNumbers: 'phoneNumbers',
    guardianInfo: 'guardianInfo',
    comeViaWho: 'comeViaWho',
    schoolId: 'schoolId',
    registeredByUserId: 'registeredByUserId',
    registeredAt: 'registeredAt',
    pendingStudentId: 'pendingStudentId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: 'phone',
    role: 'role',
    permissions: 'permissions',
    status: 'status',
    schoolId: 'schoolId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.RefreshTokenScalarFieldEnum = {
    id: 'id',
    token: 'token',
    userId: 'userId',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map