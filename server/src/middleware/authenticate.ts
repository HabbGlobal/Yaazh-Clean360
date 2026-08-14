import type { NextFunction, Request, Response } from "express"; import { ApiError } from "../utils/ApiError"; import { verifyToken } from "../utils/jwt";
export interface AuthRequest extends Request { auth?: { userId:string; role:"resident"|"admin" }; }
export function authenticate(req:AuthRequest,_res:Response,next:NextFunction){try{const token=req.headers.authorization?.replace(/^Bearer\s+/i,"");if(!token)throw new ApiError(401,"Authentication is required");req.auth=verifyToken(token);next();}catch(error){next(error instanceof ApiError?error:new ApiError(401,"Invalid or expired token"));}}
