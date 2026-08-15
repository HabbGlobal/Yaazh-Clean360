import { Schema, model, Types } from "mongoose";

export const COMPLAINT_TYPES = ["lorry-did-not-come", "skipped-my-street", "irregular-collection", "other"] as const;
export const COMPLAINT_STATUSES = ["submitted", "in-review", "resolved"] as const;

export interface IComplaint {
  userId: Types.ObjectId;
  zoneId: Types.ObjectId;
  complaintType: (typeof COMPLAINT_TYPES)[number];
  description: string;
  photoEvidence?: string;
  status: (typeof COMPLAINT_STATUSES)[number];
  resolutionNote?: string;
}

const schema = new Schema<IComplaint>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  zoneId: { type: Schema.Types.ObjectId, ref: "Zone", required: true },
  complaintType: { type: String, enum: COMPLAINT_TYPES, required: true },
  description: { type: String, required: true, trim: true },
  photoEvidence: { type: String, default: "" },
  status: { type: String, enum: COMPLAINT_STATUSES, default: "submitted" },
  resolutionNote: { type: String, default: "" }
}, { timestamps: true });

schema.index({ userId: 1, createdAt: -1 });
schema.index({ zoneId: 1, status: 1 });

export const Complaint = model<IComplaint>("Complaint", schema);
