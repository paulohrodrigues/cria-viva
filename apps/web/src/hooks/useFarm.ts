import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: async () => {
      const { data } = await api.get('/farms')
      return data
    },
  })
}

export function useDashboard(farmId: string) {
  return useQuery({
    queryKey: ['dashboard', farmId],
    queryFn: async () => {
      const { data } = await api.get(`/farms/${farmId}/dashboard`)
      return data
    },
    enabled: !!farmId,
    refetchInterval: 1000 * 60 * 5,
  })
}

export function useCreateFarm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: { name: string; city?: string; state?: string; type?: string }) => {
      const { data } = await api.post('/farms', dto)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farms'] }),
  })
}
