import accountModel from "../models/account.model.js";
export const createAccountController = async (req, res) => {
  try {
    const user  = req.user;
    const account = await accountModel.create({ user:user._id });
    res.status(201).json({ message: "Account created successfully", account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAccounts = async (req, res) => {
  try {
    const accounts = await accountModel.find().populate("user");
    res.status(200).json({ accounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export async function getUserAccountsController(req, res) {
  try {
    const accounts = await accountModel.find({ user: req.user._id });
    res.status(200).json({ accounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAccountBalanceController(req, res) {
  try {
    const { accountId } = req.params;
    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id
    });
    if(!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    const balance=await account.getBalance();

    res.status(200).json({ 
      accountId:account._id,
      balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await accountModel.findById(id).populate("user");
    res.status(200).json({ account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


