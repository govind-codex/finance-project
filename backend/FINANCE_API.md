# Finance API Documentation

Base URL:

```text
http://localhost:5000/api/finance
```

All finance APIs require a login session token:

```http
Authorization: Bearer session_token_here
```

## Create Finance Details

Saves a user's salary, expense, and goal details, then returns a calculated finance summary.
Each user can create finance details only one time.
The first submitted goal is saved as goal 1. A user can have up to 3 goals total.

```http
POST /
```

Full URL:

```text
http://localhost:5000/api/finance
```

### Request Header

```http
Authorization: Bearer session_token_here
```

### Request Body

```json
{
  "salary": 50000,
  "expense": 30000,
  "goal": {
    "name": "Buy a laptop",
    "amount": 60000,
    "timeInMonths": 6
  }
}
```

### Success Response

Status code: `201 Created`

```json
{
  "message": "Finance details saved successfully",
  "finance": {
    "id": "finance_id_here",
    "salary": 50000,
    "expense": 30000,
    "goal": {
      "name": "Buy a laptop",
      "amount": 60000,
      "timeInMonths": 6
    },
    "goals": [
      {
        "name": "Buy a laptop",
        "amount": 60000,
        "timeInMonths": 6
      }
    ],
    "remainingAmount": 20000,
    "monthlyGoalAmount": 10000,
    "canAchieveMonthlyGoal": true,
    "goalProgress": 33.33,
    "isGoalAchieved": false
  }
}
```

## Add Goal

Adds another goal to the user's existing finance details. A user can add up to 3 goals total.

```http
POST /goals
```

Full URL:

```text
http://localhost:5000/api/finance/goals
```

### Request Header

```http
Authorization: Bearer session_token_here
```

### Request Body

```json
{
  "goal": {
    "name": "Emergency fund",
    "amount": 30000,
    "timeInMonths": 4
  }
}
```

### Success Response

Status code: `201 Created`

```json
{
  "message": "Goal added successfully",
  "goals": [
    {
      "name": "Buy a laptop",
      "amount": 60000,
      "timeInMonths": 6
    },
    {
      "name": "Emergency fund",
      "amount": 30000,
      "timeInMonths": 4
    }
  ]
}
```

### Error Responses

Status code: `404 Not Found`

```json
{
  "message": "Finance details not found. Add finance details first"
}
```

Status code: `409 Conflict`

```json
{
  "message": "You can add only 3 goals"
}
```

### Error Responses

Status code: `400 Bad Request`

```json
{
  "message": "Salary, expense, and goal are required"
}
```

Status code: `400 Bad Request`

```json
{
  "message": "Salary, expense, goal name, goal amount, and goal time are required"
}
```

Status code: `400 Bad Request`

```json
{
  "message": "Salary, expense, and goal amount cannot be negative. Goal time must be at least 1 month"
}
```

Status code: `409 Conflict`

```json
{
  "message": "Finance details already exist for this user"
}
```

Status code: `500 Internal Server Error`

```json
{
  "message": "Failed to save finance details",
  "error": "error message here"
}
```

## Finance Dashboard

Returns all saved finance entries with a complete dashboard summary and analysis.

```http
GET /dashboard
```

Full URL:

```text
http://localhost:5000/api/finance/dashboard
```

### Request Header

```http
Authorization: Bearer session_token_here
```

### Success Response

Status code: `200 OK`

```json
{
  "message": "Finance dashboard data fetched successfully",
  "summary": {
    "totalEntries": 2,
    "totalSalary": 100000,
    "totalExpense": 60000,
    "totalGoal": 30000,
    "totalRemaining": 40000,
    "averageSalary": 50000,
    "averageExpense": 30000,
    "averageGoal": 15000,
    "savingsRate": 40,
    "expenseRate": 60,
    "goalAchievementRate": 100,
    "status": "Excellent saving",
    "recommendation": "You are saving well. Keep this pattern and consider investing the surplus wisely."
  },
  "entries": [
    {
      "id": "finance_id_here",
      "salary": 50000,
      "expense": 30000,
      "goal": {
        "name": "Buy a laptop",
        "amount": 60000,
        "timeInMonths": 6
      },
      "remainingAmount": 20000,
      "monthlyGoalAmount": 10000,
      "canAchieveMonthlyGoal": true,
      "goalProgress": 33.33,
      "isGoalAchieved": false,
      "createdAt": "2026-05-10T10:00:00.000Z"
    }
  ]
}
```

### Empty Response

Status code: `200 OK`

```json
{
  "message": "No finance data found",
  "summary": {
    "totalEntries": 0,
    "totalSalary": 0,
    "totalExpense": 0,
    "totalGoal": 0,
    "totalRemaining": 0,
    "averageSalary": 0,
    "averageExpense": 0,
    "averageGoal": 0,
    "savingsRate": 0,
    "expenseRate": 0,
    "goalAchievementRate": 0,
    "status": "No data",
    "recommendation": "Add salary, expense, and goal data to see your dashboard analysis."
  },
  "entries": []
}
```

### Error Response

Status code: `500 Internal Server Error`

```json
{
  "message": "Failed to fetch finance dashboard data",
  "error": "error message here"
}
```
