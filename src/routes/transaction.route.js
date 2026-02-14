import express from "express";
import { authMiddleware , authSystemUserMiddleware} from "../middlewares/auth.middleware.js";
import { createTransaction,createInitialFundsTransaction } from "../controllers/transaction.controller.js";
const router = express.Router();

// Register route
router.post('/',authMiddleware,createTransaction);   
router.post('/system/initial-funds',authSystemUserMiddleware,createInitialFundsTransaction);
export default router;