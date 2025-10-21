import { Attachment } from '../types/attachment';
import { projectId, publicAnonKey } from './supabase/info';

export const attachmentService = {
  // Upload attachment
  async upload(
    campaignId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Attachment> {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('campaignId', campaignId);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/attachments/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${publicAnonKey}`);
      xhr.send(formData);
    });
  },

  // Get all attachments for a campaign
  async getAll(campaignId: string): Promise<Attachment[]> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/${campaignId}/attachments`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Error fetching attachments:', await response.text());
      return [];
    }

    const data = await response.json();
    return (data.attachments || []).map((a: any) => ({
      ...a,
      uploadedAt: new Date(a.uploadedAt),
    }));
  },

  // Delete attachment
  async delete(attachmentId: string): Promise<void> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/attachments/${attachmentId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao excluir anexo');
    }
  },

  // Rename attachment
  async rename(attachmentId: string, newName: string): Promise<Attachment> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/attachments/${attachmentId}/rename`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ displayName: newName }),
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao renomear anexo');
    }

    const data = await response.json();
    return {
      ...data,
      uploadedAt: new Date(data.uploadedAt),
    };
  },

  // Get download URL (signed URL)
  async getDownloadUrl(attachmentId: string): Promise<string> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/attachments/${attachmentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao gerar URL de download');
    }

    const data = await response.json();
    return data.url;
  },
};
