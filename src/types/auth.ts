
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'master' | 'site';
  siteId?: string;
  siteName?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
