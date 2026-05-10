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
