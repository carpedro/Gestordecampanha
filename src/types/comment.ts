export interface Comment {
  id: string;
  campaignId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string; // For replies
  mentions: string[]; // User IDs mentioned
  attachments?: string[];
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
  replies?: Comment[];
}

export interface CommentFormData {
  content: string;
  parentId?: string;
  mentions?: string[];
  attachments?: string[];
}
