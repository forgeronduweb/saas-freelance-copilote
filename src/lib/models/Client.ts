import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  status: 'Prospect' | 'Actif' | 'Inactif' | 'Perdu';
  source?: string;
  notes?: string;
  totalProjects: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    address: { type: String },
    status: {
      type: String,
      enum: ['Prospect', 'Actif', 'Inactif', 'Perdu'],
      default: 'Prospect',
    },
    source: { type: String },
    notes: { type: String },
    totalProjects: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
