import dynamic from "next/dynamic"

const MapVector = dynamic(
  () => import("./MapVector"),
  { ssr: false }
)

export default function Page() {

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <MapVector />
    </div>
  )

}