"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
    cache: {
        store: process.env.CACHE_STORE ?? 'memory',
        redisUrl: process.env.REDIS_URL,
    },
    auth: {
        refreshTokenStore: process.env.REFRESH_TOKEN_STORE ?? 'database',
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3001',
        defaultSchoolCode: process.env.GOOGLE_OAUTH_DEFAULT_SCHOOL_CODE ?? 'QALAM001',
        autoAdminEmails: (process.env.GOOGLE_OAUTH_AUTO_ADMIN_EMAILS ?? '')
            .split(',')
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean),
    },
});
//# sourceMappingURL=configuration.js.map