# Finance API Documentation

Base URL:

```text
http://localhost:5000/api/finance
```

## Create Finance Details

Saves a user's salary, expense, and goal, then returns a calculated finance summary.

```http
POST /
```

Full URL:

```text
http://localhost:5000/api/finance
```

### Request Body

```json
{
  "salary": 50000,
  "expense": 30000,
  "goal": 15000
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
    "goal": 15000,
    "remainingAmount": 20000,
    "goalProgress": 100,
    "isGoalAchieved": true
  }
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
  "message": "Salary, expense, and goal must be valid numbers"
}
```

Status code: `400 Bad Request`

```json
{
  "message": "Salary, expense, and goal cannot be negative"
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
      "goal": 15000,
      "remainingAmount": 20000,
      "goalProgress": 100,
      "isGoalAchieved": true,
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
