import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createAccountController,getUserAccountsController,getAccountBalanceController, getAccounts, getAccount } from '../controllers/account.controller.js';
import { get } from 'mongoose';
const router = express.Router();

// Register route
router.post('/create',authMiddleware,createAccountController);   
router.get('/getAccounts',authMiddleware,getAccounts);
router.get('/getAccount/:id',authMiddleware,getAccount);
/**
 * -GET/api/accounts
 * -Get all accounts of the logged in user
 * -protected Route
 */
router.get('/',authMiddleware,getUserAccountsController);

/**
 * -GET/api/accounts/balance/:accountId
 * -Get balance of a particular accounts
 */
router.get('/balance/:accountId',authMiddleware,getAccountBalanceController);
export default router;  