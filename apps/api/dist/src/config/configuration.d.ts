declare const _default: () => {
    port: number;
    database: {
        url: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string;
        refreshSecret: string | undefined;
        refreshExpiresIn: string;
    };
    cache: {
        store: string;
        redisUrl: string | undefined;
    };
    auth: {
        refreshTokenStore: string;
    };
    google: {
        clientId: string | undefined;
        clientSecret: string | undefined;
        callbackUrl: string | undefined;
        frontendUrl: string;
        defaultSchoolCode: string;
        autoAdminEmails: string[];
    };
};
export default _default;
