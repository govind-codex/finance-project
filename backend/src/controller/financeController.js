const Finance = require("../models/Finance");

const createFinance = async (req, res) => {
  try {
    const { salary, expense, goal } = req.body;

    if (salary === undefined || expense === undefined || goal === undefined) {
      return res.status(400).json({
        message: "Salary, expense, and goal are required",
      });
    }

    const salaryAmount = Number(salary);
    const expenseAmount = Number(expense);
    const goalAmount = Number(goal);

    if (
      Number.isNaN(salaryAmount) ||
      Number.isNaN(expenseAmount) ||
      Number.isNaN(goalAmount)
    ) {
      return res.status(400).json({
        message: "Salary, expense, and goal must be valid numbers",
      });
    }

    if (salaryAmount < 0 || expenseAmount < 0 || goalAmount < 0) {
      return res.status(400).json({
        message: "Salary, expense, and goal cannot be negative",
      });
    }

    const remainingAmount = salaryAmount - expenseAmount;
    const goalProgress =
      goalAmount === 0 ? 100 : Math.min((remainingAmount / goalAmount) * 100, 100);

    const finance = await Finance.create({
      salary: salaryAmount,
      expense: expenseAmount,
      goal: goalAmount,
    });

    return res.status(201).json({
      message: "Finance details saved successfully",
      finance: {
        id: finance._id,
        salary: finance.salary,
        expense: finance.expense,
        goal: finance.goal,
        remainingAmount,
        goalProgress: Number(goalProgress.toFixed(2)),
        isGoalAchieved: remainingAmount >= goalAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save finance details",
      error: error.message,
    });
  }
};

module.exports = {
  createFinance,
};
