export type Role = "resident" | "admin";
export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
export type WasteType = "general" | "recyclable" | "organic" | "hazardous" | "other";
export interface Zone { _id: string; zoneNumber: number; name: string; description: string; imageBase64: string; assignedLorry: string; isActive: boolean; }
export interface User { _id: string; name: string; email: string; phone?: string; address?: string; role: Role; emailVerified: boolean; accountStatus: "active" | "suspended"; profileImage?: string; zoneId?: Zone | string | null; }
export interface Schedule { _id: string; zoneId: string; weekday: Weekday; wasteType: WasteType; collectionTime: string; notes?: string; isActive: boolean; }
export type ReadinessResponse = "ready" | "not-ready";
export interface ReadinessSummary { voteDate: string; ready: number; notReady: number; total: number; zoneResidentCount?: number; notVoted?: number; readyPercentage: number; notReadyPercentage?: number; votedPercentage?: number; isCollectionDay?: boolean; myResponse: ReadinessResponse | null; }
export type ComplaintType = "lorry-did-not-come" | "skipped-my-street" | "irregular-collection" | "other";
export type ComplaintStatus = "submitted" | "in-review" | "resolved";
export interface Complaint { _id: string; complaintType: ComplaintType; description: string; photoEvidence?: string; status: ComplaintStatus; resolutionNote?: string; createdAt?: string; }
export interface Feedback { _id: string; rating: number; comment?: string; serviceDate: string; createdAt?: string; }
export interface FeedbackSummary { items: Feedback[]; averageRating: number; total: number; }
