import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  decryptUser,
  decryptPwd,
  decryptServer,
  decryptDB,
  encryptUser,
  encryptPwd,
  encryptServer,
  encryptDB,
} from '@/lib/encryption';

// --- [GET] Ambil detail koneksi berdasarkan ID ---
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.$queryRaw<
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
      WHERE id = ${id}
    `);

    const connection = result[0];

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const decrypted = {
      ...connection,
      UID: decryptUser(connection.UID ?? '', 1),
      Pwd: decryptPwd(connection.Pwd ?? '', 1),
      Server: decryptServer(connection.Server ?? '', 1),
      DB: decryptDB(connection.DB ?? '', 1),
    };

    return NextResponse.json(decrypted, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('GET /dbkoneksi/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connection' },
      { status: 500 }
    );
  }
}

// --- [PUT] Update koneksi berdasarkan ID ---
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      Nama_Koneksi,
      Jenis_Koneksi,
      Server,
      DB,
      UID,
      Pwd,
      Mode,
      ConStat,
    } = body;

    const existing = await prisma.ta_KoneksiDB.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const updatedData = {
      Nama_Koneksi: Nama_Koneksi ?? existing.Nama_Koneksi,
      Jenis_Koneksi: Jenis_Koneksi ?? existing.Jenis_Koneksi,
      Server: Server ? encryptServer(Server, 1) : existing.Server,
      DB: DB ? encryptDB(DB, 1) : existing.DB,
      UID: UID ? encryptUser(UID, 1) : existing.UID,
      Pwd: Pwd ? encryptPwd(Pwd, 1) : existing.Pwd,
      Mode: Mode ?? existing.Mode,
      ConStat: ConStat ?? existing.ConStat,
      update_at: new Date(),
      update_by: session.user.username || session.user.email,
    };

    const updated = await prisma.ta_KoneksiDB.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /dbkoneksi/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update connection' },
      { status: 500 }
    );
  }
}

// --- [DELETE] Hapus koneksi berdasarkan ID ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.ta_KoneksiDB.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    await prisma.ta_KoneksiDB.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('DELETE /dbkoneksi/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}