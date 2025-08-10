import { env } from 'node:process';

export default () => ({
  port: env.PORT || 9999,
  database: {
    host: env.DATABASE_HOST || 'localhost',
    port: env.DATABASE_PORT || 5432,
    username: env.DATABASE_USERNAME || 'postgres',
    password: env.DATABASE_PASSWORD || 'password',
    database: env.DATABASE_NAME || 'payment_system',
  },
  redis: {
    host: env.REDIS_HOST || 'localhost',
    port: env.REDIS_PORT || 6379,
  },
  paymentProcessors: {
    defaultUrl:
      env.PAYMENT_PROCESSOR_URL_DEFAULT || 'http://192.168.1.126:8002',
    fallbackUrl:
      env.PAYMENT_PROCESSOR_URL_FALLBACK || 'http://192.168.1.126:8002',
    healthCheckInterval: env.HEALTH_CHECK_INTERVAL || 5000, // 5 segundos
  },
});
