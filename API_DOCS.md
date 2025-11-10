# API Documentation - Revealbot Clone

Complete API reference for the Revealbot Clone platform.

## Base URL

```
http://localhost:5000
```

## Authentication

All API endpoints (except auth endpoints) require authentication using session-based authentication.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user123",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "user123",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Logout
```http
POST /auth/logout
```

### Get Current User
```http
GET /auth/me
```

## Ad Accounts

### Get All Ad Accounts
```http
GET /api/campaigns/accounts
```

**Response:**
```json
{
  "accounts": [
    {
      "id": 1,
      "platform": "facebook",
      "account_id": "act_123456",
      "account_name": "My Ad Account",
      "currency": "USD",
      "is_active": true
    }
  ]
}
```

### Create Ad Account
```http
POST /api/campaigns/accounts
Content-Type: application/json

{
  "platform": "facebook",
  "account_id": "act_123456",
  "account_name": "My Ad Account",
  "access_token": "token",
  "currency": "USD"
}
```

### Sync Campaigns
```http
POST /api/campaigns/accounts/{account_id}/sync
```

Fetches campaigns from the ad platform and syncs them to the database.

## Campaigns

### Get Campaigns
```http
GET /api/campaigns/accounts/{account_id}/campaigns
```

**Response:**
```json
{
  "campaigns": [
    {
      "id": 1,
      "name": "Summer Sale",
      "status": "ACTIVE",
      "budget": 100.0,
      "spend": 85.50,
      "conversions": 25,
      "roas": 4.5
    }
  ]
}
```

### Get Campaign
```http
GET /api/campaigns/campaigns/{campaign_id}
```

### Update Campaign
```http
PUT /api/campaigns/campaigns/{campaign_id}
Content-Type: application/json

{
  "name": "New Name",
  "status": "PAUSED",
  "budget": 150.0
}
```

### Bulk Edit Campaigns
```http
POST /api/campaigns/bulk-edit
Content-Type: application/json

{
  "campaign_ids": [1, 2, 3],
  "updates": {
    "status": "PAUSED",
    "budget": 100.0
  }
}
```

## Automation Rules

### Get All Rules
```http
GET /api/rules/
```

**Response:**
```json
{
  "rules": [
    {
      "id": 1,
      "name": "Pause High CPA Campaigns",
      "platform": "facebook",
      "is_active": true,
      "conditions": [
        {
          "metric": "cpa",
          "operator": "greater_than",
          "value": 50.0
        }
      ],
      "actions": [
        {
          "action_type": "pause_campaign"
        }
      ]
    }
  ]
}
```

### Create Rule
```http
POST /api/rules/
Content-Type: application/json

{
  "name": "Pause High CPA",
  "description": "Pause campaigns with CPA > $50",
  "platform": "facebook",
  "target_type": "campaign",
  "target_ids": ["123456", "123457"],
  "condition_logic": "all",
  "conditions": [
    {
      "metric": "cpa",
      "operator": "greater_than",
      "value": 50.0,
      "time_range": "today"
    }
  ],
  "actions": [
    {
      "action_type": "pause_campaign",
      "parameters": {}
    }
  ]
}
```

### Update Rule
```http
PUT /api/rules/{rule_id}
Content-Type: application/json

{
  "name": "Updated Name",
  "is_active": false
}
```

### Delete Rule
```http
DELETE /api/rules/{rule_id}
```

### Toggle Rule
```http
POST /api/rules/{rule_id}/toggle
```

### Get Rule Logs
```http
GET /api/rules/{rule_id}/logs?limit=50
```

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "target_id": "123456",
      "status": "success",
      "message": "Executed 1 action(s)",
      "actions_taken": [
        {
          "action_type": "pause_campaign",
          "result": "Status updated to PAUSED"
        }
      ],
      "executed_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Automation Templates

### Get Templates
```http
GET /api/rules/templates?platform=facebook&category=budget_optimization
```

### Apply Template
```http
POST /api/rules/templates/{template_id}/apply
Content-Type: application/json

{
  "name": "My Rule from Template",
  "platform": "facebook",
  "target_ids": ["123456"]
}
```

## Analytics

### Get Campaign Analytics
```http
GET /api/analytics/campaigns/{campaign_id}?days=30
```

**Response:**
```json
{
  "campaign_id": 1,
  "campaign_name": "Summer Sale",
  "summary": {
    "total_spend": 2500.00,
    "total_conversions": 125,
    "avg_cpa": 20.00,
    "roas": 4.5
  },
  "daily_analytics": [
    {
      "date": "2024-01-15",
      "spend": 85.50,
      "conversions": 4,
      "cpa": 21.38
    }
  ]
}
```

### Get Performance Trends
```http
GET /api/analytics/campaigns/{campaign_id}/trends?metric=spend&days=30
```

**Response:**
```json
{
  "metric": "spend",
  "trend": "increasing",
  "change_percentage": 15.5,
  "data": [
    {
      "date": "2024-01-15",
      "value": 85.50
    }
  ]
}
```

### Get Account Overview
```http
GET /api/analytics/accounts/{account_id}/overview?days=30
```

**Response:**
```json
{
  "total_campaigns": 10,
  "active_campaigns": 7,
  "total_spend": 5000.00,
  "total_conversions": 250,
  "avg_roas": 4.2
}
```

### Get Top Performers
```http
GET /api/analytics/accounts/{account_id}/top-performers?metric=roas&limit=10
```

### Compare Campaigns
```http
POST /api/analytics/campaigns/compare
Content-Type: application/json

{
  "campaign_ids": [1, 2, 3],
  "metrics": ["spend", "conversions", "roas"],
  "days": 30
}
```

### Get Budget Recommendation
```http
GET /api/analytics/campaigns/{campaign_id}/budget-recommendation?days=14
```

**Response:**
```json
{
  "current_budget": 100.0,
  "recommended_budget": 120.0,
  "adjustment_percentage": 20,
  "action": "increase",
  "reason": "Excellent ROAS (4.5). Increase budget to scale."
}
```

### Optimize Account Budget
```http
POST /api/analytics/accounts/{account_id}/optimize-budget
Content-Type: application/json

{
  "total_budget": 1000.0,
  "optimization_goal": "roas",
  "min_budget": 10.0,
  "days_lookback": 7
}
```

**Response:**
```json
{
  "optimization_goal": "roas",
  "total_budget": 1000.0,
  "allocations": [
    {
      "campaign_id": 1,
      "campaign_name": "Summer Sale",
      "current_budget": 100.0,
      "recommended_budget": 250.0
    }
  ]
}
```

### Get Underperforming Campaigns
```http
GET /api/analytics/accounts/{account_id}/underperforming?threshold_metric=roas&threshold_value=1.0&days=7
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently, there are no rate limits. In production, implement rate limiting based on your requirements.

## Webhooks

Webhook support is planned for future releases.

## SDK / Client Libraries

Python client library coming soon.

## Support

For API support, please open an issue on GitHub.
