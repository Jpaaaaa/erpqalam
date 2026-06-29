import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly School: "School";
    readonly PendingStudent: "PendingStudent";
    readonly Student: "Student";
    readonly User: "User";
    readonly RefreshToken: "RefreshToken";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const SchoolScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly code: "code";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SchoolScalarFieldEnum = (typeof SchoolScalarFieldEnum)[keyof typeof SchoolScalarFieldEnum];
export declare const PendingStudentScalarFieldEnum: {
    readonly id: "id";
    readonly firstName: "firstName";
    readonly secondName: "secondName";
    readonly thirdName: "thirdName";
    readonly fourthName: "fourthName";
    readonly section: "section";
    readonly phoneNumbers: "phoneNumbers";
    readonly guardianInfo: "guardianInfo";
    readonly comeViaWho: "comeViaWho";
    readonly schoolId: "schoolId";
    readonly submittedByUserId: "submittedByUserId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PendingStudentScalarFieldEnum = (typeof PendingStudentScalarFieldEnum)[keyof typeof PendingStudentScalarFieldEnum];
export declare const StudentScalarFieldEnum: {
    readonly id: "id";
    readonly firstName: "firstName";
    readonly secondName: "secondName";
    readonly thirdName: "thirdName";
    readonly fourthName: "fourthName";
    readonly section: "section";
    readonly phoneNumbers: "phoneNumbers";
    readonly guardianInfo: "guardianInfo";
    readonly comeViaWho: "comeViaWho";
    readonly schoolId: "schoolId";
    readonly registeredByUserId: "registeredByUserId";
    readonly registeredAt: "registeredAt";
    readonly pendingStudentId: "pendingStudentId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type StudentScalarFieldEnum = (typeof StudentScalarFieldEnum)[keyof typeof StudentScalarFieldEnum];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly firstName: "firstName";
    readonly lastName: "lastName";
    readonly phone: "phone";
    readonly role: "role";
    readonly permissions: "permissions";
    readonly status: "status";
    readonly schoolId: "schoolId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const RefreshTokenScalarFieldEnum: {
    readonly id: "id";
    readonly token: "token";
    readonly userId: "userId";
    readonly expiresAt: "expiresAt";
    readonly createdAt: "createdAt";
};
export type RefreshTokenScalarFieldEnum = (typeof RefreshTokenScalarFieldEnum)[keyof typeof RefreshTokenScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
