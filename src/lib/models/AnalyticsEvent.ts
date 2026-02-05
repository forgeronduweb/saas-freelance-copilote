import mongoose, { Document, Model, Schema } from "mongoose";

export type AnalyticsEventType = "pageview" | "duration";

export interface IAnalyticsEvent extends Document {
  siteKey: string;
  event: AnalyticsEventType;
  path: string;
  referrerHost?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  visitorId: string;
  sessionId: string;
  durationMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    siteKey: { type: String, required: true, index: true },
    event: { type: String, enum: ["pageview", "duration"], required: true, index: true },
    path: { type: String, required: true, index: true },
    referrerHost: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    utmTerm: { type: String },
    utmContent: { type: String },
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    durationMs: { type: Number },
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ siteKey: 1, createdAt: -1 });
AnalyticsEventSchema.index({ siteKey: 1, path: 1, createdAt: -1 });
AnalyticsEventSchema.index({ siteKey: 1, sessionId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ siteKey: 1, utmSource: 1, utmMedium: 1, createdAt: -1 });

const AnalyticsEvent: Model<IAnalyticsEvent> =
  (mongoose.models.AnalyticsEvent as Model<IAnalyticsEvent>) ||
  mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);

export default AnalyticsEvent;
