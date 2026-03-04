import dynamic from "next/dynamic"

const MapEngine = dynamic(
  () => import("@/components/MapEngine"),
  { ssr: false }
)

export default function MapPage(){

  return (

    <div
      style={{
        width: "100vw",
        height: "100vh"
      }}
    >

      <MapEngine />

    </div>

  )

}