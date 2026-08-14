export type Role = "resident" | "admin";
export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
export type WasteType = "general" | "recyclable" | "organic" | "hazardous" | "other";
export interface Zone { _id: string; zoneNumber: number; name: string; description: string; imageBase64: string; assignedLorry: string; isActive: boolean; }
export interface User { _id: string; name: string; email: string; role: Role; emailVerified: boolean; accountStatus: "active" | "suspended"; profileImage?: string; zoneId?: Zone | string | null; }
export interface Schedule { _id: string; zoneId: string; weekday: Weekday; wasteType: WasteType; collectionTime: string; notes?: string; isActive: boolean; }
