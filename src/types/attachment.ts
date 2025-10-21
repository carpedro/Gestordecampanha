export type AttachmentType = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'document' 
  | 'spreadsheet' 
  | 'presentation'
  | 'design'
  | 'text';

export interface Attachment {
  id: string;
  campaignId: string;
  fileName: string;
  displayName: string;
  fileType: AttachmentType;
  mimeType: string;
  fileSize: number; // in bytes
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // for video/audio
    pages?: number; // for documents
  };
}

export interface AttachmentUploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

// File type configurations
export const ALLOWED_FILE_TYPES = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'],
    icon: '🖼️',
    label: 'Imagem',
  },
  video: {
    extensions: ['.mp4', '.mov', '.avi', '.webm'],
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    icon: '🎥',
    label: 'Vídeo',
  },
  audio: {
    extensions: ['.mp3', '.wav', '.m4a', '.ogg'],
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'],
    icon: '🎵',
    label: 'Áudio',
  },
  document: {
    extensions: ['.doc', '.docx', '.txt'],
    mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    icon: '📄',
    label: 'Documento',
  },
  spreadsheet: {
    extensions: ['.xls', '.xlsx', '.csv'],
    mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
    icon: '📊',
    label: 'Planilha',
  },
  presentation: {
    extensions: ['.ppt', '.pptx'],
    mimeTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    icon: '📽️',
    label: 'Apresentação',
  },
  design: {
    extensions: ['.psd'],
    mimeTypes: ['image/vnd.adobe.photoshop', 'application/x-photoshop'],
    icon: '🎨',
    label: 'Design',
  },
  text: {
    extensions: ['.txt'],
    mimeTypes: ['text/plain'],
    icon: '📝',
    label: 'Texto',
  },
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_FILES_PER_CAMPAIGN = 20;

export function getFileType(fileName: string, mimeType: string): AttachmentType | null {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  for (const [type, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (config.extensions.includes(extension) || config.mimeTypes.includes(mimeType)) {
      return type as AttachmentType;
    }
  }
  
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getFileIcon(fileType: AttachmentType): string {
  return ALLOWED_FILE_TYPES[fileType]?.icon || '📎';
}
