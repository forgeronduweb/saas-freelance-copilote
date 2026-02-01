import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  userId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  clientName: string;
  clientEmail?: string;
  quoteNumber: string;
  publicToken?: string;
  title: string;
  description?: string;
  amount: number;
  tax: number;
  total: number;
  status: 'Brouillon' | 'Envoyé' | 'Accepté' | 'Refusé' | 'Expiré';
  validUntil: Date;
  acceptedAt?: Date;
  refusedAt?: Date;
  suggestions?: {
    message: string;
    createdAt: Date;
  }[];
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    clientName: { type: String, required: true },
    clientEmail: { type: String },
    quoteNumber: { type: String, required: true },
    publicToken: { type: String, unique: true, sparse: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Brouillon', 'Envoyé', 'Accepté', 'Refusé', 'Expiré'],
      default: 'Brouillon',
    },
    validUntil: { type: Date, required: true },
    acceptedAt: { type: Date },
    refusedAt: { type: Date },
    suggestions: [
      {
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Quote || mongoose.model<IQuote>('Quote', QuoteSchema);
