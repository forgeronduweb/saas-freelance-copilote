import mongoose, { Schema, Document } from 'mongoose';

export interface ICollaborator {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: 'Réunion' | 'Appel' | 'RDV Client' | 'Deadline' | 'Rappel' | 'Autre';
  status: 'Planifié' | 'Confirmé' | 'Terminé' | 'Annulé';
  date: Date;
  time?: string;
  duration?: number; // en minutes
  location?: string;
  clientId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  collaborators?: ICollaborator[];
  createdAt: Date;
  updatedAt: Date;
}

const CollaboratorSchema = new Schema<ICollaborator>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { _id: false }
);

const EventSchema = new Schema<IEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['Réunion', 'Appel', 'RDV Client', 'Deadline', 'Rappel', 'Autre'],
      default: 'Autre',
    },
    status: {
      type: String,
      enum: ['Planifié', 'Confirmé', 'Terminé', 'Annulé'],
      default: 'Planifié',
    },
    date: { type: Date, required: true },
    time: { type: String },
    duration: { type: Number },
    location: { type: String },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    collaborators: { type: [CollaboratorSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
