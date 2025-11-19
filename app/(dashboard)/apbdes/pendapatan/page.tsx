'use client'

import { useRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import useEmblaCarousel from 'embla-carousel-react'
import { FiMenu } from 'react-icons/fi'
import Link from 'next/link'
import {
  ArrowLeft,
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
 
 
  ringkasan_pendapatan : ChartData[]
  pendapatan_perkelompok: ChartData[]
  pendapatan_persumberdana: ChartData[]
  rincian_pades: ChartData[]
  rincian_ptransfer: ChartData[]
  rincian_plainnya: ChartData[]
  pendapatan_tertinggi: ChartData[]
  pendapatan_terendah: ChartData[]
  pades_tertinggi: ChartData[]
  pades_terendah: ChartData[]
  realisasi_pendapatan_bulanan: ChartData[]
  trend_pendapatan_bulanan: ChartData[]
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
  const [chartData, setChartData] = useState<DashboardChartData | null>(null)
  const [loadingCharts, setLoadingCharts] = useState(true)

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
    setLoadingCharts(true)
    try {
      const res = await fetch(`/api/dashboard/chart-data/pendapatan${filterQueryString}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: DashboardChartData = await res.json()
      setChartData(data)
    } catch (e) {
      console.error('[Dashboard] chart data error', e)
      setChartData(null)
    } finally {
      setLoadingCharts(false)
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
    <div className="space-y-4 sm:space-y-6 w-full">
    {/* Header */}
<div className="flex items-center justify-between">
  {/* Kiri: Judul */}
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Dashboard Pendapatan APBDes</h1>
    <p className="text-gray-600 mt-1">{subtitle}</p>
  </div>

  {/* Kanan: Tombol-tombol */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => setShowFilterModal(true)}
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      aria-label="Open Filter Modal"
    >
      <FiMenu size={18} />
      Filter
    </button>

    <Link
      href="/dashboard"
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Kembali ke Dashboard
    </Link>
  </div>
</div>

      {/* Filter Modal */}
      <FilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filterData={{
          provinsi: provinsiOptions,
          pemda: pemdaOptions,
          kecamatan: kecamatanOptions,
          desa: desaOptions,
          sumberdana: sumberdanaOptions,
        }}
        selected={{
          provinsi: selectedProvinsi,
          pemda: selectedPemda,
          kecamatan: selectedKecamatan,
          desa: selectedDesa,
          sumberdana: selectedSumberDana,
        }}
        setSelected={(u) => {
          setSelectedProvinsi(u.provinsi)
          setSelectedPemda(u.pemda)
          setSelectedKecamatan(u.kecamatan)
          setSelectedDesa(u.desa)
          setSelectedSumberDana(u.sumberdana)
        }}
        loaders={{
          provinsi: loadProvinsi,      // buka/ketik → load semua provinsi
          pemda: () => loadPemda(),    // buka pemda → load list by provinsi
          kecamatan: () => loadKecamatan(),
          desa: () => loadDesa(),
          sumberdana: loadSumberdana,
        }}
        onApply={() => {
          setShowFilterModal(false)
          fetchChartData()
        }}
        onClear={() => {
          setSelectedProvinsi('')
          setSelectedPemda('')
          setSelectedKecamatan('')
          setSelectedDesa('')
          setSelectedSumberDana('')
          setPemdaOptions([])
          setKecamatanOptions([])
          setDesaOptions([])
          fetchChartData()
          // reset guards karena clear dianggap state baru
          prevProvRef.current = ''
          prevPemdaRef.current = ''
          initialAppliedRef.current = true
        }}
      />

      {/* Financial Summary Cards - Carousel */}
      <div className="relative bg-gray-50 px-4 sm:px-6 py-4 sm:py-6 rounded-lg w-full">
        <div className="flex items-center justify-between mb-4 w-full">
          <h2 className="text-lg font-semibold text-gray-900">Ringkasan Keuangan</h2>
          <div className="flex gap-2">
            <button onClick={scrollPrev} className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors border border-gray-200" aria-label="Previous slide">
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button onClick={scrollNext} className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors border border-gray-200" aria-label="Next slide">
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>



        <div className="overflow-hidden max-w-full" ref={emblaRef}>
          <div className="flex gap-4 max-w-full">
          {chartData?.ringkasan_pendapatan?.map((stat, index) => {
  const color = colors[index % colors.length] // rotasi warna jika data lebih dari 4

  return (
    <div
      key={index}
      className="flex-[0_0_calc(100%-1rem)] min-w-0 sm:flex-[0_0_calc(50%-0.5rem)] lg:flex-[0_0_calc(40%-0.667rem)] xl:flex-[0_0_calc(25%-0.75rem)]"
    >
     <div className="bg-white rounded-lg shadow overflow-hidden h-full">
  {/* Header dengan background sama seperti kotak persentase */}
  <div className={`${color} text-white px-4 py-2`}>
    <h3 className="text-sm sm:text-base font-semibold leading-tight text-center">
      {stat.Kategori1}
    </h3>
  </div>

  {/* Konten utama */}
  <div className="flex items-center p-4">
    {/* Kotak persentase */}
    <div
      className={`${color} text-white w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg mr-3 sm:mr-4 flex-shrink-0`}
    >
      <span className="text-base sm:text-lg font-bold">
        {stat.Nilai3?.toFixed(2)}%
      </span>
    </div>

    {/* Detail anggaran */}
    <div className="flex-1 min-w-0">
      <div className="space-y-1 mb-2 text-xs">
        <div>
          <span className="text-gray-500">Anggaran:</span>
          <p className="font-medium text-gray-900 truncate">
            {formatCurrency(stat.Nilai1)}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Realisasi:</span>
          <p className="font-medium text-gray-900 truncate">
            {formatCurrency(stat.Nilai2 || 0)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${stat.Nilai3}%` }}
        />
      </div>
    </div>
  </div>
      </div>
    </div>
  )
})}
          </div>
        </div>
      </div>

      {/* Charts */}
      {loadingCharts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : chartData && (chartData.pendapatan_perkelompok.length > 0 || chartData.pendapatan_persumberdana.length > 0) ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <BarChartDashboard data={chartData.pendapatan_perkelompok} title="Pendapatan per Kelompok Pendapatan" nilai1Label="Anggaran" nilai2Label='Realisasi'    />
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <PieChartDashboard data={chartData.pendapatan_persumberdana} title="Pendapatan per Sumber Dana" nilai1Label="Anggaran" nilai2Label='Realisasi'    />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
             <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <BarChartDashboard data={chartData.rincian_pades} title="Rincian Pendapatan Asli Desa" dataKey="Nilai1" nameKey="Kategori1"   />
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <PieChartDashboard data={chartData.rincian_ptransfer} title="Rincian Pendapatan Transfer" dataKey="Nilai1" nameKey="Kategori1"   />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <BarChartDashboard data={chartData.rincian_plainnya} title="Rincian Pendapatan Lainnya" nilai1Label="Anggaran" nilai2Label='Realisasi'   />
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <PieChartDashboard data={chartData.rincian_plainnya} title="Proposi Anggaran per Bidang" dataKey="Nilai1" nameKey="Kategori1"   />
            </div>
          </div>



          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6 w-full">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
             <LineChartDashboard  data={chartData.trend_pendapatan_bulanan} title="Trend Pendapatan Bulanan" nilai1Label="Anggaran" nilai2Label='Realisasi'  xAxisKey="Kategori1"
                columnLabels={{
                  Kategori1: 'Bulan',
                  Nilai1: 'Anggaran',
                  Nilai2: 'Realisasi',
                  }}
             
             />
            </div>
            
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
             <BarChartDashboard  data={chartData.pendapatan_tertinggi} title="Pendapatan Tertinggi" nilai1Label="Anggaran" nilai2Label='Realisasi'    />
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <BarChartDashboard  data={chartData.pendapatan_terendah} title="Pendapatan Terendah" nilai1Label="Anggaran" nilai2Label='Realisasi'   />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <BarChartDashboard  data={chartData.pades_tertinggi} title="Pendapatan Asli Desa Tertinggi" nilai1Label="Anggaran" nilai2Label='Realisasi'   />
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <BarChartDashboard  data={chartData.pades_terendah} title="Pendapatan Asli Desa Terendah" nilai1Label="Anggaran" nilai2Label='Realisasi'   />
            </div>
          </div>
           
       
v
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 font-medium">Data grafik tidak tersedia</p>
          <p className="text-yellow-600 text-sm mt-2">{!chartData ? 'Gagal memuat data dari server' : 'Tidak ada data untuk periode yang dipilih'}</p>
        </div>
      )}

 

 
    </div>
  )
}
