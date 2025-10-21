import { createClient } from './supabase/client';
import { Campaign, CampaignFormData } from '../types/campaign';
import { projectId, publicAnonKey } from './supabase/info';

const KV_PREFIX = 'campaign:';

export const campaignService = {
  // Get all campaigns
  async getAll(): Promise<Campaign[]> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Error fetching campaigns:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.campaigns || [];
  },

  // Get campaign by slug
  async getBySlug(slug: string): Promise<Campaign | null> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/slug/${slug}`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Error fetching campaign by slug:', await response.text());
      return null;
    }

    return await response.json();
  },

  // Create a new campaign
  async create(data: CampaignFormData): Promise<Campaign> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Error creating campaign:', error);
      throw new Error('Falha ao criar iniciativa');
    }

    return await response.json();
  },

  // Update an existing campaign
  async update(id: string, data: Partial<CampaignFormData>): Promise<Campaign> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating campaign:', error);
      throw new Error('Falha ao atualizar iniciativa');
    }

    return await response.json();
  },

  // Delete a campaign
  async delete(id: string): Promise<void> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Error deleting campaign:', error);
      throw new Error('Falha ao excluir initiativa');
    }
  },

  // Update campaign status
  async updateStatus(id: string, status: Campaign['status']): Promise<Campaign> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/${id}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating status:', error);
      throw new Error('Falha ao atualizar status');
    }

    return await response.json();
  },

  // Duplicate a campaign
  async duplicate(id: string): Promise<Campaign> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/${id}/duplicate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Error duplicating campaign:', error);
      throw new Error('Falha ao duplicar campanha');
    }

    return await response.json();
  },
};
