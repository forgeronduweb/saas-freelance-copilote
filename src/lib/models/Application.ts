import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: number; // en jours
  status: 'en-attente' | 'acceptee' | 'refusee';
  appliedAt: Date;
  respondedAt?: Date;
  responseMessage?: string;
}

const ApplicationSchema = new Schema<IApplication>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  proposedRate: {
    type: Number,
    required: true,
    min: 0,
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['en-attente', 'acceptee', 'refusee'],
    default: 'en-attente',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
    default: null,
  },
  responseMessage: {
    type: String,
    maxlength: 500,
    default: null,
  },
}, {
  timestamps: true,
});

// Index pour optimiser les recherches
ApplicationSchema.index({ projectId: 1, appliedAt: -1 });
ApplicationSchema.index({ freelancerId: 1, appliedAt: -1 });
ApplicationSchema.index({ status: 1 });

// Index unique pour éviter les candidatures multiples
ApplicationSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
