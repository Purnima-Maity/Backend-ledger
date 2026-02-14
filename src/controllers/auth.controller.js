import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import tokenBlacklistModel from '../models/blackList.model.js';
import {sendRegistrationEmail} from '../services/email.service.js'
// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        status: 'failed'
      });
    }
    // Create new user
    const user = await userModel.create({
      email,
      password,
      name
    });
    await sendRegistrationEmail(user.email, user.name)

    const token = jwt.sign({ userId: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "3d"
      }
    )
    res.cookie("token", token)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error("Registration Error:", error); // This will show the real problem in your console
    res.status(500).json({ message: error.message });
  }
};
// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Check password 
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '3d' });
    res.cookie("token", token)
    res.status(200).json({
      message: 'User logged in successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error("login Error:", error); // This will show the real problem in your console
    res.status(500).json({ message: error.message });
  }
};

//logout user
export const logoutUser = async (req, res) => {
  const token = req.cookies.token || req.header.authorization?.split(" ")[1]; 
  if(!token) {
    return res.status(401).json({ message: 'Not authorized, token is missing' });
  }
  res.clearCookie('token');
  await tokenBlacklistModel.create({ token });
  res.status(200).json({ message: 'User logged out successfully' });
};
