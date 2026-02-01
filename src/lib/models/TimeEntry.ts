import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeEntry extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  description?: string;
  date: Date;
  hours: number;
  billable: boolean;
  hourlyRate?: number;
  invoiced: boolean;
  invoiceId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    description: { type: String },
    date: { type: Date, required: true, default: Date.now },
    hours: { type: Number, required: true },
    billable: { type: Boolean, default: true },
    hourlyRate: { type: Number },
    invoiced: { type: Boolean, default: false },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  },
  { timestamps: true }
);

export default mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
