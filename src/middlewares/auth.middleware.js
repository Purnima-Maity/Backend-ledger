import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blackList.model.js";
export const authMiddleware= async (req, res, next) => {
  const token=req.cookies.token || req.header.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Not authorized,token is missing" });
  }
  const isBlacklisted=await tokenBlacklistModel.findOne({token});
  if(isBlacklisted){
    return res.status(401).json({message:"Not authorized,token is blacklisted"});
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await userModel.findById(decoded.userId);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized token is invalid" });
  }
};
export async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.header.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not authorized, token is missing" });
  }
  const isBlacklisted = await tokenBlacklistModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Not authorized, token is blacklisted" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!user.systemUser) {
      return res.status(403).json({ message: "Not authorized, user is not a system user" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token is invalid" });
  } 
}
