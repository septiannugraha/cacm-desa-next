import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Types
export interface AtensiListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  priority?: string
  villageId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateAtensiData {
  title: string
  description: string
  categoryId: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  villageId: string
  fiscalYear: number
  amount?: number
  accountCode?: string
  dueDate?: string
}

export interface UpdateAtensiData {
  title?: string
  description?: string
  categoryId?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status?: 'OPEN' | 'IN_PROGRESS' | 'WAITING_RESPONSE' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
  assignedToId?: string | null
  dueDate?: string | null
}

export interface CreateResponseData {
  content: string
  type?: 'COMMENT' | 'ACTION' | 'RESOLUTION' | 'ESCALATION'
  isInternal?: boolean
  attachmentIds?: string[]
}

// API Functions

export async function fetchAtensi(params: AtensiListParams = {}) {
  const response = await api.get('/atensi', { params })
  return response.data
}

export async function fetchAtensiDetail(id: string) {
  const response = await api.get(`/atensi/${id}`)
  return response.data
}

export async function createAtensi(data: CreateAtensiData) {
  const response = await api.post('/atensi', data)
  return response.data
}

export async function updateAtensi(id: string, data: UpdateAtensiData) {
  const response = await api.put(`/atensi/${id}`, data)
  return response.data
}

export async function deleteAtensi(id: string) {
  const response = await api.delete(`/atensi/${id}`)
  return response.data
}

export async function addResponse(atensiId: string, data: CreateResponseData) {
  const response = await api.post(`/atensi/${atensiId}/responses`, data)
  return response.data
}

// Helper functions

export async function fetchCategories() {
  const response = await api.get('/atensi/categories')
  return response.data
}

export async function fetchVillages() {
  const response = await api.get('/villages')
  return response.data
}