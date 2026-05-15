const express = require("express");
const sessionAuth = require("../auth/sessionAuth");
const {
  addFinanceGoal,
  createFinance,
  getFinanceDashboard,
} = require("../controller/financeController");

const router = express.Router();

router.use(sessionAuth);
router.get("/dashboard", getFinanceDashboard);
router.post("/goals", addFinanceGoal);
router.post("/", createFinance);

module.exports = router;
