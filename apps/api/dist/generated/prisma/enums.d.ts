export declare const UserRole: {
    readonly MANAGER: "MANAGER";
    readonly EMPLOYEE: "EMPLOYEE";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const UserPermission: {
    readonly USER_MANAGEMENT: "USER_MANAGEMENT";
    readonly STUDENT_REGISTRATION: "STUDENT_REGISTRATION";
};
export type UserPermission = (typeof UserPermission)[keyof typeof UserPermission];
export declare const UserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly PENDING: "PENDING";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
