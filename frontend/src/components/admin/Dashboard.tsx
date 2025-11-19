'use client';

import React, { useState, useEffect } from 'react';

interface SystemStatus {
  status: 'running' | 'stopped' | 'error';
  lastDataSync: string;
  pagesGenerated: number;
  totalPages: number;
  monthlyRevenue: number;
  organicTraffic: number;
}

interface DataSource {
  id: string;
  name: string;
  status: 'fresh' | 'stale' | 'error';
  lastUpdated: string;
  recordCount: string;
}

export default function AdminDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'running',
    lastDataSync: '2 hours ago',
    pagesGenerated: 2847,
    totalPages: 30420,
    monthlyRevenue: 47230,
    organicTraffic: 1200000,
  });

  const [dataSources] = useState<DataSource[]>([
    {
      id: 'census_acs',
      name: 'Census ACS',
      status: 'fresh',
      lastUpdated: '2 hours ago',
      recordCount: '3,000+ zip codes',
    },
    {
      id: 'noaa_climate',
      name: 'NOAA Climate',
      status: 'fresh',
      lastUpdated: '1 day ago',
      recordCount: '5,000+ cities',
    },
    {
      id: 'bls_oews',
      name: 'BLS Labor Costs',
      status: 'fresh',
      lastUpdated: '1 week ago',
      recordCount: '350+ MSAs',
    },
    {
      id: 'fhfa_hpi',
      name: 'FHFA Home Values',
      status: 'stale',
      lastUpdated: '45 days ago',
      recordCount: 'Manual quarterly download needed',
    },
    {
      id: 'municipal',
      name: 'Municipal Zoning',
      status: 'fresh',
      lastUpdated: '3 days ago',
      recordCount: '1,200 cities',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'fresh':
        return 'text-green-600 bg-green-100';
      case 'stale':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'stopped':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">📊 Homeowner.wiki pSEO Engine Dashboard</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">System Status</h3>
            <div className="flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(systemStatus.status)}`}
              >
                {systemStatus.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Last sync: {systemStatus.lastDataSync}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pages Generated This Week</h3>
            <p className="text-3xl font-bold text-primary-600">{systemStatus.pagesGenerated.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">
              {systemStatus.totalPages.toLocaleString()} total pages live
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue This Month</h3>
            <p className="text-3xl font-bold text-green-600">
              ${systemStatus.monthlyRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">Affiliate + lead gen</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Organic Traffic (30d)</h3>
            <p className="text-3xl font-bold text-blue-600">
              {(systemStatus.organicTraffic / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-gray-500 mt-2">visitors</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📈 Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Pages w/ Traffic</div>
              <div className="text-2xl font-bold">8,420</div>
              <div className="text-xs text-gray-500">27% of total</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Avg Page CTR</div>
              <div className="text-2xl font-bold">3.8%</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Lead Conv.</div>
              <div className="text-2xl font-bold">2.1%</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Affiliate Conv.</div>
              <div className="text-2xl font-bold">0.8%</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Avg CPL</div>
              <div className="text-2xl font-bold">$45</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">ROI</div>
              <div className="text-2xl font-bold text-green-600">650%</div>
            </div>
          </div>
        </div>

        {/* Data Sources Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">⚙️ Data Sources Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Records
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dataSources.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{source.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(source.status)}`}
                      >
                        {source.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{source.lastUpdated}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{source.recordCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🔔 Pending Actions</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">⚠️</div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    NEW DATA SOURCE AVAILABLE: Shovels.ai Permit Database
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Allows extraction of permit history, contractor info by address
                  </p>
                  <p className="text-sm text-yellow-700">
                    Expected impact: 5,000+ new permit history pages
                  </p>
                  <div className="mt-2 space-x-2">
                    <button className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
                      Integrate
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">ℹ️</div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    PERFORMANCE INSIGHT: Fence calculator drives 45% of monetization
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Recommendation: Add deck & paint calculators to similar pages
                  </p>
                  <div className="mt-2">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Implement
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-red-400 bg-red-50 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">⚠️</div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    DATA QUALITY: 12 California cities have incomplete zoning data
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    May need manual research or skip page generation
                  </p>
                  <div className="mt-2">
                    <button className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Scheduled Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">🎯 Next Scheduled Tasks</h2>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              <span className="text-gray-700">
                Data sync: Tonight 2 AM (Census, NOAA, BLS)
              </span>
            </li>
            <li className="flex items-center text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              <span className="text-gray-700">Page generation: Tomorrow 6 AM (1,000 new pages)</span>
            </li>
            <li className="flex items-center text-sm">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              <span className="text-gray-700">Municipal scraping: Friday (200 new cities)</span>
            </li>
            <li className="flex items-center text-sm">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              <span className="text-gray-700">Analytics review: Next Monday</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
