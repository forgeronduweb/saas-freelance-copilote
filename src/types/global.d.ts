import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };

  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN?: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      EMAIL_SERVER_HOST?: string;
      EMAIL_SERVER_PORT?: string;
      EMAIL_SERVER_USER?: string;
      EMAIL_SERVER_PASSWORD?: string;
      EMAIL_FROM?: string;
      UPLOAD_DIR?: string;
      MAX_FILE_SIZE?: string;
      PAYMENT_PROVIDER_API_KEY?: string;
      PAYMENT_PROVIDER_SECRET?: string;
      APP_NAME?: string;
      APP_URL?: string;
      SUPPORT_EMAIL?: string;
    }
  }
}

export {};
