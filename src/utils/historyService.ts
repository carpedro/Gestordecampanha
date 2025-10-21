import { EditHistoryEntry } from '../types/editHistory';
import { projectId, publicAnonKey } from './supabase/info';

export const historyService = {
  // Get history for a campaign
  async getAll(campaignId: string): Promise<EditHistoryEntry[]> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/${campaignId}/history`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Error fetching history:', await response.text());
      return [];
    }

    const data = await response.json();
    return (data.history || []).map((h: any) => ({
      ...h,
      timestamp: new Date(h.timestamp),
    }));
  },

  // Get campaign history (alias)
  async getHistory(campaignId: string): Promise<EditHistoryEntry[]> {
    return this.getAll(campaignId);
  },

  // Revert to a specific version
  async revertToVersion(campaignId: string, versionId: string): Promise<void> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/${campaignId}/history/${versionId}/revert`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao reverter versão');
    }
  },
};
