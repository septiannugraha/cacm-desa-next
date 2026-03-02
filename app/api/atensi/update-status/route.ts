import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }


    const Nama =
    (session.user as any)?.username ||
    (session.user as any)?.name ||
    session.user.email ||
    'system'


    const result = await prisma.$transaction(async (tx) => {

      // 🔹 Update Header (CACM_Atensi_Desa)
      const updateHeader = await tx.cACM_Atensi_Desa.updateMany({
        where: {
          id: id,
          StatusTL: 4
        },
        data: {
          StatusTL: 5
        }
      })

      // 🔹 Update Rincian (CACM_Atensi_Desa_Rinc)
 
      const updateRinc = await tx.$executeRaw`
      UPDATE CACM_Atensi_Desa_Rinc
      SET 
        StatusTL = 5,
        HistoryAtensi = dbo.AddHistoryAtensiToJson(
          HistoryAtensi,
          ${Nama},
          5,
          1,
          CURRENT_TIMESTAMP
        )
      WHERE 
        id_Atensi_Desa = ${id}
        AND StatusTL = 4
    `

      return {
        headerUpdated: updateHeader.count,
        rincUpdated: updateRinc
      }
    })

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed update status' },
      { status: 500 }
    )
  }
}