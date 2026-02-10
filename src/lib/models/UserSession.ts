import mongoose, { Document, Schema } from 'mongoose';

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export interface IUserSession extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  userAgent?: string;
  ip?: string;
  deviceName?: string | null;
  deviceModel?: string | null;
  deviceType: DeviceType;
  lastSeenAt: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    deviceName: { type: String, default: null },
    deviceModel: { type: String, default: null },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
      required: true,
    },
    lastSeenAt: { type: Date, required: true, default: () => new Date() },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSessionSchema.index({ userId: 1, lastSeenAt: -1 });
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.UserSession || mongoose.model<IUserSession>('UserSession', UserSessionSchema);
