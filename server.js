require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bizSdk = require('facebook-nodejs-business-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize Facebook SDK
const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;
const AdSet = bizSdk.AdSet;
const api = bizSdk.FacebookAdsApi.init(process.env.FACEBOOK_ACCESS_TOKEN);

// API Routes

// Get all ad accounts
app.get('/api/accounts', async (req, res) => {
  try {
    const fields = ['id', 'name', 'account_id', 'currency'];
    const params = {};

    // Get user's ad accounts
    const accounts = await new bizSdk.User('me').getAdAccounts(fields, params);

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get campaigns for a specific account
app.get('/api/accounts/:accountId/campaigns', async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const fields = ['id', 'name', 'status', 'objective'];
    const params = {
      limit: 100
    };

    const account = new AdAccount(`act_${accountId}`);
    const campaigns = await account.getCampaigns(fields, params);

    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get ad sets for selected campaigns
app.post('/api/campaigns/adsets', async (req, res) => {
  try {
    const { campaignIds } = req.body;

    if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Campaign IDs are required'
      });
    }

    const fields = ['id', 'name', 'status', 'bid_strategy', 'bid_amount', 'campaign_id'];
    const allAdSets = [];

    // Fetch ad sets for each campaign
    for (const campaignId of campaignIds) {
      try {
        const campaign = new Campaign(campaignId);
        const adSets = await campaign.getAdSets(fields);
        allAdSets.push(...adSets);
      } catch (error) {
        console.error(`Error fetching ad sets for campaign ${campaignId}:`, error.message);
      }
    }

    res.json({
      success: true,
      data: allAdSets
    });
  } catch (error) {
    console.error('Error fetching ad sets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk update bid caps
app.post('/api/adsets/bulk-update-bid', async (req, res) => {
  try {
    const { adSetIds, bidAmount } = req.body;

    if (!adSetIds || !Array.isArray(adSetIds) || adSetIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ad set IDs are required'
      });
    }

    if (!bidAmount || isNaN(parseFloat(bidAmount))) {
      return res.status(400).json({
        success: false,
        error: 'Valid bid amount is required'
      });
    }

    const results = [];
    const errors = [];

    // Update each ad set
    for (const adSetId of adSetIds) {
      try {
        const adSet = new AdSet(adSetId);

        // Update bid amount (in cents for most currencies)
        const bidInCents = Math.round(parseFloat(bidAmount) * 100);

        await adSet.update([], {
          bid_amount: bidInCents
        });

        results.push({
          id: adSetId,
          success: true
        });
      } catch (error) {
        console.error(`Error updating ad set ${adSetId}:`, error.message);
        errors.push({
          id: adSetId,
          error: error.message
        });
      }
    }

    res.json({
      success: errors.length === 0,
      updated: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Facebook Ads Bulk Bid Editor running on http://localhost:${PORT}`);
});
