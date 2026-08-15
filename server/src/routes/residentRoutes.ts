import { Router } from "express";
import { createComplaint, createFeedback, deleteMyComplaint, getReadinessHistory, getReadinessSummary, listMyComplaints, listMyFeedback, upsertReadinessVote } from "../controllers/residentController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateRequest } from "../middleware/validateRequest";
import { complaintSchema, feedbackSchema, readinessVoteSchema } from "../validators/residentValidator";

const router = Router();
router.use(authenticate, authorize("resident"));
router.get("/readiness", getReadinessSummary);
router.get("/readiness/history", getReadinessHistory);
router.post("/readiness", validateRequest(readinessVoteSchema), upsertReadinessVote);
router.get("/complaints", listMyComplaints);
router.post("/complaints", validateRequest(complaintSchema), createComplaint);
router.delete("/complaints/:id", deleteMyComplaint);
router.get("/feedback", listMyFeedback);
router.post("/feedback", validateRequest(feedbackSchema), createFeedback);

export default router;
