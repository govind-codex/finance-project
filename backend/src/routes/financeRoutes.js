const express = require("express");
const {
  createFinance,
  getFinanceDashboard,
} = require("../controller/financeController");

const router = express.Router();

router.get("/dashboard", getFinanceDashboard);
router.post("/", createFinance);

module.exports = router;
