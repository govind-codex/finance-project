const express = require("express");
const sessionAuth = require("../auth/sessionAuth");
const {
  addFinanceGoal,
  createFinance,
  getFinanceDashboard,
  updateFinanceAmounts,
} = require("../controller/financeController");

const router = express.Router();

router.use(sessionAuth);
router.get("/dashboard", getFinanceDashboard);
router.post("/goals", addFinanceGoal);
router.patch("/", updateFinanceAmounts);
router.post("/", createFinance);

module.exports = router;
