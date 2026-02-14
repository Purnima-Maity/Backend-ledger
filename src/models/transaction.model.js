import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true,"transaction must be associated with a from account"],
    index: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true,"transaction must be associated with a from account"],
    index: true
  },
  status:{
    type:String,
    enum:{
      values:["COMPLETED","PENDING","FAILED","REVERSED"],
      message:"status can be either COMPLETED,REVERSED,FAILED,OR PENDING",
    },
    default:"PENDING"
  },
  amount: {
    type: Number,
    required: [true, "amount is required for creating a transaction"],
    min: [0, "transaction amount must be greater than 0"],
  },
  idempotencyKey: {
    type: String,
    required: [true, "idempotencyKey is required for creating a transaction"],
    index: true,
    unique: true
  },
}, { timestamps: true });
const transactionModel = mongoose.model("transaction", transactionSchema);
export default transactionModel;