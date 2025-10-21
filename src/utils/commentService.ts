import { Comment, CommentFormData } from '../types/comment';
import { projectId, publicAnonKey } from './supabase/info';

export const commentService = {
  // Get comments for a campaign
  async getAll(campaignId: string): Promise<Comment[]> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/${campaignId}/comments`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Error fetching comments:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.comments || [];
  },

  // Create comment
  async create(
    campaignId: string,
    content: string,
    parentId?: string
  ): Promise<Comment> {
    const data: CommentFormData = {
      content,
      parentId,
    };

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns/${campaignId}/comments`,
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
      console.error('Error creating comment:', error);
      throw new Error('Falha ao criar comentário');
    }

    return await response.json();
  },

  // Update comment
  async update(commentId: string, content: string): Promise<Comment> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/comments/${commentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao atualizar comentário');
    }

    return await response.json();
  },

  // Delete comment
  async delete(commentId: string): Promise<void> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao excluir comentário');
    }
  },

  // Toggle important flag
  async toggleImportant(commentId: string): Promise<Comment> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/comments/${commentId}/important`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao marcar comentário');
    }

    return await response.json();
  },
};
