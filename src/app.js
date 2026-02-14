import express from 'express';
import dotenv from "dotenv";
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js'; 
import accountRoutes from './routes/account.route.js';
import transactionRoutes from './routes/transaction.route.js';
dotenv.config();
const app = express();

connectDB();
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes);
app.use('/api/accounts',accountRoutes)
app.use("/api/transactions",transactionRoutes)
export default app;
