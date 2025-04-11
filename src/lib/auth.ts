
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: session, error } = await supabase.auth.getSession();
  
  if (error || !session.session) {
    console.error("Erro ao obter sessão:", error);
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // Retrieve user's site information from metadata
  const siteId = user.user_metadata?.siteId;
  const siteName = user.user_metadata?.siteName;
  
  if (!siteId && user.user_metadata?.role === 'site') {
    console.error("Usuário de obra sem obra associada:", user.email);
  }
  
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || '',
    role: user.user_metadata?.role || 'site',
    siteId: siteId,
    siteName: siteName,
    createdAt: new Date(user.created_at || new Date()),
  };
};

export const login = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error || !data.user) {
    console.error("Erro no login:", error);
    return null;
  }
  
  // Get user-specific site information from metadata
  const siteId = data.user.user_metadata?.siteId;
  const siteName = data.user.user_metadata?.siteName;
  
  return {
    id: data.user.id,
    email: data.user.email || '',
    name: data.user.user_metadata?.name || '',
    role: data.user.user_metadata?.role || 'site',
    siteId: siteId,
    siteName: siteName,
    createdAt: new Date(data.user.created_at || new Date()),
  };
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};
