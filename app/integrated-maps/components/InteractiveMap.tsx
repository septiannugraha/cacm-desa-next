'use client'

import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Settings } from 'lucide-react'
import type { RegionGeoJSON } from '@/types/map'
import type { MapLevel, MapMetric } from '@/types/map'

const gradColors: Record<number, string> = {
 1:'#bfdbfe',
 2:'#60a5fa',
 3:'#3b82f6',
 4:'#1d4ed8',
 5:'#1e3a8a'
}

function MapBoundsFitter({geojson}:{geojson:RegionGeoJSON}){

 const map = useMap()

 useEffect(()=>{

  if(!geojson?.features?.length) return

  const layer = L.geoJSON(geojson)
  const bounds = layer.getBounds()

  if(bounds.isValid()){
   map.fitBounds(bounds,{padding:[40,40]})
  }

 },[geojson,map])

 return null
}

function MapResizer({trigger}:{trigger:any}){

 const map = useMap()

 useEffect(()=>{
  setTimeout(()=>map.invalidateSize(),300)
 },[trigger,map])

 return null
}

function GeoJSONLayer({
 geojson,
 map_data,
 showLabels,
 onRegionSingleClick,
 onRegionDoubleClick
}:{
 geojson:RegionGeoJSON
 map_data:any[]
 showLabels:boolean
 onRegionSingleClick?:(code:string,name:string)=>void
 onRegionDoubleClick?:(code:string,name:string)=>void
}){

 const map = useMap()

 const geoLayerRef = useRef<L.GeoJSON|null>(null)
 const labelLayerRef = useRef<L.LayerGroup|null>(null)

 const renderer = useRef(L.canvas())


 useEffect(()=>{

  if(geoLayerRef.current) map.removeLayer(geoLayerRef.current)
  if(labelLayerRef.current) map.removeLayer(labelLayerRef.current)

  const statsMap = new Map(map_data.map((s)=>[s.Kode,s]))

  geojson.features.forEach((f)=>{

   const kode = f.properties.code
   const data = statsMap.get(kode)

   if(data){
    f.properties.grad_value = data.Skor
    f.properties.anggaran = Number(data.Anggaran||0)
    f.properties.realisasi = Number(data.Realisasi||0)
   }

  })


  const geoLayer = L.geoJSON(geojson,{

   style:(feature)=>{

    const grad = feature?.properties?.grad_value

    if(!grad){
     return{
      renderer:renderer.current,
      fillColor:'transparent',
      weight:1.5,
      color:'#1e3a8a',
      fillOpacity:0.2
     }
    }

    return{
     renderer:renderer.current,
     fillColor:gradColors[grad],
     weight:1.5,
     color:'#1e3a8a',
     fillOpacity:0.55
    }

   },

   onEachFeature:(feature,layer)=>{

    const kode = feature.properties.code
    const nama = feature.properties.name

    const anggaran = feature.properties.anggaran
    const realisasi = feature.properties.realisasi

    const path = layer as L.Path

    layer.bindTooltip(
     `<strong>${nama}</strong><br/>
     Anggaran: Rp ${anggaran?.toLocaleString('id-ID')??'-'}<br/>
     Realisasi: Rp ${realisasi?.toLocaleString('id-ID')??'-'}`,
     {sticky:true}
    )

    layer.on('mouseover',()=>{

     path.setStyle({
      fillColor:'#3b82f6',
      weight:2,
      color:'#1e40af',
      fillOpacity:0.6
     })

    })

    layer.on('mouseout',()=>{

     const grad = feature?.properties?.grad_value

     if(!grad){
      path.setStyle({
       fillColor:'transparent',
       weight:1.5,
       color:'#1e3a8a',
       fillOpacity:0
      })
     }else{
      path.setStyle({
       fillColor:gradColors[grad],
       weight:1.5,
       color:'#1e3a8a',
       fillOpacity:0.55
      })
     }

    })

    let clickTimeout:any=null

    layer.on('click',()=>{

     if(clickTimeout){
      clearTimeout(clickTimeout)
      clickTimeout=null
      onRegionDoubleClick?.(kode,nama)
     }else{

      clickTimeout=setTimeout(()=>{
       onRegionSingleClick?.(kode,nama)
       clickTimeout=null
      },250)

     }

    })

   }

  })

  geoLayer.addTo(map)
  geoLayerRef.current = geoLayer


  const labelLayer = L.layerGroup()

  geojson.features.forEach((f)=>{

   const name = f.properties.nama
   const g = L.geoJSON(f)
   const center = g.getBounds().getCenter()

   const marker = L.marker(center,{
    interactive:false,
    icon:L.divIcon({
     className:'map-label',
     html:`<span>${name}</span>`
    })
   })

   labelLayer.addLayer(marker)

  })

  labelLayer.addTo(map)
  labelLayerRef.current = labelLayer


  const updateLabels = ()=>{

   const zoom = map.getZoom()

   labelLayer.eachLayer((layer:any)=>{

    const el = layer.getElement?.()

    if(!el) return

    if(!showLabels){
     el.style.display='none'
     return
    }

    if(zoom<6){
     el.style.display='none'
    }else{
     el.style.display='block'
    }

   })

  }

  map.on('zoomend',updateLabels)
  updateLabels()

  return ()=>{

   map.off('zoomend',updateLabels)

   if(geoLayerRef.current) map.removeLayer(geoLayerRef.current)
   if(labelLayerRef.current) map.removeLayer(labelLayerRef.current)

  }

 },[geojson,map_data,map,showLabels])

 return null
}

function MapLegend({gradation_data}:{gradation_data:any[]}){

 return(

  <div className="absolute bottom-3 left-3 bg-white shadow rounded p-3 text-sm z-[1000]">

   <strong>Legenda</strong>

   <ul className="mt-2 space-y-1">

    {gradation_data?.map((item,idx)=>(
     <li key={idx} className="flex items-center gap-2">

      <span
       className="w-4 h-4 rounded"
       style={{backgroundColor:gradColors[item.Skor]}}
      />

      {item.Range_Anggaran}

     </li>
    ))}

   </ul>

  </div>

 )

}



export default function InteractiveMap({
  geojson,
  map_data,
  gradation_data,
  level,
  metric,
  tahun,
  isPanelOpen,
  onRegionDoubleClick,
  onRegionSingleClick,
 }:{
  geojson:RegionGeoJSON
  map_data:any[]
  gradation_data:any[]
  level: MapLevel
  metric: MapMetric
  tahun: string
  isPanelOpen:boolean
  onRegionDoubleClick?:(code:string,name:string)=>void
  onRegionSingleClick?:(code:string,name:string)=>void
 })



{

 const [mounted,setMounted]=useState(false)

 const [showSettings,setShowSettings]=useState(false)
 const [showBasemap,setShowBasemap]=useState(true)

 const [viewMode,setViewMode]=useState<'hierarchy'|'pemda'>('hierarchy')

 useEffect(()=>setMounted(true),[])

 return(

  <div className="relative w-full h-full">

   <div className="absolute left-2 top-20 z-[1200]">

    <button
     onClick={()=>setShowSettings(!showSettings)}
     className="bg-white rounded-xl shadow p-2"
    >
     <Settings size={18}/>
    </button>

    {showSettings && (

     <div className="mt-2 w-56 bg-white rounded-xl shadow-xl p-4 text-sm">

      <div className="font-semibold mb-2">Tampilan</div>

      <label className="flex gap-2 items-center mb-1">
       <input
        type="radio"
        checked={viewMode==='hierarchy'}
        onChange={()=>setViewMode('hierarchy')}
       />
       Berjenjang
      </label>

      <label className="flex gap-2 items-center mb-3">
       <input
        type="radio"
        checked={viewMode==='pemda'}
        onChange={()=>setViewMode('pemda')}
       />
       Pemda &gt; Desa
      </label>

      <div className="flex justify-between items-center">

       <span>Peta Lengkap</span>

       <button
        onClick={()=>setShowBasemap(!showBasemap)}
        className={`w-10 h-5 rounded-full transition ${showBasemap?'bg-blue-500':'bg-gray-300'}`}
       >
        <div
         className={`w-4 h-4 bg-white rounded-full transform transition ${
          showBasemap?'translate-x-5':'translate-x-1'
         }`}
        />
       </button>

      </div>

     </div>

    )}

   </div>

   {mounted && (

    <MapContainer
     center={[-2.5,118]}
     zoom={5}
     scrollWheelZoom
     style={{height:'100%',width:'100%'}}
    >

     {showBasemap && (

      <TileLayer
       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
       attribution="© OpenStreetMap contributors"
      />

     )}

     <MapBoundsFitter geojson={geojson}/>
     <MapResizer trigger={!!isPanelOpen}/>

     <GeoJSONLayer
      geojson={geojson}
      map_data={map_data}
      showLabels={!isPanelOpen}
      onRegionDoubleClick={onRegionDoubleClick}
      onRegionSingleClick={onRegionSingleClick}
     />

     <TileLayer
      url="https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png"
      pane="overlayPane"
     />

    </MapContainer>

   )}

   <MapLegend gradation_data={gradation_data}/>

  </div>

 )
}