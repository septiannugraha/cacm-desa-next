import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  await prisma.$executeRawUnsafe(`EXEC sp_cek_redflags`)
  return NextResponse.json({ success: true })
}