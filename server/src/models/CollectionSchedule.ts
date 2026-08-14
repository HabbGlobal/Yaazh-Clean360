import { Schema, model, Types } from "mongoose";
export const WEEKDAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;
export const WASTE_TYPES = ["general","recyclable","organic","hazardous","other"] as const;
export interface ICollectionSchedule { zoneId:Types.ObjectId; weekday:(typeof WEEKDAYS)[number]; wasteType:(typeof WASTE_TYPES)[number]; collectionTime:string; notes?:string; isActive:boolean; }
const schema = new Schema<ICollectionSchedule>({ zoneId:{type:Schema.Types.ObjectId,ref:"Zone",required:true}, weekday:{type:String,enum:WEEKDAYS,required:true}, wasteType:{type:String,enum:WASTE_TYPES,required:true}, collectionTime:{type:String,required:true}, notes:{type:String,default:""}, isActive:{type:Boolean,default:true} },{timestamps:true});
schema.index({zoneId:1,weekday:1},{unique:true});
export const CollectionSchedule=model<ICollectionSchedule>("CollectionSchedule",schema);
