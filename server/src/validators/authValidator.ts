import { z } from "zod";
const base64Image=z.string().max(3_000_000).regex(/^data:image\/(png|jpe?g|webp|gif);base64,/i,"Image must be a base64 image data URL");
export const registerSchema=z.object({name:z.string().trim().min(2).max(80),email:z.string().email(),password:z.string().min(8).max(128),zoneId:z.string().regex(/^[a-fA-F0-9]{24}$/,"Select a valid zone"),profileImage:base64Image.optional()});
export const loginSchema=z.object({email:z.string().email(),password:z.string().min(1)});
export const zoneSelectionSchema=z.object({zoneId:z.string().regex(/^[a-fA-F0-9]{24}$/,"A valid zone is required")});
export const verifyOtpSchema=z.object({email:z.string().email(),code:z.string().regex(/^\d{6}$/,"Enter the 6-digit verification code")});
export const resendOtpSchema=z.object({email:z.string().email()});
export const profileSchema=z.object({name:z.string().trim().min(2).max(80).optional(),profileImage:base64Image.optional()}).refine(value=>value.name!==undefined||value.profileImage!==undefined,{message:"Provide a name or profile image"});
