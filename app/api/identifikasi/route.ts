import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tahun = session.fiscalYear
  
  const kdPemda = session.user.pemdakd

  if (!tahun || !kdPemda) {
    return NextResponse.json({ error: 'Missing Tahun or Kd_Pemda in session' }, { status: 400 })
  }

  // Ambil data utama
  const rawRows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM CACM_Identifikasi_RF WHERE Tahun = '${tahun}' AND Kd_Pemda = '${kdPemda}'`
  );

  // Ambil nama kolom dinamis
  const columns = rawRows.length > 0 ? Object.keys(rawRows[0]) : []

  // Ambil informasi cutoff sebagai string
  const cutoffResult = await prisma.$queryRawUnsafe<any[]>(
    `SELECT TOP 1 
      'Last Update : ' + CONVERT(varchar, Tgl_LastUpdate, 120) + 
      '     |     Tanggal Cut Off : ' + CONVERT(varchar, Tgl_CutOff, 106) + 
      '     |     Jumlah Desa : ' + CONVERT(varchar, Jlh_Desa) + 
      '     |     Jumlah Red Flag Teridentifikasi : ' + CONVERT(varchar, Jlh_RF) AS lastupdate
     FROM CACM_Identifikasi_Log 
     WHERE No_ID IN (SELECT DISTINCT No_ID FROM CACM_Identifikasi_RF) 
       AND Tahun = '${tahun}' AND Kd_Pemda = '${kdPemda}'` 
  )

  const cutoffInfo = cutoffResult[0]?.lastupdate ?? null

  return NextResponse.json({ rows: rawRows, columns, cutoffInfo })
}