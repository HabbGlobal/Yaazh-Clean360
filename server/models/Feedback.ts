import { Schema, model, models, Types } from "mongoose";

export interface IFeedback { userId: Types.ObjectId; zoneId: Types.ObjectId; rating: number; comment?: string; serviceDate: string; }

const schema = new Schema<IFeedback>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  zoneId: { type: Schema.Types.ObjectId, ref: "Zone", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: "", trim: true },
  serviceDate: { type: String, required: true }
}, { timestamps: true });

schema.index({ userId: 1, serviceDate: 1 });
schema.index({ zoneId: 1, serviceDate: 1 });

export const Feedback = models.Feedback || model<IFeedback>("Feedback", schema);
