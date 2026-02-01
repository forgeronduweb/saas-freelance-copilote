import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  missionId?: mongoose.Types.ObjectId;
  title: string;
  type: 'Brief' | 'Cahier des charges' | 'Livrable' | 'Autre';
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectDocumentSchema = new Schema<IProjectDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    missionId: { type: Schema.Types.ObjectId, ref: 'Mission' },
    title: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['Brief', 'Cahier des charges', 'Livrable', 'Autre'],
      default: 'Autre',
    },
    description: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
  },
  { timestamps: true }
);

ProjectDocumentSchema.index({ userId: 1 });
ProjectDocumentSchema.index({ missionId: 1 });

const ProjectDocument: Model<IProjectDocument> =
  (mongoose.models.ProjectDocument as Model<IProjectDocument>) ||
  mongoose.model<IProjectDocument>('ProjectDocument', ProjectDocumentSchema);

export default ProjectDocument;
