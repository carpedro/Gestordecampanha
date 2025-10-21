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
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  createdBy: string; // User ID
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
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
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
}
