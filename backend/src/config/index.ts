import 'dotenv/config';
import { getEnv } from '../utils/getEnv';

export enum EnvList {
  LOCAL_DATABASE_URL = 'LOCAL_DATABASE_URL',
  PROD_DATABASE_URL = 'PROD_DATABASE_URL',
  PORT = 'PORT',
  NODE_ENV = 'NODE_ENV',
  ENCRYPTION_SECRET = 'ENCRYPTION_SECRET',
  APP_USER_AUTH_SECRET = 'APP_USER_AUTH_SECRET',
  STRIPE_PUBLIC_KEY = 'STRIPE_PUBLIC_KEY',
  STRIPE_SECRET_KEY = 'STRIPE_SECRET_KEY',
  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET',
  GOOGLE_REDIRECT_URI = 'GOOGLE_REDIRECT_URI',
  META_APP_ID = 'META_APP_ID',
  META_APP_SECRET = 'META_APP_SECRET',
  META_APP_WHATSAPP_AUTH_CONFIG = 'META_APP_WHATSAPP_AUTH_CONFIG',
  META_APP_REDIRECT_URL = 'META_APP_REDIRECT_URL',
  SUPERBASE_DB_PASSWORD = 'SUPERBASE_DB_PASSWORD',
  SUPERBASE_PROJECT_API_KEY = 'SUPERBASE_PROJECT_API_KEY',
  SUPERBASE_PROJECT_URL = 'SUPERBASE_PROJECT_URL',
  SUPERBASE_STORAGE_BUCKET_NAME = 'SUPERBASE_STORAGE_BUCKET_NAME',
}

const env = getEnv(EnvList.NODE_ENV);

export const appConfig = {
  env,
  port: getEnv(EnvList.PORT) || 5000,
  encryptionSecret: getEnv('ENCRYPTION_SECRET'),
  db: {
    url: env === 'dev' ? getEnv(EnvList.LOCAL_DATABASE_URL) : getEnv(EnvList.PROD_DATABASE_URL),
  },
  stripe: {
    publicKey: getEnv(EnvList.STRIPE_PUBLIC_KEY),
    secretKey: getEnv(EnvList.STRIPE_SECRET_KEY),
    successUrl: 'http://localhost:3000/success',
    cancelUrl: 'http://localhost:3000/cancel',
  },
  googleAuth: {
    GOOGLE_CLIENT_ID: getEnv(EnvList.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: getEnv(EnvList.GOOGLE_CLIENT_SECRET),
    GOOGLE_REDIRECT_URI: getEnv(EnvList.GOOGLE_REDIRECT_URI),
  },
  whatsapp: {
    appId: getEnv('META_APP_ID'),
    appSecret: getEnv('META_APP_SECRET'),
    authConfig: getEnv('META_APP_WHATSAPP_AUTH_CONFIG'),
    callbackUrl: getEnv('META_APP_REDIRECT_URL'),
  },
  superbase: {
    storage: {
      bucketName: getEnv('SUPERBASE_STORAGE_BUCKET_NAME'),
      projectUrl: getEnv('SUPERBASE_PROJECT_URL'),
      apiKey: getEnv('SUPERBASE_PROJECT_API_KEY'),
    },
  },
  appUser: {
    authSecret: getEnv('APP_USER_AUTH_SECRET'),
  },
};
