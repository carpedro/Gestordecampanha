export type CampaignStatus = 'draft' | 'published' | 'archived';

export type Institution = 
  | 'PUCRS'
  | 'PUCRS Grad'
  | 'FAAP'
  | 'FIA Online'
  | 'UNESC'
  | 'Santa Casa SP'
  | 'Impacta'
  | 'FSL Digital';

export interface Campaign {
  id: string;
  name: string;
  slug: string; // URL-friendly version
  institution: Institution;
  description: string;
  audioUrl?: string;
  tagsRelated: string[];
  tagsExcluded: string[];
  startDate: string; // ISO 8601 format (YYYY-MM-DD)
  endDate: string;   // ISO 8601 format (YYYY-MM-DD)
  status: CampaignStatus;
  createdBy: string; // User ID
  createdByName: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  lastEditedBy?: string;
  lastEditedByName?: string;
  attachmentCount?: number; // Number of attachments
  totalAttachmentSize?: number; // Total size in bytes
}

export interface CampaignFormData {
  name: string;
  institution: Institution;
  description: string;
  audioUrl?: string;
  tagsRelated: string[];
  tagsExcluded: string[];
  startDate: string; // ISO 8601 format (YYYY-MM-DD)
  endDate: string;   // ISO 8601 format (YYYY-MM-DD)
  status: CampaignStatus;
}
