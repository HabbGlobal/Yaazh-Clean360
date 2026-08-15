export type Role = "resident" | "admin";
export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
export type WasteType = "recyclable" | "organic" | "hazardous" | "glass" | "chemical" | "electronic" | "other";
export interface Zone { _id: string; zoneNumber: number; name: string; description: string; imageBase64: string; assignedLorry: string; isActive: boolean; }
export interface User { _id: string; name: string; email: string; phone?: string; address?: string; role: Role; emailVerified: boolean; accountStatus: "active" | "suspended"; profileImage?: string; zoneId?: Zone | string | null; createdAt?: string; }
export interface Schedule { _id: string; zoneId: string; weekday: Weekday; wasteType: WasteType; collectionTime: string; notes?: string; isActive: boolean; }
export type ReadinessResponse = "ready" | "not-ready";
export interface ReadinessSummary { voteDate: string; ready: number; notReady: number; total: number; zoneResidentCount?: number; notVoted?: number; readyPercentage: number; notReadyPercentage?: number; votedPercentage?: number; isCollectionDay?: boolean; myResponse: ReadinessResponse | null; }
export type ComplaintType = "lorry-did-not-come" | "skipped-my-street" | "irregular-collection" | "other";
export type ComplaintStatus = "submitted" | "in-review" | "resolved";
export interface Complaint { _id: string; complaintType: ComplaintType; description: string; photoEvidence?: string; status: ComplaintStatus; resolutionNote?: string; createdAt?: string; }
export interface Feedback { _id: string; rating: number; comment?: string; serviceDate: string; createdAt?: string; }
export interface FeedbackSummary { items: Feedback[]; averageRating: number; total: number; }
export interface AdminOverview { residents: number; activeResidents: number; zones: number; schedules: number; votes: number; complaints: { submitted: number; inReview: number; resolved: number; total: number }; feedback: { total: number; averageRating: number }; complaintTypes: { type: ComplaintType; count: number }[]; feedbackRatings: { rating: number; count: number }[]; residentsByZone: { zone: string; count: number }[]; voteResponses: { response: ReadinessResponse; count: number }[]; complaintsTrend: { date: string; count: number }[]; }
export interface AdminComplaint extends Complaint { userId: { _id: string; name: string; email: string; phone?: string }; zoneId: { _id: string; name: string; assignedLorry: string }; userStats?: { total: number; resolved: number }; }
export interface AdminVote { _id: string; voteDate: string; response: ReadinessResponse; userId: { _id: string; name: string; email: string }; zoneId: { _id: string; name: string; assignedLorry: string }; }
export interface AdminVoteZone { zoneId: string; zoneNumber: number; zoneName: string; assignedLorry: string; activeResidents: number; voted: number; notVoted: number; ready: number; notReady: number; readyPercentage: number; notReadyPercentage: number; votedPercentage: number; decision: boolean; }
export interface AdminVoteSummary { voteDate: string; zones: AdminVoteZone[]; totals: { ready: number; notReady: number; voted: number; notVoted: number; readyPercentage: number }; }
export interface AdminFeedback extends Feedback { userId: { _id: string; name: string; email: string }; zoneId: { _id: string; name: string }; }
export interface AdminFeedbackRating { rating: number; count: number; }
export interface AdminFeedbackZone { zoneId: string; zoneName: string; count: number; averageRating: number; }
export interface AdminFeedbackSummary { total: number; averageRating: number; ratings: AdminFeedbackRating[]; zones: AdminFeedbackZone[]; items: AdminFeedback[]; }
