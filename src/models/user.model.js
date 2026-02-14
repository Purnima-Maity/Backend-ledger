import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "email is required for creating a user"],
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    unique: [true, "email already exists, please use a different email address"]
  },
  name: {
    type: String,
    required: [true, "name is required for creating an account"], 
  },
  password: {
    type: String,
    required: [true, "password is required for creating an account"],
    minlength: [6, "password must be at least 6 characters long"],
    select: false
  },
  systemUser:{
    type: Boolean,
    default: false,
    immutable: true,
    select: false
  }
}, { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  } 
  return this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
const UserModel = mongoose.model("user", userSchema);
export default UserModel;