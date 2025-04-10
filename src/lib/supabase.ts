
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Re-export the Supabase client
export const supabase = supabaseClient;

// Função para converter usuário do Supabase para o formato da aplicação
export function convertSupabaseUser(supabaseUser: SupabaseUser | null) {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || '',
    role: supabaseUser.user_metadata?.role || 'site',
    siteId: supabaseUser.user_metadata?.siteId,
    siteName: supabaseUser.user_metadata?.siteName,
    createdAt: new Date(supabaseUser.created_at),
  };
}

// Tipos para as tabelas
export type Obra = {
  id: string;
  nome: string;
  created_at: string;
};

export type Usuario = {
  id: string;
  email: string;
  obra_id: string;
  nome: string;
  created_at: string;
};

export type Registro = {
  id: string;
  obra_id: string;
  usuario_id: string;
  data: string;
  valor: number;
  observacao?: string;
  created_at: string;
};
