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
  STRIPE_SUCCESS_URL = 'STRIPE_SUCCESS_URL',
  STRIPE_CANCEL_URL = 'STRIPE_CANCEL_URL',
  STRIPE_WEBHOOK_SECRET = 'STRIPE_WEBHOOK_SECRET',
  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET',
  GOOGLE_REDIRECT_URI = 'GOOGLE_REDIRECT_URI',
  META_APP_ID = 'META_APP_ID',
  META_APP_SECRET = 'META_APP_SECRET',
  META_APP_WHATSAPP_AUTH_CONFIG = 'META_APP_WHATSAPP_AUTH_CONFIG',
  META_APP_REDIRECT_URL = 'META_APP_REDIRECT_URL',
  META_BUSINESS_SYSTEM_TOKEN = 'META_BUSINESS_SYSTEM_TOKEN',
  OPENAI_API_KEY = 'OPENAI_API_KEY',
  LOCAL_QDRANT = 'LOCAL_QDRANT',
  PROD_QDRANT = 'PROD_QDRANT',
  LOCAL_FRONTEND_URL = 'LOCAL_FRONTEND_URL',
  PROD_FRONTEND_URL = 'PROD_FRONTEND_URL',
  LOCAL_BACKEND_URL = 'LOCAL_BACKEND_URL',
  PROD_BACKEND_URL = 'PROD_BACKEND_URL',
  LOCAL_RABBITMQ = 'LOCAL_RABBITMQ',
  PROD_RABBITMQ = 'PROD_RABBITMQ',
  LOCAL_MINIO_ENDPOINT = 'LOCAL_MINIO_ENDPOINT',
  PROD_MINIO_ENDPOINT = 'PROD_MINIO_ENDPOINT',
  MINIO_PUBLIC_BUCKET = 'MINIO_PUBLIC_BUCKET',
  MINIO_ROOT_USER = 'MINIO_ROOT_USER',
  MINIO_ROOT_PASSWORD = 'MINIO_ROOT_PASSWORD',
}

const env = getEnv(EnvList.NODE_ENV);

export const appConfig = {
  env,
  port: getEnv(EnvList.PORT) || 5000,
  encryptionSecret: getEnv('ENCRYPTION_SECRET'),
  openaiKey: getEnv('OPENAI_API_KEY'),
  frontendUrl: env === 'dev' ? getEnv('LOCAL_FRONTEND_URL') : getEnv('PROD_FRONTEND_URL'),
  backendUrl: env === 'dev' ? getEnv('LOCAL_BACKEND_URL') : getEnv('PROD_BACKEND_URL'),
  db: {
    url: env === 'dev' ? getEnv(EnvList.LOCAL_DATABASE_URL) : getEnv(EnvList.PROD_DATABASE_URL),
    qdrant: env === 'dev' ? getEnv(EnvList.LOCAL_QDRANT) : getEnv(EnvList.PROD_QDRANT),
  },
  rabbitmq: env === 'dev' ? getEnv(EnvList.LOCAL_RABBITMQ) : getEnv(EnvList.PROD_RABBITMQ),
  stripe: {
    publicKey: getEnv(EnvList.STRIPE_PUBLIC_KEY),
    secretKey: getEnv(EnvList.STRIPE_SECRET_KEY),
    successUrl: getEnv(EnvList.STRIPE_SUCCESS_URL),
    cancelUrl: getEnv(EnvList.STRIPE_CANCEL_URL),
    webhookSecret: getEnv(EnvList.STRIPE_WEBHOOK_SECRET),
  },
  googleAuth: {
    GOOGLE_CLIENT_ID: getEnv(EnvList.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: getEnv(EnvList.GOOGLE_CLIENT_SECRET),
    GOOGLE_REDIRECT_URI: getEnv(EnvList.GOOGLE_REDIRECT_URI),
  },
  metaBusinessToken: getEnv('META_BUSINESS_SYSTEM_TOKEN'),
  whatsapp: {
    appId: getEnv('META_APP_ID'),
    appSecret: getEnv('META_APP_SECRET'),
    authConfig: getEnv('META_APP_WHATSAPP_AUTH_CONFIG'),
    callbackUrl: getEnv('META_APP_REDIRECT_URL'),
  },
  s3: {
    minioEndpoint: env === 'dev' ? getEnv('LOCAL_MINIO_ENDPOINT') : getEnv('PROD_MINIO_ENDPOINT'),
    minioRootUser: getEnv('MINIO_ROOT_USER'),
    minioRootPassword: getEnv('MINIO_ROOT_PASSWORD'),
    bucketName: getEnv('MINIO_PUBLIC_BUCKET'),
  },
  appUser: {
    authSecret: getEnv('APP_USER_AUTH_SECRET'),
  },
  mcpKeys: {
    openaiKey: getEnv('OPENAI_API_KEY'),
  },
};
