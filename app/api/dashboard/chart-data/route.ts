import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    // Construct the Go API URL
    // We assume the Go API is reachable at localhost:8085/api/v1
    // You should preferably set this in an environment variable like GO_API_URL
    const goApiBaseUrl = process.env.GO_API_URL || 'http://localhost:8085/api/v1'
    
    const params = new URLSearchParams(searchParams)
    params.set('jenis', 'summary')
    
    // Add default tahun and kdpemda if not present and no session
    if (!params.has('tahun')) {
      const fiscalYear = session?.fiscalYear || new Date().getFullYear()
      params.set('tahun', fiscalYear.toString())
    }

    if (!params.has('kdpemda') && !session) {
      // Use environment variable for public default
      const defaultKdPemda = process.env.NEXT_PUBLIC_PEMDA_CODE || '3521'
      params.set('kdpemda', defaultKdPemda)
    }

    const response = await fetch(`${goApiBaseUrl}/dashboard/chart-data?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // In a real scenario, you'd pass the session token or a secret for server-to-server auth
        // 'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Go API error:', errorText)
      throw new Error(`Go API responded with status ${response.status}`)
    }

    const result = await response.json()
    
    // The Go API returns a structure: { message: "success", data: { ... } }
    return NextResponse.json(result.data)

  } catch (error) {
    console.error('Dashboard chart data proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data from backend' },
      { status: 500 }
    )
  }
}