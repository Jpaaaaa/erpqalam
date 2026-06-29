export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    schoolCode: string;
}
export declare class RegisterSchoolDto {
    schoolName: string;
    schoolCode: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
