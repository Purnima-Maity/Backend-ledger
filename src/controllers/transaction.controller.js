import transactionModel from "../models/transaction.model.js";
import accountModel from "../models/account.model.js";
import userModel from "../models/user.model.js";
import ledgerModel from "../models/ledger.model.js";
import { sendTransactionEmail } from "../services/email.service.js";
import mongoose from "mongoose";
/**
 * -create a new transaction
 * The 10-step TRANSFER FLOW:
 * 1. Vaalidate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (pending)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction as completed
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

export async function createTransaction(req, res) {
  const session = await mongoose.startSession(); // 1. Start session early
  try {
    session.startTransaction();
    // validate request
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }
    const fromUserAccount = await accountModel.findById(fromAccount).session(session);
    const toUserAccount = await accountModel.findById(toAccount).populate("user").session(session);
    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "Invalid fromaAccount or toAccount"
      });
    }
    //validate idempotency key
    const existingTransaction = await transactionModel.findOne({
      idempotencyKey: idempotencyKey
    });
    if (existingTransaction) {
      if (existingTransaction.status === "COMPLETED") {
        return res.status(200).json({
          message: "Transaction already processed",
          transaction: existingTransaction
        });
      }
      if (existingTransaction.status === "PENDING") {
        return res.status(200).json({
          message: "Transaction is still processing",
        });
      }
      if (existingTransaction.status === "FAILED") {
        return res.status(500).json({
          message: "Transaction already failed",
        });
      }
      if (existingTransaction.status === "REVERSED") {
        return res.status(500).json({
          message: "Transaction already reversed,please retry",
        });
      }
    }

    // check account status
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
      return res.status(400).json({
        message: "fromAccount and toAccount must be active to process transaction",
      });
    }

    // Derive sender balance from ledger
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance.
     Current balancr is ${balance}.
     Requested amount is ${amount}`
      });
    }
    // create transaction (pending)

    const [transaction] = await transactionModel.create([{
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING"
    }], { session });

    // create DEBIT and CREDIT ledger entry
    await ledgerModel.create([
      { account: fromAccount, type: "CREDIT", amount, transaction: transaction._id },
      { account: toAccount, type: "DEBIT", amount, transaction: transaction._id }
    ], { session, ordered: true });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();

    // send email notification
    await sendTransactionEmail(req.user.email, req.user.name, amount, toUserAccount.user.name);
    res.status(201).json({
      message: "Transaction completed successfully",
      transaction
    });
    // await sendTransactionFailedEmail(req.user.email,req.user.name,amount,toAccount);
  } catch (error) {
    // 8. CRITICAL: Rollback changes if anything failed
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    await session.endSession();
  }
}

export async function createInitialFundsTransaction(req, res) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // validate request
    const { toAccount, amount, idempotencyKey } = req.body;
    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }
    const toUserAccount = await accountModel.findOne({
      _id: toAccount
    });
    if (!toUserAccount) {
      return res.status(400).json({
        message: "Invalid toAccount"
      });
    }
    // check account status
    if (toUserAccount.status !== "ACTIVE") {
      return res.status(400).json({
        message: "toAccount must be active to process transaction",
      });
    }
    const targetAccount = await accountModel.findById(toAccount).populate("user");

    const fromUserAccount = await accountModel.findOne({
      user: req.user._id,
    }).session(session);

    if (!fromUserAccount) {
      return res.status(400).json({
        message: "system user account not found"
      });
    }

    // create transaction (pending) 
    const [transaction] = await transactionModel.create([{
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING"
    }], { session });

    await ledgerModel.create([
      { account: fromUserAccount._id, type: "CREDIT", amount, transaction: transaction._id },
      { account: toAccount, type: "DEBIT", amount, transaction: transaction._id }
    ], { session, ordered: true });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();

    // send email notification
    try {
      await sendTransactionEmail(
        targetAccount.user.email,
        targetAccount.user.name,
        amount,
        targetAccount.user.name
      );
    } catch (emailError) {
      console.error("Email failed but transaction succeeded:", emailError);
      // We don't return 500 here because the money was already moved!
    }
    res.status(201).json({
      message: "Transaction completed successfully",
      transaction
    });
  } catch (error) {
    // 8. CRITICAL: Rollback changes if anything failed
    await session.abortTransaction();
    console.error("TRANSACTION ERROR:", error);
    // Add this to see details in your console
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }

}