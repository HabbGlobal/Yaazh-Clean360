import { Schema, model, models } from "mongoose";
export interface IZone { zoneNumber:number; name:string; description:string; imageBase64:string; assignedLorry:string; isActive:boolean; }
const schema = new Schema<IZone>({ zoneNumber:{type:Number,required:true,unique:true,min:1}, name:{type:String,required:true,unique:true,trim:true}, description:{type:String,default:""}, imageBase64:{type:String,required:true}, assignedLorry:{type:String,required:true,trim:true,uppercase:true}, isActive:{type:Boolean,default:true} }, {timestamps:true});
export const Zone = models.Zone || model<IZone>("Zone", schema);
