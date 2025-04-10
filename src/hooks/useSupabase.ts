
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Usuario, Obra, Registro } from '../lib/supabase'

export function useSupabase() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [obra, setObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        carregarUsuario(session.user.id)
      }
      setLoading(false)
    })

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        carregarUsuario(session.user.id)
      } else {
        setUsuario(null)
        setObra(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function carregarUsuario(userId: string) {
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*, obra:obras(*)')
      .eq('id', userId)
      .single()

    if (usuarioError) {
      console.error('Erro ao carregar usuário:', usuarioError)
      return
    }

    setUsuario(usuarioData)
    setObra(usuarioData.obra)
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function registrarNovoRegistro(valor: number, observacao?: string): Promise<void> {
    if (!usuario || !obra) throw new Error('Usuário ou obra não encontrados')

    const { error } = await supabase
      .from('registros')
      .insert([
        {
          obra_id: obra.id,
          usuario_id: usuario.id,
          valor,
          observacao,
          data: new Date().toISOString(),
        },
      ])

    if (error) throw error
    // Retorna void para manter a compatibilidade de tipo
  }

  async function buscarRegistros() {
    if (!obra) throw new Error('Obra não encontrada')

    const { data, error } = await supabase
      .from('registros')
      .select('*, usuario:usuarios(*)')
      .eq('obra_id', obra.id)
      .order('data', { ascending: false })

    if (error) throw error
    return data
  }

  return {
    usuario,
    obra,
    loading,
    login,
    logout,
    registrarNovoRegistro,
    buscarRegistros,
  }
}
