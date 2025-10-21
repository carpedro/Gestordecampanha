export type EditAction = 
  | 'created' 
  | 'edited'
  | 'updated'
  | 'status_changed' 
  | 'tags_added' 
  | 'tags_removed'
  | 'tags_updated'
  | 'attachment_added'
  | 'attachment_removed'
  | 'archived'
  | 'restored';

export interface EditHistoryEntry {
  id: string;
  campaignId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: EditAction;
  fieldChanged?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  ipAddress?: string;
  device?: string;
}

// Alias for backwards compatibility
export type EditHistory = EditHistoryEntry;

export interface CampaignVersion {
  versionId: string;
  campaignId: string;
  data: any; // Full campaign data at this version
  createdBy: string;
  createdAt: Date;
}
