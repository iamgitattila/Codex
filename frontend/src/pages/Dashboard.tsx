import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, DollarSign, Target, MousePointer, Eye } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';

interface MetricCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, you'd fetch dashboard metrics from an endpoint
      // For now, we'll use dummy data
      setMetrics({
        summary: {
          total_spend: 15234.50,
          total_impressions: 1234567,
          total_clicks: 45678,
          avg_roas: 3.45,
          avg_ctr: 3.7,
          avg_cpc: 0.33,
        },
        time_series: [
          { date: '2023-12-01', spend: 1200, clicks: 3500, conversions: 150 },
          { date: '2023-12-02', spend: 1350, clicks: 3800, conversions: 165 },
          { date: '2023-12-03', spend: 1100, clicks: 3200, conversions: 140 },
          { date: '2023-12-04', spend: 1450, clicks: 4100, conversions: 180 },
          { date: '2023-12-05', spend: 1300, clicks: 3900, conversions: 170 },
          { date: '2023-12-06', spend: 1550, clicks: 4300, conversions: 195 },
          { date: '2023-12-07', spend: 1400, clicks: 4000, conversions: 175 },
        ]
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  const metricCards: MetricCard[] = [
    {
      label: 'Total Spend',
      value: formatCurrency(metrics.summary.total_spend),
      change: '+12.5%',
      isPositive: false,
      icon: <DollarSign className="text-primary-600" size={24} />,
    },
    {
      label: 'Impressions',
      value: formatNumber(metrics.summary.total_impressions),
      change: '+8.2%',
      isPositive: true,
      icon: <Eye className="text-purple-600" size={24} />,
    },
    {
      label: 'Clicks',
      value: formatNumber(metrics.summary.total_clicks),
      change: '+15.3%',
      isPositive: true,
      icon: <MousePointer className="text-blue-600" size={24} />,
    },
    {
      label: 'ROAS',
      value: formatNumber(metrics.summary.avg_roas, 2) + 'x',
      change: '+5.1%',
      isPositive: true,
      icon: <Target className="text-green-600" size={24} />,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your ad performance</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.isPositive ? (
                      <TrendingUp size={16} className="text-green-600 mr-1" />
                    ) : (
                      <TrendingDown size={16} className="text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {metric.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Spend Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.time_series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spend" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Performance Metrics">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.time_series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#0ea5e9" />
                <Bar dataKey="conversions" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
