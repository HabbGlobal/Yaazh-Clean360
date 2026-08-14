import type { Request,Response,NextFunction } from "express"; import { Zone } from "../models/Zone"; import { ApiError } from "../utils/ApiError";
export async function listZones(_req:Request,res:Response,next:NextFunction){try{res.json({data:await Zone.find({isActive:true}).sort({name:1})});}catch(e){next(e);}}
export async function createZone(req:Request,res:Response,next:NextFunction){try{res.status(201).json({data:await Zone.create(req.body)});}catch(e){next(e);}}
export async function updateZone(req:Request,res:Response,next:NextFunction){try{const zone=await Zone.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!zone)throw new ApiError(404,"Zone not found");res.json({data:zone});}catch(e){next(e);}}
export async function deleteZone(req:Request,res:Response,next:NextFunction){try{const zone=await Zone.findByIdAndUpdate(req.params.id,{isActive:false},{new:true});if(!zone)throw new ApiError(404,"Zone not found");res.json({data:zone});}catch(e){next(e);}}
