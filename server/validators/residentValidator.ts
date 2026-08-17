import { z } from "zod";
import { COMPLAINT_TYPES } from "../models/Complaint";

const base64Image = z.string().max(3_000_000).regex(/^data:image\/(png|jpe?g|webp);base64,/i, "Photo evidence must be a base64 image data URL");

export const readinessVoteSchema = z.object({
  response: z.enum(["ready", "not-ready"]),
  voteDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const complaintSchema = z.object({
  complaintType: z.enum(COMPLAINT_TYPES),
  description: z.string().trim().min(10).max(800),
  photoEvidence: base64Image.optional()
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(600).optional(),
  serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});
