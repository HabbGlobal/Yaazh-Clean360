import { Schema, model, Types } from "mongoose";

export type ReadinessResponse = "ready" | "not-ready";
export interface IReadinessVote { userId: Types.ObjectId; zoneId: Types.ObjectId; voteDate: string; response: ReadinessResponse; }

const schema = new Schema<IReadinessVote>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  zoneId: { type: Schema.Types.ObjectId, ref: "Zone", required: true },
  voteDate: { type: String, required: true },
  response: { type: String, enum: ["ready", "not-ready"], required: true }
}, { timestamps: true });

schema.index({ userId: 1, voteDate: 1 }, { unique: true });
schema.index({ zoneId: 1, voteDate: 1 });

export const ReadinessVote = model<IReadinessVote>("ReadinessVote", schema);
