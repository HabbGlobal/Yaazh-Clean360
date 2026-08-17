import { Schema, model, models } from "mongoose";
export interface IEmailOtp { email: string; codeHash: string; expiresAt: Date; attempts: number; }
const schema = new Schema<IEmailOtp>({ email:{type:String,required:true,unique:true,lowercase:true}, codeHash:{type:String,required:true}, expiresAt:{type:Date,required:true,index:{expires:0}}, attempts:{type:Number,default:0} },{timestamps:true});
export const EmailOtp = models.EmailOtp || model<IEmailOtp>("EmailOtp",schema);
