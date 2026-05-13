const express = require("express");
const sessionAuth = require("../auth/sessionAuth");
const {
  createFinance,
  getFinanceDashboard,
} = require("../controller/financeController");

const router = express.Router();

router.use(sessionAuth);
router.get("/dashboard", getFinanceDashboard);
router.post("/", createFinance);

module.exports = router;
