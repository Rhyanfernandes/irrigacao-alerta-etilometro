
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: session, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erro ao obter sessão:", error);
      return null;
    }
    
    if (!session.session) {
      console.log("Nenhuma sessão ativa encontrada");
      return null;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Erro ao obter usuário:", userError);
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
  } catch (e) {
    console.error("Exceção ao obter usuário atual:", e);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
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
  } catch (e) {
    console.error("Exceção ao fazer login:", e);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Erro ao fazer logout:", e);
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (e) {
    console.error("Erro ao verificar autenticação:", e);
    return false;
  }
};
