import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useAnimals(farmId: string) {
  return useQuery({
    queryKey: ['animals', farmId],
    queryFn: async () => {
      const { data } = await api.get(`/farms/${farmId}/animals`)
      return data
    },
    enabled: !!farmId,
  })
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ['animal', id],
    queryFn: async () => {
      const { data } = await api.get(`/animals/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateAnimal(farmId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      earTag: string
      name?: string
      breed?: string
      birthDate?: string
      weightKg?: number
    }) => {
      const { data } = await api.post(`/farms/${farmId}/animals`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['animals', farmId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCreateEvent(animalId: string, farmId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      type: string
      eventDate: string
      result?: boolean
      notes?: string
      extraData?: Record<string, unknown>
    }) => {
      const { data } = await api.post(`/animals/${animalId}/events`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['animal', animalId] })
      qc.invalidateQueries({ queryKey: ['animals', farmId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
