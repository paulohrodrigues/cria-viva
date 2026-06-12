import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useAnimals(fazendaId: string) {
  return useQuery({
    queryKey: ['animais', fazendaId],
    queryFn: async () => {
      const { data } = await api.get(`/fazendas/${fazendaId}/animais`)
      return data
    },
    enabled: !!fazendaId,
  })
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ['animal', id],
    queryFn: async () => {
      const { data } = await api.get(`/animais/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateAnimal(fazendaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      brinco: string
      nome?: string
      raca?: string
      nascimento?: string
      pesoKg?: number
    }) => {
      const { data } = await api.post(`/fazendas/${fazendaId}/animais`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['animais', fazendaId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCreateEvento(animalId: string, fazendaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      tipo: string
      dataEvento: string
      resultado?: boolean
      observacoes?: string
      dadosExtras?: Record<string, unknown>
    }) => {
      const { data } = await api.post(`/animais/${animalId}/eventos`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['animal', animalId] })
      qc.invalidateQueries({ queryKey: ['animais', fazendaId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
