# Facebook Ads Bulk Bid Editor

A web-based tool for bulk editing bid caps on Facebook Ads campaigns. Select an account, choose campaigns, and update bid amounts across multiple ad sets with a simple interface.

## Features

- **Account Selection**: Choose from all available Facebook Ads accounts
- **Campaign Selection**: Checkbox interface to select multiple campaigns
- **Ad Set Overview**: View all ad sets within selected campaigns with current bid information
- **Bulk Bid Updates**: Update bid caps across all ad sets in selected campaigns at once
- **Real-time Feedback**: See success/failure status for each update operation
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

Before running this tool, you need:

1. **Node.js** (v14 or higher)
2. **Facebook Developer Account** with an app created
3. **Facebook Access Token** with the following permissions:
   - `ads_management`
   - `ads_read`

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Codex
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app (type: Business)
3. Add the **Marketing API** product to your app
4. Note your App ID and App Secret

### 4. Generate Access Token

1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Add these permissions:
   - `ads_management`
   - `ads_read`
5. Generate and copy the access token

**Important**: For production use, implement proper OAuth flow and use long-lived tokens.

### 5. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_ACCESS_TOKEN=your_access_token_here
PORT=3000
```

### 6. Run the Application

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

1. **Select Account**: Choose a Facebook Ads account from the dropdown
2. **Select Campaigns**: Check the campaigns you want to work with
3. **Load Ad Sets**: Click "Load Ad Sets" to fetch all ad sets from selected campaigns
4. **Enter Bid Amount**: Input the new bid cap amount in dollars
5. **Update**: Click "Update All Ad Sets" to apply the new bid cap

## API Endpoints

### GET `/api/accounts`
Fetch all ad accounts for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "act_123456789",
      "name": "My Ad Account",
      "account_id": "123456789",
      "currency": "USD"
    }
  ]
}
```

### GET `/api/accounts/:accountId/campaigns`
Fetch campaigns for a specific account.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123456789",
      "name": "Campaign Name",
      "status": "ACTIVE",
      "objective": "CONVERSIONS"
    }
  ]
}
```

### POST `/api/campaigns/adsets`
Fetch ad sets for selected campaigns.

**Request Body:**
```json
{
  "campaignIds": ["123456789", "987654321"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123456789",
      "name": "Ad Set Name",
      "status": "ACTIVE",
      "bid_strategy": "LOWEST_COST_WITH_BID_CAP",
      "bid_amount": 500,
      "campaign_id": "123456789"
    }
  ]
}
```

### POST `/api/adsets/bulk-update-bid`
Update bid caps for multiple ad sets.

**Request Body:**
```json
{
  "adSetIds": ["123456789", "987654321"],
  "bidAmount": 5.00
}
```

**Response:**
```json
{
  "success": true,
  "updated": 2,
  "failed": 0,
  "results": [
    {"id": "123456789", "success": true},
    {"id": "987654321", "success": true}
  ],
  "errors": []
}
```

## Project Structure

```
Codex/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML page
│   ├── app.js            # Frontend JavaScript
│   └── styles.css        # Styling
├── server.js             # Express server & API
├── package.json          # Dependencies
├── .env.example          # Example environment variables
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Important Notes

### Bid Amount Format
- Enter bid amounts in dollars (e.g., 5.00)
- The tool automatically converts to cents for the API
- Facebook uses cents for most currencies

### Access Token Security
- Never commit your `.env` file to version control
- Use long-lived tokens for production
- Implement proper OAuth flow for multi-user applications
- Rotate tokens regularly

### Rate Limits
- Facebook enforces rate limits on API calls
- The tool processes updates sequentially to avoid hitting limits
- For very large campaigns, updates may take time

### Permissions
- Ensure you have permission to manage the ad accounts
- Your Facebook user must have appropriate roles in Business Manager

## Troubleshooting

### "Failed to load accounts"
- Verify your access token is valid and not expired
- Check that you've added the required permissions
- Ensure your Facebook app has Marketing API enabled

### "Failed to update ad sets"
- Verify you have `ads_management` permission
- Check that your user has proper roles in Business Manager
- Some ad sets may not support bid cap changes depending on their optimization strategy

### Network errors
- Check your internet connection
- Verify the server is running
- Look at the browser console for detailed error messages

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Tech Stack
- **Backend**: Node.js, Express, Facebook Business SDK
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: Facebook Marketing API v19.0

## License

MIT

## Support

For issues related to:
- **Facebook API**: Check [Facebook Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis)
- **This Tool**: Open an issue in the repository

## Security Considerations

1. Never expose your access token in client-side code
2. Use HTTPS in production
3. Implement proper authentication for multi-user scenarios
4. Regularly audit and rotate access tokens
5. Follow Facebook's platform policies and terms of service
