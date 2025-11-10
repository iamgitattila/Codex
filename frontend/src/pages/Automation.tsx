import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Play, Pause, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import type { AutomationRule } from '@/types';

export const Automation: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get('/automation-rules/');
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteRule = async (ruleId: number) => {
    try {
      await api.post(`/automation-rules/${ruleId}/execute`);
      alert('Rule executed successfully!');
    } catch (error) {
      console.error('Error executing rule:', error);
      alert('Failed to execute rule');
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await api.delete(`/automation-rules/${ruleId}`);
      setRules(rules.filter(r => r.id !== ruleId));
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete rule');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading automation rules...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automation Rules</h1>
            <p className="text-gray-600 mt-1">Automate your campaign management with smart rules</p>
          </div>
          <Button onClick={() => navigate('/automation/new')}>
            <Plus size={20} className="mr-2" />
            New Rule
          </Button>
        </div>

        {rules.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No automation rules found</p>
              <Button onClick={() => navigate('/automation/new')}>
                <Plus size={20} className="mr-2" />
                Create Your First Rule
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rule.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                          {rule.status}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Target:</span>
                      <p className="font-medium text-gray-900">{rule.target_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Check Frequency:</span>
                      <p className="font-medium text-gray-900">{rule.check_frequency} min</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Conditions:</span>
                      <p className="font-medium text-gray-900">
                        {rule.conditions?.rules?.length || 0} rules
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Actions:</span>
                      <p className="font-medium text-gray-900">
                        {rule.actions?.length || 0} actions
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleExecuteRule(rule.id)}>
                      <Play size={16} className="mr-1" />
                      Execute
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash2 size={16} className="mr-1" />
                      Delete
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
