import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMission extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  clientName: string;
  title: string;
  description?: string;
  status: 'To-do' | 'En cours' | 'Terminé';
  priority?: 'Basse' | 'Moyenne' | 'Haute';
  dueDate?: Date;
  budget?: number;
  timeSpent?: number; // en minutes
  evidenceUrls?: string[];
  checklist?: Array<{ text: string; done: boolean }>;
  verificationStatus?: 'Aucun' | 'En vérification' | 'Validée' | 'Refusée';
  verificationMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MissionSchema = new Schema<IMission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    clientName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['To-do', 'En cours', 'Terminé'],
      default: 'To-do',
    },
    priority: {
      type: String,
      enum: ['Basse', 'Moyenne', 'Haute'],
      default: 'Moyenne',
    },
    dueDate: { type: Date },
    budget: { type: Number },
    timeSpent: { type: Number, default: 0 },
    evidenceUrls: { type: [String], default: [] },
    checklist: {
      type: [{ text: { type: String, required: true }, done: { type: Boolean, default: false } }],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ['Aucun', 'En vérification', 'Validée', 'Refusée'],
      default: 'Aucun',
    },
    verificationMessage: { type: String },
  },
  { timestamps: true }
);

MissionSchema.index({ userId: 1, status: 1 });
MissionSchema.index({ userId: 1, dueDate: 1 });

const Mission: Model<IMission> =
  (mongoose.models.Mission as Model<IMission>) || mongoose.model<IMission>('Mission', MissionSchema);

export default Mission;
