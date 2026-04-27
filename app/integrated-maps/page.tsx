'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Breadcrumb from './components/Breadcrumb'
import MetricSelector from './components/MetricSelector'
import MapLegend from './components/MapLegend'
import StatisticsPanel from './components/StatisticsPanel'
import type { MapLevel, MapMetric, BreadcrumbItem, RegionGeoJSON } from '@/types/map'
import { Loader2, AlertCircle, TrendingUp, Home } from 'lucide-react'
import { FiMenu } from 'react-icons/fi'
import FilterModal from '@/components/dashboard/FilterModal'

const InteractiveMap = dynamic(
 () => import('./components/InteractiveMap'),
 { ssr:false, loading:()=> <MapLoadingState/> }
)

function MapLoadingState(){
 return(
  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
   <div className="text-center">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3"/>
    <p className="text-gray-600">Memuat peta...</p>
   </div>
  </div>
 )
}

/* ===============================
   LEVEL ORDER
================================ */

const LEVEL_ORDER: MapLevel[] = [
 'provinsi',
 'pemda',
 'kecamatan',
 'desa'
]

function getNextLevel(level:MapLevel){
 const idx = LEVEL_ORDER.indexOf(level)
 if(idx === -1) return null
 return LEVEL_ORDER[idx+1] ?? null
}

/* ===============================
   UTIL
================================ */

function toDotCode(kd:string){
 const raw = (kd||'').trim()
 if(/^\d{4}$/.test(raw)) return `${raw.slice(0,2)}.${raw.slice(2,4)}`
 if(/^\d{2}\.\d{2}$/.test(raw)) return raw
 return raw
}

/* ===============================
   YEAR SELECTOR
================================ */

function YearSelector({
 selectedYear,
 onYearChange
}:{
 selectedYear:number
 onYearChange:(y:number)=>void
}){

 const currentYear = new Date().getFullYear()

 const years = Array.from({length:5},(_,i)=> currentYear - i)

 return(

  <div className="flex items-center space-x-2">
   <label className="text-sm text-gray-700">Tahun:</label>

   <select
    value={selectedYear}
    onChange={(e)=>onYearChange(Number(e.target.value))}
    className="border rounded px-2 py-1 text-sm bg-white"
   >
    {years.map(y=>(
     <option key={y} value={y}>{y}</option>
    ))}
   </select>

  </div>

 )
}

/* ===============================
   MAIN DASHBOARD
================================ */

export default function MapDashboardPage(){

 const pemdaRaw = (process.env.NEXT_PUBLIC_PEMDA_CODE || '').trim()
 const pemdaNameEnv = (process.env.NEXT_PUBLIC_PEMDA_NAME || '').trim()

 const pemdaDot = useMemo(()=>toDotCode(pemdaRaw),[pemdaRaw])

 const [currentLevel,setCurrentLevel] = useState<MapLevel>('provinsi')
 const [currentCode,setCurrentCode] = useState<string>('')

 const [breadcrumb,setBreadcrumb] = useState<BreadcrumbItem[]>([
  {name:'Indonesia', level:'provinsi', code:''}
 ])

 const [selectedMetric,setSelectedMetric] = useState<MapMetric>('budget')
 const [selectedYear,setSelectedYear] = useState<number>(new Date().getFullYear())

 const [geojson,setGeojson] = useState<RegionGeoJSON|null>(null)
 const [mapData,setMapData] = useState<any[]>([])
 const [gradationData,setGradationData] = useState<any[]>([])

 const [selectedRegion,setSelectedRegion] = useState<{code:string,name:string}|null>(null)

 const [loading,setLoading] = useState(true)
 const [error,setError] = useState<string|null>(null)

 const [isPanelOpen,setIsPanelOpen] = useState(false)
 const [showFilterModal, setShowFilterModal] = useState(false)

 // Filter selection state
 const [selectedProvinsi, setSelectedProvinsi] = useState<string>('')
 const [selectedPemda, setSelectedPemda] = useState<string>('')
 const [selectedKecamatan, setSelectedKecamatan] = useState<string>('')
 const [selectedDesa, setSelectedDesa] = useState<string>('')
 const [selectedSumberDana, setSelectedSumberDana] = useState<string>('')

 const [filterData, setFilterData] = useState({
   provinsi: [],
   pemda: [],
   kecamatan: [],
   desa: [],
   sumberdana: []
 })

 /* ===============================
    LAZY LOADERS for FilterModal
 ================================= */
 const loadFilterOptions = async (type: string, params: any = {}) => {
   const qs = new URLSearchParams(params).toString()
   const res = await fetch(`/api/dashboard/filters?type=${type}&${qs}`, { cache: 'no-store' })
   if (res.ok) {
     const { data } = await res.json()
     setFilterData(prev => ({ ...prev, [type]: data || [] }))
   }
 }

 /* ===============================
    GEOJSON LOAD
 ================================= */

 useEffect(()=>{

  const fetchGeoJSON = async()=>{

   setLoading(true)
   setError(null)

   try{

    const filename = currentCode || 'indonesia'

    const res = await fetch(`/data/${currentLevel}/${filename}.json`)

    if(!res.ok) throw new Error()

    const data = await res.json()

    setGeojson(data)

   }catch{

    setError(`GeoJSON tidak tersedia: ${currentLevel}/${currentCode||'indonesia'}.json`)
    setGeojson(null)

   }finally{

    setLoading(false)

   }

  }

  fetchGeoJSON()

 },[currentLevel,currentCode])

 /* ===============================
    MAP DATA (GRADASI)
 ================================= */

 useEffect(()=>{

  const fetchMapData = async()=>{

   try{

    const res = await fetch(
     `/api/map/gradasi?tahun=${selectedYear}&level=${currentLevel}&kode=${encodeURIComponent(currentCode)}`
    )

    const data = await res.json()

    setMapData(data.map_data || [])
    setGradationData(data.gradation_data || [])

   }catch(err){

    console.error(err)

   }

  }

  fetchMapData()

 },[currentLevel,currentCode,selectedYear])

 /* ===============================
    CLICK HANDLER
 ================================= */

 const handleRegionClick = (code:string,name:string)=>{

  setSelectedRegion({code,name})
  setIsPanelOpen(true)

 }

 const handleRegionDoubleClick = (code:string,name:string)=>{

  const nextLevel = getNextLevel(currentLevel)

  if(!nextLevel) return

  setCurrentLevel(nextLevel)
  setCurrentCode(code)

  setBreadcrumb(prev=>[
   ...prev,
   {name,level:nextLevel,code}
  ])

  setSelectedRegion(null)

 }

 const handleBreadcrumbNavigate = (index:number)=>{

  const target = breadcrumb[index]

  setBreadcrumb(breadcrumb.slice(0,index+1))

  setCurrentLevel(target.level)
  setCurrentCode(target.code)

  setSelectedRegion(null)

 }

 const handleHomeClick = () => {
    if (session) router.push('/')
    else router.push('/login')
  }

 /* ===============================
    UI
 ================================= */

 return(

  <div className="relative w-screen h-screen overflow-hidden bg-gray-100">

   {/* HEADER */}
   <div className="absolute top-0 left-0 right-0 z-40 
                   h-16 backdrop-blur-md bg-white/80 border-b border-gray-200
                   flex items-center px-6 shadow-sm">

    <button onClick={handleHomeClick} className="hover:scale-105 transition-transform duration-300 mr-2">
      <img src="/cacm_logo.png" alt="logo" className="h-8"/>
    </button>

    <button 
      onClick={handleHomeClick}
      className="p-2 mr-4 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
      title="Ke Halaman Utama"
    >
      <Home className="w-5 h-5" />
    </button>

    <div className="flex-1">
     <Breadcrumb items={breadcrumb} onNavigate={handleBreadcrumbNavigate}/>
    </div>

    <div className="flex items-center gap-4">
      <MetricSelector
       selectedMetric={selectedMetric}
       onMetricChange={setSelectedMetric}
      />

      <YearSelector
       selectedYear={selectedYear}
       onYearChange={setSelectedYear}
      />

      <div className="h-8 w-px bg-gray-200 mx-2" />

      <button
        onClick={() => setShowFilterModal(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white shadow hover:bg-slate-800 transition"
      >
        <FiMenu className="w-4 h-4" />
        <span className="font-semibold text-sm">Filter</span>
      </button>

      <button
        onClick={() => setIsPanelOpen(prev => !prev)}
        className={`p-2.5 rounded-xl border transition ${isPanelOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        title="Toggle Panel Statistik"
      >
        <TrendingUp className="w-5 h-5" />
      </button>
    </div>

   </div>

   {/* MAP */}
   <div
    className={`absolute inset-0 z-10 transition-all duration-300 pt-16 ${
     isPanelOpen ? 'pr-[360px]' : ''
    }`}
   >

    {loading && <MapLoadingState/>}

    {error && (

     <div className="w-full h-full flex items-center justify-center bg-white">

      <div className="text-center max-w-md">

       <AlertCircle className="w-10 h-10 text-orange-500 mx-auto mb-3"/>

       <p className="font-medium">Data Peta Belum Tersedia</p>

       <p className="text-sm text-gray-600 mt-2">{error}</p>

      </div>

     </div>

    )}

    {!loading && !error && geojson && (

     <>
      <InteractiveMap
       geojson={geojson}
       map_data={mapData}
       gradation_data={gradationData}
       level={currentLevel}
       metric={selectedMetric}
       tahun={selectedYear.toString()}
       onRegionDoubleClick={handleRegionDoubleClick}
       onRegionSingleClick={handleRegionClick}
       isPanelOpen={isPanelOpen}
      />

      <div className="absolute bottom-6 right-6 bg-white shadow-lg rounded-lg p-3 z-30">
       <MapLegend metric={selectedMetric} breaks={null}/>
      </div>
     </>

    )}

   </div>

   {/* PANEL */}
   {isPanelOpen && (
    <div className="absolute top-16 bottom-0 right-0 z-50 w-[360px] bg-white border-l border-gray-200 shadow-xl overflow-hidden">
      <StatisticsPanel
       level={currentLevel}
       code={selectedRegion?.code || currentCode || null}
       regionName={
        selectedRegion?.name ||
        pemdaNameEnv ||
        `Pemda ${pemdaDot}`
       }
       tahun={selectedYear.toString()}
      />
    </div>
   )}

   <FilterModal
     show={showFilterModal}
     onClose={() => setShowFilterModal(false)}
     filterData={filterData}
     selected={{
       provinsi: selectedProvinsi,
       pemda: selectedPemda,
       kecamatan: selectedKecamatan,
       desa: selectedDesa,
       sumberdana: selectedSumberDana
     }}
     setSelected={(next) => {
       setSelectedProvinsi(next.provinsi)
       setSelectedPemda(next.pemda)
       setSelectedKecamatan(next.kecamatan)
       setSelectedDesa(next.desa)
       setSelectedSumberDana(next.sumberdana)
     }}
     onApply={() => {
       if (selectedDesa) {
         setCurrentLevel('desa'); setCurrentCode(selectedDesa);
       } else if (selectedKecamatan) {
         setCurrentLevel('kecamatan'); setCurrentCode(selectedKecamatan);
       } else if (selectedPemda) {
         setCurrentLevel('pemda'); setCurrentCode(selectedPemda);
       } else if (selectedProvinsi) {
         setCurrentLevel('provinsi'); setCurrentCode(selectedProvinsi);
       }
       setShowFilterModal(false)
     }}
     onClear={() => {
       setSelectedProvinsi('')
       setSelectedPemda('')
       setSelectedKecamatan('')
       setSelectedDesa('')
       setSelectedSumberDana('')
       setCurrentLevel('provinsi')
       setCurrentCode('')
       setBreadcrumb([{name:'Indonesia', level:'provinsi', code:''}])
     }}
     loaders={{
       provinsi: () => loadFilterOptions('provinsi'),
       pemda: () => loadFilterOptions('pemda', { kdProv: selectedProvinsi }),
       kecamatan: () => loadFilterOptions('kecamatan', { kdPemda: selectedPemda }),
       desa: () => loadFilterOptions('desa', { kdKec: selectedKecamatan }),
       sumberdana: () => loadFilterOptions('sumberdana'),
     }}
   />

  </div>

 )
}