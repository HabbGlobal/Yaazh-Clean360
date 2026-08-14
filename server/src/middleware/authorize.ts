import type { NextFunction, Response } from "express"; import type { AuthRequest } from "./authenticate"; import { ApiError } from "../utils/ApiError";
export const authorize=(...roles:("resident"|"admin")[]) => (req:AuthRequest,_res:Response,next:NextFunction)=>!req.auth||!roles.includes(req.auth.role)?next(new ApiError(403,"You do not have permission for this action")):next();
