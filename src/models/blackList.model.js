import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "token is required to blacklist"],
    unique: [true, "token is already blacklisted"]
  }
}, { timestamps: true }
);
tokenBlacklistSchema.index({ createdAt: 1 }, {
  expireAfterSeconds: 60 * 60 * 24 *30 // 30 days
});
const tokenBlacklistModel = mongoose.model("tokenBlacklist", tokenBlacklistSchema);
export default tokenBlacklistModel;