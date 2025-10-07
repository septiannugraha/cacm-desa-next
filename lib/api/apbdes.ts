import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Types
export interface PendapatanListParams {
  tahun?: number
  kdDesa?: string
  kdPemda?: string
}

export interface PendapatanItem {
  Tahun: number
  Kd_Pemda: string
  No_ST: string
  Kd_Desa: string
  Kd_Keg: string | null
  Kd_Rincian: string | null
  Nama_Obyek: string | null
  JmlAnggaran: number | null
  JmlRealisasi: number | null
  Persen: number | null
}

export interface PendapatanSummary {
  totalAnggaran: number
  totalRealisasi: number
  persenRealisasi: number
  jumlahItem: number
}

export interface PendapatanResponse {
  data: PendapatanItem[]
  summary: PendapatanSummary
}

// API Functions
export async function fetchPendapatan(params: PendapatanListParams = {}) {
  const response = await api.get<PendapatanResponse>('/apbdes/pendapatan', { params })
  return response.data
}
