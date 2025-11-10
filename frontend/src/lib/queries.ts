import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import type { Campaign, AutomationRule, MetricsSummary } from '@/types';

// Campaigns
export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await api.get<Campaign[]>('/campaigns/');
      return response.data;
    },
  });
};

export const useCampaign = (id: number) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const response = await api.get<Campaign>(`/campaigns/${id}`);
      return response.data;
    },
  });
};

export const useCampaignMetrics = (id: number, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['campaigns', id, 'metrics', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await api.get(`/campaigns/${id}/metrics?${params}`);
      return response.data;
    },
  });
};

// Automation Rules
export const useAutomationRules = () => {
  return useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const response = await api.get<AutomationRule[]>('/automation-rules/');
      return response.data;
    },
  });
};

export const useCreateAutomationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/automation-rules/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
};

export const useUpdateAutomationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/automation-rules/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
};

export const useDeleteAutomationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/automation-rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
};
