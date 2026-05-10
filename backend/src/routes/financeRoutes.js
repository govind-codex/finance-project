const express = require("express");
const { createFinance } = require("../controller/financeController");

const router = express.Router();

router.post("/", createFinance);

module.exports = router;
