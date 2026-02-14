import mongoose from "mongoose";
const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true,"ledger must be associated with an account"],
    index: true,
    immutable: true
  },
  amount:{
    type: Number,
    required: [true,"amount is required for creating a ledger entry"],
    immutable: true
  },
  transaction:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required: [true,"ledger must be associated with a transaction"],
    index: true,
    immutable: true
  },
  type:{
    type: String,
    enum: {
      values: ["DEBIT", "CREDIT"],
      message: "type can be either DEBIT or CREDIT",
    },
    required: [true,"type is required for creating a ledger entry"],
    immutable: true
  }
})
function preventLegerModification(){
  throw new error("Ledger entries are immutable and cannot be modified or deleted");
}
ledgerSchema.pre("updateOne",preventLegerModification);
ledgerSchema.pre("deleteOne",preventLegerModification);
ledgerSchema.pre("remove",preventLegerModification);
ledgerSchema.pre("findOneAndUpdate",preventLegerModification);
ledgerSchema.pre("findOneAndDelete",preventLegerModification);
ledgerSchema.pre("deleteMany",preventLegerModification);
ledgerSchema.pre("updateMany",preventLegerModification);
ledgerSchema.pre("findOneAndReplace",preventLegerModification);
const ledgerModel = mongoose.model("ledger", ledgerSchema);
export default ledgerModel;