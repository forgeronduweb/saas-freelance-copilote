import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId; // Celui qui donne l'avis
  reviewedId: mongoose.Types.ObjectId; // Celui qui reçoit l'avis
  rating: number; // 1-5
  comment?: string;
  reviewType: 'client-to-freelance' | 'freelance-to-client';
  isPublic: boolean;
  reviewedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewedId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 1000,
    default: null,
  },
  reviewType: {
    type: String,
    required: true,
    enum: ['client-to-freelance', 'freelance-to-client'],
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index pour optimiser les recherches
ReviewSchema.index({ reviewedId: 1, reviewedAt: -1 });
ReviewSchema.index({ projectId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isPublic: 1 });

// Index unique pour éviter les avis multiples pour le même projet
ReviewSchema.index({ projectId: 1, reviewerId: 1, reviewType: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
