import { z } from "zod";
import { WEEKDAYS, WASTE_TYPES } from "../models/CollectionSchedule";
export const scheduleSchema=z.object({zoneId:z.string().regex(/^[a-fA-F0-9]{24}$/),weekday:z.enum(WEEKDAYS),wasteType:z.enum(WASTE_TYPES),collectionTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/,"Use 24-hour HH:MM time"),notes:z.string().max(500).optional(),isActive:z.boolean().optional()});
export const scheduleUpdateSchema=scheduleSchema.omit({zoneId:true}).partial();
