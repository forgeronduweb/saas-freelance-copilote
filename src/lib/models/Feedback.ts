import mongoose, { Schema, Document, Model } from "mongoose"

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  email?: string
  type: "bug" | "idea" | "other"
  message: string
  pageUrl?: string
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String },
    type: {
      type: String,
      required: true,
      enum: ["bug", "idea", "other"],
      default: "other",
    },
    message: { type: String, required: true, maxlength: 4000 },
    pageUrl: { type: String },
  },
  { timestamps: true }
)

FeedbackSchema.index({ userId: 1, createdAt: -1 })
FeedbackSchema.index({ type: 1, createdAt: -1 })

const Feedback: Model<IFeedback> =
  (mongoose.models.Feedback as Model<IFeedback>) ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema)

export default Feedback
