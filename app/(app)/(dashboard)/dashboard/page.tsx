'use client'
import { Card } from '@/components/ui/card'
import { useRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import useEmblaCarousel from 'embla-carousel-react'
import { FiMenu } from 'react-icons/fi'
import {
  Activity,
  AlertCircle,
  Building,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users
} from 'lucide-react'

import AreaChartDashboard from '@/components/charts/AreaChartDashboard'
import BarChartDashboard from '@/components/charts/BarChartDashboard'
import BarChartDashboardH from '@/components/charts/BarChartDashboardH'
import LineChartDashboard from '@/components/charts/LineChartDashboard'
import PieChartDashboard from '@/components/charts/PieChartDashboard'
import FilterModal from '@/components/dashboard/FilterModal'
import { motion } from 'framer-motion'


/** ==========================
 *  Types
 *  ========================== */
interface ChartData {
  Kategori1: string
  Kategori2?: string
  Nilai1: number
  Nilai2?: number
  Nilai3?: number
}
interface DashboardChartData {
 
  
pendapatan_perkelompok: ChartData[]
pendapatan_persumberdana: ChartData[]
belanja_persumberdana: ChartData[]
belanja_perkelompok: ChartData[]
ringkasan_apbdes: ChartData[]
belanja_pertagging_tertinggi: ChartData[]
belanja_pertagging_terendah: ChartData[] 
}

type ProvOpt = { provinsi: string; Kd_Prov: string }
type PemdaOpt = { namapemda: string; Kd_Pemda: string }
type KecOpt = { kecamatan: string; Kd_Kec: string }
type DesaOpt = { desa: string; Kd_Desa: string }
type SDOpt = { sumberdana: string; Kode: string }

/** ==========================
 *  Page Component
 *  ========================== */
export default function DashboardBelanjaPage() {
  const { data: session, status } = useSession()

  // Guards agar efek reset tidak menendang nilai initial
  const prevProvRef = useRef<string>('')   // last applied provinsi
  const prevPemdaRef = useRef<string>('')  // last applied pemda
  const initialAppliedRef = useRef<boolean>(false)

  // Charts state
  const [ringkasanData, setRingkasanData] = useState<ChartData[] | null>(null)
  const [detailData, setDetailData] = useState<Omit<DashboardChartData, 'ringkasan_apbdes'> | null>(null)
  
  const [loadingRingkasan, setLoadingRingkasan] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(true)

  // Selected filters
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>('')
  const [selectedPemda, setSelectedPemda] = useState<string>('')
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('')
  const [selectedDesa, setSelectedDesa] = useState<string>('')
  const [selectedSumberDana, setSelectedSumberDana] = useState<string>('')

  // Lazy options cache
  const [provinsiOptions, setProvinsiOptions] = useState<ProvOpt[]>([])
  const [provinsiLoadedAll, setProvinsiLoadedAll] = useState(false)
  const [pemdaOptions, setPemdaOptions] = useState<PemdaOpt[]>([])
  const [kecamatanOptions, setKecamatanOptions] = useState<KecOpt[]>([])
  const [desaOptions, setDesaOptions] = useState<DesaOpt[]>([])
  const [sumberdanaOptions, setSumberdanaOptions] = useState<SDOpt[]>([])

  // UI helpers
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', slidesToScroll: 1 })
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // ===== INITIAL: preselect dari session + seed label provinsi + seed 1 item pemda user
  useEffect(() => {
    if (status !== 'authenticated') return
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/filters?mode=initial', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const { type, data } = await res.json()

        if (type === 'initial' && data?.selected && !initialAppliedRef.current) {
          const sel = data.selected as {
            kdProv: string
            provinsi: string
            kdPemda: string
            pemda: string
          }

          // set nilai terpilih
          setSelectedProvinsi(sel.kdProv || '')
          setSelectedPemda(sel.kdPemda || '')

          // seed 1 item provinsi agar label langsung tampil
          if (sel.kdProv) {
            const label = `${sel.kdProv}  ${sel.provinsi || ''}`.trim()
            setProvinsiOptions([{ Kd_Prov: sel.kdProv, provinsi: label }])
            setProvinsiLoadedAll(false)
          }

          // seed 1 item pemda (dari API initial)
          const list = Array.isArray(data.pemda) ? (data.pemda as PemdaOpt[]) : []
          setPemdaOptions(
            list.length
              ? list
              : sel.kdPemda
              ? [{ Kd_Pemda: sel.kdPemda, namapemda: `${sel.kdPemda?.slice(2, 4)}  ${sel.pemda}`.trim() }]
              : []
          )

          // Tandai initial done & set baseline refs
          initialAppliedRef.current = true
          prevProvRef.current = sel.kdProv || ''
          prevPemdaRef.current = sel.kdPemda || ''
        }
      } catch (e) {
        console.error('[initial filters] error', e)
      }
    })()
  }, [status])

  // ===== LOAD CHARTS
  const filterQueryString = useMemo(() => {
    const params = new URLSearchParams()
    if (selectedProvinsi) params.set('kdprov', selectedProvinsi)
    if (selectedPemda) params.set('kdpemda', selectedPemda)
    if (selectedKecamatan) params.set('kdkec', selectedKecamatan)
    if (selectedDesa) params.set('kddesa', selectedDesa)
    if (selectedSumberDana) params.set('kdsumberdana', selectedSumberDana)
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }, [selectedProvinsi, selectedPemda, selectedKecamatan, selectedDesa, selectedSumberDana])

  const fetchChartData = async () => {
    try {
      setLoadingRingkasan(true)
      setLoadingDetail(true)
  
      // 1️⃣ Fetch all data
      const res = await fetch(`/api/dashboard/chart-data${filterQueryString}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
  
      const data: DashboardChartData = await res.json()
  
      // 2️⃣ Set ringkasan dulu
      setRingkasanData(data.ringkasan_apbdes || [])
      setLoadingRingkasan(false)
  
      // 3️⃣ Delay microtask agar UI repaint dulu
      setTimeout(() => {
        setDetailData({
          pendapatan_perkelompok: data.pendapatan_perkelompok,
          pendapatan_persumberdana: data.pendapatan_persumberdana,
          belanja_persumberdana: data.belanja_persumberdana,
          belanja_perkelompok: data.belanja_perkelompok,
          belanja_pertagging_tertinggi: data.belanja_pertagging_tertinggi,
          belanja_pertagging_terendah: data.belanja_pertagging_terendah
        })
        setLoadingDetail(false)
      }, 0)
  
    } catch (e) {
      console.error('[Dashboard] chart data error', e)
      setRingkasanData([])
      setDetailData(null)
      setLoadingRingkasan(false)
      setLoadingDetail(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') fetchChartData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // ===== Lazy loaders (dipanggil saat combobox dibuka / user mengetik)
  const loadProvinsi = async () => {
    if (provinsiLoadedAll) return
    const res = await fetch('/api/dashboard/filters?type=provinsi', { cache: 'no-store' })
    if (res.ok) {
      const { type, data } = await res.json()
      if (type === 'provinsi') {
        setProvinsiOptions(data || [])
        setProvinsiLoadedAll(true)
      }
    }
  }
  const loadPemda = async (kdProv?: string) => {
    const base = kdProv || selectedProvinsi
    if (!base) return
    const res = await fetch(`/api/dashboard/filters?type=pemda&kdProv=${encodeURIComponent(base)}`, { cache: 'no-store' })
    if (res.ok) {
      const { type, data } = await res.json()
      if (type === 'pemda') setPemdaOptions(data || [])
    }
  }
  const loadKecamatan = async (kdPemda?: string) => {
    const base = kdPemda || selectedPemda
    if (!base) return
    try {
      const res = await fetch(`/api/dashboard/filters?type=kecamatan&kdPemda=${encodeURIComponent(base)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { type, data } = await res.json()
      if (type === 'kecamatan') setKecamatanOptions(data || [])
    } catch (err) {
      console.error('[loadKecamatan] error', err)
      setKecamatanOptions([])
    }
  }
  const loadDesa = async (kdKec?: string) => {
    const base = kdKec || selectedKecamatan
    if (!base) return
    try {
      const res = await fetch(`/api/dashboard/filters?type=desa&kdKec=${encodeURIComponent(base)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { type, data } = await res.json()
      if (type === 'desa') setDesaOptions(data || [])
    } catch (err) {
      console.error('[loadDesa] error', err)
      setDesaOptions([])
    }
  }
  const loadSumberdana = async () => {
    if (sumberdanaOptions.length) return
    try {
      const res = await fetch('/api/dashboard/filters?type=sumberdana', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { type, data } = await res.json()
      if (type === 'sumberdana') setSumberdanaOptions(data || [])
    } catch (err) {
      console.error('[loadSumberdana] error', err)
      setSumberdanaOptions([])
    }
  }

  // ===== Reset children saat parent berubah — dengan GUARD (tidak menendang nilai initial)
  useEffect(() => {
    if (!initialAppliedRef.current) return
    if (prevProvRef.current !== selectedProvinsi) {
      setSelectedPemda('')
      setKecamatanOptions([])
      setSelectedKecamatan('')
      setDesaOptions([])
      setSelectedDesa('')
      if (selectedProvinsi) loadPemda(selectedProvinsi)
      prevProvRef.current = selectedProvinsi
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinsi])

  useEffect(() => {
    if (!initialAppliedRef.current) return
    if (prevPemdaRef.current !== selectedPemda) {
      setSelectedKecamatan('')
      setDesaOptions([])
      setSelectedDesa('')
      if (selectedPemda) loadKecamatan(selectedPemda)
      prevPemdaRef.current = selectedPemda
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPemda])

  useEffect(() => {
    if (!initialAppliedRef.current) return
    if (selectedKecamatan) loadDesa(selectedKecamatan)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKecamatan])

  // ===== Subtitle Dinamis =====
  const stripCode = (s?: string) => (s || '').replace(/^\s*\d+\s{2}\s*/, '').trim()
  const provLabel = useMemo(() => stripCode(provinsiOptions.find(o => o.Kd_Prov === selectedProvinsi)?.provinsi), [provinsiOptions, selectedProvinsi])
  const pemdaLabel = useMemo(() => stripCode(pemdaOptions.find(o => o.Kd_Pemda === selectedPemda)?.namapemda), [pemdaOptions, selectedPemda])
  const kecLabel = useMemo(() => stripCode(kecamatanOptions.find(o => o.Kd_Kec === selectedKecamatan)?.kecamatan), [kecamatanOptions, selectedKecamatan])
  const desaLabel = useMemo(() => stripCode(desaOptions.find(o => o.Kd_Desa === selectedDesa)?.desa), [desaOptions, selectedDesa])

  const subtitle = useMemo(() => {
    if (selectedDesa && desaLabel) return `Data CACM Desa ${desaLabel}, ${kecLabel || selectedKecamatan || ''}, ${pemdaLabel || selectedPemda || ''}`.trim()
    if (selectedKecamatan && kecLabel) return `Data CACM Desa ${kecLabel}${pemdaLabel ? `, ${pemdaLabel}` : ''}`
    if (selectedPemda && pemdaLabel) return `Data CACM Desa ${pemdaLabel}`
    if (selectedProvinsi && provLabel) return `Data CACM Desa ${provLabel}`
    return 'Data CACM Desa Seluruh Indonesia'
  }, [selectedProvinsi, selectedPemda, selectedKecamatan, selectedDesa, provLabel, pemdaLabel, kecLabel, desaLabel, selectedKecamatan, selectedPemda])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  if (status === 'unauthenticated') {
    redirect('/login')
  }

  // Mock header cards
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)

  const formatPercent = (value: number) => `${value.toFixed(2)}%`


  const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500']


  return (
    <div className="space-y-12 w-full max-w-[1700px] mx-auto pb-16">
  
      {/* ================= HEADER ================= */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Dashboard Belanja Desa
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-2xl">
            {subtitle}
          </p>
        </div>
  
        <button
          onClick={() => setShowFilterModal(true)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white shadow hover:bg-slate-700 transition"
        >
          Filter Data
        </button>
      </div>
  
  
      {/* ================= RINGKASAN ================= */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          Ringkasan Realisasi
        </h2>
  
        {loadingRingkasan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  
            {ringkasanData?.map((stat, index) => {
              const color = colors[index % colors.length]
  
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-600">
                      {stat.Kategori1}
                    </h3>
                    <div className={`${color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {stat.Nilai3?.toFixed(2)}%
                    </div>
                  </div>
  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Anggaran</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(stat.Nilai1)}
                      </p>
                    </div>
  
                    <div>
                      <p className="text-xs text-slate-400">Realisasi</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(stat.Nilai2 || 0)}
                      </p>
                    </div>
                  </div>
  
                  <div className="mt-5 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${stat.Nilai3}%` }}
                    />
                  </div>
                </div>
              )
            })}
  
          </div>
        )}
      </div>
  
  
      {/* ================= CHART SECTION ================= */}
      {loadingDetail ? (
        <div className="space-y-10">
          {[1,2,3].map(i => (
            <div key={i} className="min-h-[300px] bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : detailData ? (
  
        <div className="space-y-14">
  
          {/* ===== HERO CHART (FULL WIDTH) ===== */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Distribusi Anggaran per Kelompok Belanja
            </h3>
            <div className="min-h-[320px] w-full">
              <PieChartDashboard
                data={detailData.belanja_perkelompok}
                title=""
                dataKey="Nilai1"
                nameKey="Kategori1"
              />
            </div>
          </div>
  
  
          {/* ===== SECONDARY CHART GRID ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
  
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-base font-semibold text-slate-800 mb-5">
                Pendapatan per Kelompok
              </h3>
              <div className="min-h-[300px] w-full">
                <PieChartDashboard
                  data={detailData.pendapatan_perkelompok}
                  title=""
                  dataKey="Nilai1"
                  nameKey="Kategori1"
                />
              </div>
            </div>
  
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-base font-semibold text-slate-800 mb-5">
                Pendapatan per Sumber Dana
              </h3>
              <div className="min-h-[300px] w-full">
                <BarChartDashboard
                  data={detailData.pendapatan_persumberdana}
                  title=""
                  nilai1Label="Anggaran"
                  nilai2Label="Realisasi"
                />
              </div>
            </div>
          </div>
  
  
          {/* ===== ANALYTICS SECTION ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
  
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-base font-semibold text-slate-800 mb-5">
                Belanja per Tagging Tertinggi
              </h3>
              <div className="min-h-[320px] w-full">
                <BarChartDashboardH
                  data={detailData.belanja_pertagging_tertinggi}
                  mode="stacked"
                  title=""
                  nilai1Label="Anggaran"
                  nilai2Label="Realisasi"
                />
              </div>
            </div>
  
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-base font-semibold text-slate-800 mb-5">
                Belanja per Tagging Terendah
              </h3>
              <div className="min-h-[320px] w-full">
                <BarChartDashboardH
                  data={detailData.belanja_pertagging_terendah}
                  mode="stacked"
                  title=""
                  nilai1Label="Anggaran"
                  nilai2Label="Realisasi"
                />
              </div>
            </div>
  
          </div>
  
        </div>
  
      ) : (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-3xl p-12 text-center shadow-sm">
          <AlertCircle className="w-14 h-14 text-yellow-600 mx-auto mb-5" />
          <p className="text-yellow-800 font-semibold text-lg">
            Data grafik tidak tersedia
          </p>
        </div>
      )}
    </div>
  )
 
    
}
