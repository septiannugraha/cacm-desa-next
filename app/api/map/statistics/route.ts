import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const goApiBaseUrl = process.env.GO_API_URL || 'http://localhost:8085/api/v1'
    
    const params = new URLSearchParams(searchParams)
    params.set('jenis', 'map_statistics')
    
    const response = await fetch(`${goApiBaseUrl}/dashboard/chart-data?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Go API responded with status ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result.data)

  } catch (error) {
    console.error('Map statistics proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch map statistics from backend' },
      { status: 500 }
    )
  }
}