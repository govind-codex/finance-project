const Finance = require("../models/Finance");

const roundToTwo = (value) => Number(value.toFixed(2));

const getGoalAmount = (goal) => {
  if (typeof goal === "number") {
    return goal;
  }

  return Number(goal?.amount || 0);
};

const getGoalTimeInMonths = (goal) => {
  if (typeof goal === "number") {
    return 1;
  }

  return Number(goal?.timeInMonths || 1);
};

const getFinanceStatus = (expenseRate, savingsRate) => {
  if (expenseRate > 80) {
    return "High spending";
  }

  if (savingsRate >= 30) {
    return "Excellent saving";
  }

  if (savingsRate >= 20) {
    return "Good saving";
  }

  if (savingsRate >= 10) {
    return "Average saving";
  }

  return "Needs improvement";
};

const getRecommendation = (expenseRate, savingsRate, goalAchievementRate) => {
  if (expenseRate > 80) {
    return "Your expenses are taking most of your salary. Try reducing non-essential spending first.";
  }

  if (goalAchievementRate < 50) {
    return "You are far from your goal. Increase savings or lower expenses to improve goal progress.";
  }

  if (savingsRate >= 30) {
    return "You are saving well. Keep this pattern and consider investing the surplus wisely.";
  }

  if (savingsRate >= 20) {
    return "Your savings are healthy. Review expenses regularly to stay on track.";
  }

  return "Try to save at least 20% of your salary to build stronger financial stability.";
};

const createFinance = async (req, res) => {
  try {
    const { salary, expense, goal } = req.body;

    if (salary === undefined || expense === undefined || goal === undefined) {
      return res.status(400).json({
        message: "Salary, expense, and goal are required",
      });
    }

    const { name: goalName, amount, timeInMonths } = goal;
    const salaryAmount = Number(salary);
    const expenseAmount = Number(expense);
    const goalAmount = Number(amount);
    const goalTimeInMonths = Number(timeInMonths);

    if (
      !goalName ||
      Number.isNaN(salaryAmount) ||
      Number.isNaN(expenseAmount) ||
      Number.isNaN(goalAmount) ||
      Number.isNaN(goalTimeInMonths)
    ) {
      return res.status(400).json({
        message: "Salary, expense, goal name, goal amount, and goal time are required",
      });
    }

    if (
      salaryAmount < 0 ||
      expenseAmount < 0 ||
      goalAmount < 0 ||
      goalTimeInMonths < 1
    ) {
      return res.status(400).json({
        message: "Salary, expense, and goal amount cannot be negative. Goal time must be at least 1 month",
      });
    }

    const remainingAmount = salaryAmount - expenseAmount;
    const monthlyGoalAmount = goalAmount / goalTimeInMonths;
    const goalProgress =
      goalAmount === 0
        ? 100
        : Math.min((remainingAmount / goalAmount) * 100, 100);

    const finance = await Finance.create({
      user: req.user._id,
      salary: salaryAmount,
      expense: expenseAmount,
      goal: {
        name: goalName,
        amount: goalAmount,
        timeInMonths: goalTimeInMonths,
      },
    });

    return res.status(201).json({
      message: "Finance details saved successfully",
      finance: {
        id: finance._id,
        user: finance.user,
        salary: finance.salary,
        expense: finance.expense,
        goal: finance.goal,
        remainingAmount,
        monthlyGoalAmount: roundToTwo(monthlyGoalAmount),
        canAchieveMonthlyGoal: remainingAmount >= monthlyGoalAmount,
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

const getFinanceDashboard = async (req, res) => {
  try {
    const financeData = await Finance.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    if (financeData.length === 0) {
      return res.json({
        message: "No finance data found",
        summary: {
          totalEntries: 0,
          totalSalary: 0,
          totalExpense: 0,
          totalGoal: 0,
          totalRemaining: 0,
          averageSalary: 0,
          averageExpense: 0,
          averageGoal: 0,
          savingsRate: 0,
          expenseRate: 0,
          goalAchievementRate: 0,
          status: "No data",
          recommendation: "Add salary, expense, and goal data to see your dashboard analysis.",
        },
        entries: [],
      });
    }

    const totals = financeData.reduce(
      (acc, item) => {
        const goalAmount = getGoalAmount(item.goal);

        acc.salary += item.salary;
        acc.expense += item.expense;
        acc.goal += goalAmount;
        acc.remaining += item.salary - item.expense;
        return acc;
      },
      {
        salary: 0,
        expense: 0,
        goal: 0,
        remaining: 0,
      }
    );

    const totalEntries = financeData.length;
    const savingsRate =
      totals.salary === 0 ? 0 : (totals.remaining / totals.salary) * 100;
    const expenseRate =
      totals.salary === 0 ? 0 : (totals.expense / totals.salary) * 100;
    const goalAchievementRate =
      totals.goal === 0 ? 100 : Math.min((totals.remaining / totals.goal) * 100, 100);

    const status = getFinanceStatus(expenseRate, savingsRate);
    const recommendation = getRecommendation(
      expenseRate,
      savingsRate,
      goalAchievementRate
    );

    const entries = financeData.map((item) => {
      const remainingAmount = item.salary - item.expense;
      const goalAmount = getGoalAmount(item.goal);
      const goalTimeInMonths = getGoalTimeInMonths(item.goal);
      const monthlyGoalAmount = goalAmount / goalTimeInMonths;
      const goalProgress =
        goalAmount === 0 ? 100 : Math.min((remainingAmount / goalAmount) * 100, 100);

      return {
        id: item._id,
        salary: item.salary,
        expense: item.expense,
        goal: item.goal,
        remainingAmount,
        monthlyGoalAmount: roundToTwo(monthlyGoalAmount),
        canAchieveMonthlyGoal: remainingAmount >= monthlyGoalAmount,
        goalProgress: roundToTwo(goalProgress),
        isGoalAchieved: remainingAmount >= goalAmount,
        createdAt: item.createdAt,
      };
    });

    return res.json({
      message: "Finance dashboard data fetched successfully",
      summary: {
        totalEntries,
        totalSalary: totals.salary,
        totalExpense: totals.expense,
        totalGoal: totals.goal,
        totalRemaining: totals.remaining,
        averageSalary: roundToTwo(totals.salary / totalEntries),
        averageExpense: roundToTwo(totals.expense / totalEntries),
        averageGoal: roundToTwo(totals.goal / totalEntries),
        savingsRate: roundToTwo(savingsRate),
        expenseRate: roundToTwo(expenseRate),
        goalAchievementRate: roundToTwo(goalAchievementRate),
        status,
        recommendation,
      },
      entries,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch finance dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  createFinance,
  getFinanceDashboard,
};
