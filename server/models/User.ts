import { Schema, model, models, Types } from "mongoose";
export type UserRole = "resident" | "admin";
export type AccountStatus = "active" | "suspended";
export interface IUser { name: string; email: string; phone: string; address: string; password: string; role: UserRole; emailVerified: boolean; accountStatus: AccountStatus; profileImage?: string; zoneId?: Types.ObjectId | null; }
const schema = new Schema<IUser>({ name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, phone:{type:String,required:true,trim:true}, address:{type:String,required:true,trim:true}, password:{type:String,required:true,select:false}, role:{type:String,enum:["resident","admin"],default:"resident"}, emailVerified:{type:Boolean,default:false}, accountStatus:{type:String,enum:["active","suspended"],default:"active"}, profileImage:{type:String,default:""}, zoneId:{type:Schema.Types.ObjectId,ref:"Zone",default:null,required:function(){return this.role==="resident";}} }, { timestamps:true });
schema.index({ zoneId: 1, role: 1, accountStatus: 1 });
export const User = models.User || model<IUser>("User", schema);
