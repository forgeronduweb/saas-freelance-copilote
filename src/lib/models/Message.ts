import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  sentAt: Date;
  editedAt?: Date;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
}

const MessageSchema = new Schema<IMessage>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  editedAt: {
    type: Date,
    default: null,
  },
  attachments: [{
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

// Index pour optimiser les recherches
MessageSchema.index({ projectId: 1, sentAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ isRead: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
