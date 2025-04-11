 import {asyncHandler} from "../utils/async-handler.js";
 import { ApiError } from "../utils/api-error.js";
 import jwt from "jsonwebtoken";
 import { User } from "../models/user.models.js";
 
 export const auth = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken ?? req.body.accessToken;
    if (!token) {
      throw new ApiError(401, "Not authorized");
    }
  
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded._id).select("-password");
      if (!user) throw new ApiError(404, "User not found");
  
      req.user = user; // ✅ This makes req.user._id available
      next();
    } catch (err) {
      throw new ApiError(401, "Invalid token");
    }
  });
  
  