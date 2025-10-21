export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  position_id?: string;
  institution_id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Legacy compatibility
  avatarUrl?: string;
  position?: string;
  institution?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSession {
  user: User;
  accessToken: string;
}
