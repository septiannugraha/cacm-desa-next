import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()

  await prisma.cACM_Atensi_Desa.update({
    where: { id: body.desaId },
    data: { StatusTL: body.status },
  })

  return NextResponse.json({ success: true })
}
