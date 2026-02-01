import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOpportunity extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  source: 'LinkedIn' | 'Twitter/X' | 'Web' | 'Malt' | 'Upwork' | 'Autre';
  title: string;
  company: string;
  description?: string;
  url?: string;
  budget?: number;
  status: 'Nouvelle' | 'Contactée' | 'En discussion' | 'Gagnée' | 'Perdue' | 'Ignorée';
  publishedAt: Date;
  contactedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    source: {
      type: String,
      required: true,
      enum: ['LinkedIn', 'Twitter/X', 'Web', 'Malt', 'Upwork', 'Autre'],
      default: 'Web',
    },
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    budget: { type: Number },
    status: {
      type: String,
      required: true,
      enum: ['Nouvelle', 'Contactée', 'En discussion', 'Gagnée', 'Perdue', 'Ignorée'],
      default: 'Nouvelle',
    },
    publishedAt: { type: Date, default: Date.now },
    contactedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

OpportunitySchema.index({ userId: 1, status: 1 });
OpportunitySchema.index({ userId: 1, publishedAt: -1 });

const Opportunity: Model<IOpportunity> =
  (mongoose.models.Opportunity as Model<IOpportunity>) ||
  mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);

export default Opportunity;
