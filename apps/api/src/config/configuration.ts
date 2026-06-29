export default () => ({
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
});
