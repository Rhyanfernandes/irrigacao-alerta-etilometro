import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export function Dashboard() {
  const { user } = useAuth()
  const [valor, setValor] = useState('')
  const [observacao, setObservacao] = useState('')
  const [registros, setRegistros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarRegistros()
  }, [])

  async function carregarRegistros() {
    try {
      // TODO: Implementar busca de registros
      setRegistros([])
    } catch (error) {
      console.error('Erro ao carregar registros:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      // TODO: Implementar registro
      setValor('')
      setObservacao('')
      await carregarRegistros()
    } catch (error) {
      console.error('Erro ao registrar:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Bem-vindo, {user?.name}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Observação
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Registrar
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Registros Recentes</h2>
            <div className="space-y-4">
              {registros.map((registro) => (
                <div
                  key={registro.id}
                  className="border-b border-gray-200 pb-4 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Valor: {registro.valor}</p>
                      <p className="text-sm text-gray-500">
                        Data: {new Date(registro.data).toLocaleString()}
                      </p>
                      {registro.observacao && (
                        <p className="text-sm text-gray-600 mt-1">
                          {registro.observacao}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 