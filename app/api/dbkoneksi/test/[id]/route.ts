import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import sql from 'mssql';
import {
  decryptUser,
  decryptPwd,
  decryptServer,
  decryptDB,
} from '@/lib/encryption';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.$queryRaw<
      {
        Server: string | null;
        UID: string | null;
        Pwd: string | null;
        DB: string | null;
      }[]
    >(Prisma.sql`
      SELECT
        'ANSI[' + dbo.fn_StringToAnsiBytes(Server) + ']' AS Server,
        'ANSI[' + dbo.fn_StringToAnsiBytes(UID) + ']' AS UID,
        'ANSI[' + dbo.fn_StringToAnsiBytes(Pwd) + ']' AS Pwd,
        'ANSI[' + dbo.fn_StringToAnsiBytes(DB) + ']' AS DB
      FROM dbo.Ta_KoneksiDB
      WHERE id = ${id}
    `);

    const koneksi = result[0];

    if (!koneksi || !koneksi.Server || !koneksi.DB || !koneksi.UID || !koneksi.Pwd) {
      return NextResponse.json({ error: 'Data koneksi tidak lengkap' }, { status: 400 });
    }

    const config: sql.config = {
      user: decryptUser(koneksi.UID, 1),
      password: decryptPwd(koneksi.Pwd, 1),
      server: decryptServer(koneksi.Server, 1),
      database: decryptDB(koneksi.DB, 1),
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };

    try {
      const pool = await sql.connect(config);
      await pool.close();
      return NextResponse.json({ message: 'Koneksi berhasil' });
    } catch (err) {
      if (err instanceof Error) {
        console.error('Koneksi gagal:', err.message);
        return NextResponse.json({ error: 'Koneksi gagal: ' + err.message }, { status: 500 });
      } else {
        console.error('Koneksi gagal:', err);
        return NextResponse.json({ error: 'Koneksi gagal: unknown error' }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Gagal menguji koneksi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat uji koneksi' }, { status: 500 });
  }
}