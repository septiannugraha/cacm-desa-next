import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
   
    const { id } = await params
 
  const body = await _req.json()

  await prisma.cACM_Atensi_Desa.update({
    where: { id: body.desaId },
    data: { StatusTL: body.status },
  })

  return NextResponse.json({ success: true })
}
