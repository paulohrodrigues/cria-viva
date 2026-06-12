import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useFarms() {
  return useQuery({
    queryKey: ['fazendas'],
    queryFn: async () => {
      const { data } = await api.get('/fazendas')
      return data
    },
  })
}

export function useDashboard(farmId: string) {
  return useQuery({
    queryKey: ['dashboard', farmId],
    queryFn: async () => {
      const { data } = await api.get(`/fazendas/${farmId}/dashboard`)
      return data
    },
    enabled: !!farmId,
    refetchInterval: 1000 * 60 * 5,
  })
}

export function useCreateFarm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: { nome: string; cidade?: string; estado?: string; tipo?: string }) => {
      const { data } = await api.post('/fazendas', dto)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fazendas'] }),
  })
}
