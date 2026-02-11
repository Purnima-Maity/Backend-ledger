import express from 'express';
import dotenv from "dotenv";
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js'; 
dotenv.config();
const app = express();

connectDB();
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes);


export default app;
