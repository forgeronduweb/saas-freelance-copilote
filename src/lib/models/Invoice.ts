import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: 'Brouillon' | 'Envoyée' | 'Payée' | 'En retard' | 'Annulée';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
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

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    clientName: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Brouillon', 'Envoyée', 'Payée', 'En retard', 'Annulée'],
      default: 'Brouillon',
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
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

const Invoice: Model<IInvoice> =
  (mongoose.models.Invoice as Model<IInvoice>) || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
