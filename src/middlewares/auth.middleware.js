import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,res,next) => {
    try {
        // when we send token in header it's format is like => Authorization: Bearer tokenName
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ",""); 
        console.log("TOKEN:", token);
        if(!token) {
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if(!user) {
            throw new ApiError(401,"Invalid Access");
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})