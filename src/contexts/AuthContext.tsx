
import { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from '../hooks/useSupabase'
import type { Usuario, Obra } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  usuario: Usuario | null
  obra: Obra | null
  loading: boolean
  login: (email: string, password: string) => Promise<{
    user: User | null
    session: Session | null
  }>
  logout: () => Promise<void>
  registrarNovoRegistro: (valor: number, observacao?: string) => Promise<void>
  buscarRegistros: () => Promise<any[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSupabase()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
} 
