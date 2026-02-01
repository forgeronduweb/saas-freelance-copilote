import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: 'Feature' | 'Bug' | 'Documentation' | 'Autre';
  status: 'À faire' | 'En cours' | 'Terminé' | 'Annulé';
  priority: 'Haute' | 'Moyenne' | 'Basse' | 'Urgente';
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['Feature', 'Bug', 'Documentation', 'Autre'],
      default: 'Feature',
    },
    status: {
      type: String,
      enum: ['À faire', 'En cours', 'Terminé', 'Annulé'],
      default: 'À faire',
    },
    priority: {
      type: String,
      enum: ['Basse', 'Moyenne', 'Haute', 'Urgente'],
      default: 'Moyenne',
    },
    dueDate: { type: Date },
    completedAt: { type: Date },
    estimatedHours: { type: Number },
    actualHours: { type: Number },
  },
  { timestamps: true }
);

const Task: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
