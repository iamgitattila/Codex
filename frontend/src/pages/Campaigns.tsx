import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Play, Pause, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { Campaign } from '@/types';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/campaigns/');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading campaigns...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-1">Manage and optimize your ad campaigns</p>
          </div>
          <Button>
            <Plus size={20} className="mr-2" />
            New Campaign
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No campaigns found</p>
              <Button>
                <Plus size={20} className="mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Daily Budget:</span>{' '}
                        {campaign.daily_budget ? formatCurrency(campaign.daily_budget) : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Objective:</span>{' '}
                        {campaign.objective || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Platform ID:</span>{' '}
                        {campaign.platform_campaign_id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <TrendingUp size={16} className="mr-1" />
                      View Metrics
                    </Button>
                    <Button
                      variant={campaign.status === 'active' ? 'secondary' : 'primary'}
                      size="sm"
                    >
                      {campaign.status === 'active' ? (
                        <>
                          <Pause size={16} className="mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play size={16} className="mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
