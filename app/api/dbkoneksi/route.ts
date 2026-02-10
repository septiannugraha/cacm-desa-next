import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { encryptUser, encryptPwd, encryptServer, encryptDB,
  decryptUser, decryptPwd, decryptServer, decryptDB
 } from '@/lib/encryption'

// --- Fungsi bantu untuk validasi session & pemda ---
async function getPemdaSession() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('UNAUTHORIZED')


  const kdPemda = session.user.pemdakd
  return { session,   kdPemda }
}

// --- [GET] Ambil daftar koneksi DB ---
export async function GET() {
  try {
    const { kdPemda } = await getPemdaSession();

    const connections = await prisma.$queryRaw<
      {
        id: string;
        Kd_Pemda: string | null;
        Nama_Koneksi: string;
        Jenis_Koneksi: string;
        Server: string | null;
        UID: string | null;
        Pwd: string | null;
        DB: string | null;
        Mode: string | null;
        ConStat: boolean | null;
        create_at: Date | null;
        create_by: string | null;
        update_at: Date | null;
        update_by: string | null;
      }[]
    >(Prisma.sql`
      SELECT
        id,
        Kd_Pemda,
        Nama_Koneksi,
        Jenis_Koneksi,
    'ANSI[' + dbo.fn_StringToAnsiBytes(Server) + ']' AS Server,
    'ANSI[' + dbo.fn_StringToAnsiBytes(UID) + ']' AS UID,
    'ANSI[' + dbo.fn_StringToAnsiBytes(Pwd) + ']' AS Pwd,
    'ANSI[' + dbo.fn_StringToAnsiBytes(DB) + ']' AS DB,
        Mode,
        ConStat,
        create_at,
        create_by,
        update_at,
        update_by
      FROM dbo.Ta_KoneksiDB
      WHERE Kd_Pemda = ${kdPemda}

      ORDER BY create_at DESC
    `, kdPemda);

    const decryptedConnections = connections.map((conn) => ({
      ...conn,
      UID: decryptUser(conn.UID || '', 1),
      Pwd: decryptPwd(conn.Pwd || '', 1),
      Server: decryptServer(conn.Server || '', 1),
      DB: decryptDB(conn.DB || '', 1),
    }));

    return NextResponse.json(decryptedConnections, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('GET /dbkoneksi error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}



// --- [POST] Tambah koneksi baru ---
export async function POST(request: Request) {
  try {
    const { session, kdPemda } = await getPemdaSession()
    const body = await request.json()
    const { Server, DB, UID, Pwd, Nama_Koneksi, Jenis_Koneksi, Mode } = body

    if (!Server || !DB || !UID || !Pwd || !Nama_Koneksi || !Jenis_Koneksi) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const connection = await prisma.ta_KoneksiDB.create({
      data: {
        id: crypto.randomUUID(),
        Kd_Pemda: kdPemda,
        Nama_Koneksi,
        Jenis_Koneksi: Jenis_Koneksi ?? 'Siskeudes',
        Server: encryptServer(Server, 1),
        DB: encryptDB(DB, 1),
        UID: encryptUser(UID, 1),
        Pwd: encryptPwd(Pwd, 1),
        Mode,
        ConStat: false,
        create_at: new Date(),
        create_by: session.user.username || session.user.email,
        update_at: null,
        update_by: null,
      },
    })

    return NextResponse.json(connection, { status: 201 })
  } catch (error) {
    console.error('POST /dbkoneksi error:', error)
    if ((error as Error).message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((error as Error).message === 'PEMDA_NOT_FOUND')
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
  }
}

// --- [PUT] Update koneksi ---
export async function PUT(request: Request) {
  try {
    const { session, kdPemda } = await getPemdaSession()
    const body = await request.json()
    const { Server, DB, UID, Pwd, Nama_Koneksi, Jenis_Koneksi, Mode } = body

    const existing = await prisma.ta_KoneksiDB.findFirst({
      where: { Kd_Pemda: kdPemda },
    })

    if (!existing)
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

    const connection = await prisma.ta_KoneksiDB.update({
      where: { id: existing.id },
      data: {
        Server: encryptServer(Server, 1),
        DB: encryptDB(DB, 1),
        UID: encryptUser(UID, 1),
        Pwd: encryptPwd(Pwd, 1),
        Nama_Koneksi,
        Jenis_Koneksi,
        Mode,
        ConStat: false,
        update_at: new Date(),
        update_by: session.user.username || session.user.email,
      },
    })

    return NextResponse.json(connection)
  } catch (error) {
    console.error('PUT /dbkoneksi error:', error)
    if ((error as Error).message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((error as Error).message === 'PEMDA_NOT_FOUND')
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
  }
}

// --- [DELETE] Hapus koneksi ---
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const existing = await prisma.ta_KoneksiDB.findUnique({
      where: { id },
    });
    if (!existing)
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

    await prisma.ta_KoneksiDB.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({ message: 'Connection deleted successfully' })
  } catch (error) {
    console.error('DELETE /dbkoneksi error:', error)
    if ((error as Error).message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((error as Error).message === 'PEMDA_NOT_FOUND')
      return NextResponse.json({ error: 'Pemda not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
  }
}
