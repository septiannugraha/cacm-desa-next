import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

function getFirstValue(row: Record<string, any> | undefined | null): string {
  if (!row) return ''
  const vals = Object.values(row)
  return vals.length ? String(vals[0] ?? '') : ''
}

/**
 * Validasi Kd_Desa bertitik: 3521.01.2001 (4.2.4)
 */
function isKdDesaDot(v: string) {
  const s = (v || '').trim()
  return /^\d{4}\.\d{2}\.\d{4}$/.test(s)
}

/**
 * Output SP: "kd_desa,nama_desa,pesan"
 * Aman jika nama_desa mengandung koma:
 * - parts[0] = kd_desa
 * - parts[last] = pesan
 * - middle = nama_desa
 */
function parseSpOut(out: string) {
  const raw = (out || '').trim()
  const parts = raw.split(',').map((x) => x.trim())

  const kd_desa = parts[0] || ''
  const pesan = parts.length >= 2 ? (parts[parts.length - 1] || '') : ''
  const nama_desa =
    parts.length >= 3 ? parts.slice(1, parts.length - 1).join(',').trim() : ''

  return { kd_desa, nama_desa, pesan, raw }
}

export const mobileAuthOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.MOBILE_AUTH_SECRET,

  cookies: {
    sessionToken: {
      name: 'cacm_desa_mobile.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/mobile',
        secure: (process.env.NEXTAUTH_URL || '').startsWith('https://'),
      },
    },
    csrfToken: {
      name: 'cacm_desa_mobile.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/mobile',
        secure: (process.env.NEXTAUTH_URL || '').startsWith('https://'),
      },
    },
  },

  providers: [
    Credentials({
      /**
       * Penting:
       * id default provider = "credentials"
       * cocok dengan signIn('credentials', ...)
       */
      name: 'Siskeudes',
      credentials: {
        username: { label: 'Nama User', type: 'text' },
        password: { label: 'Password', type: 'password' },
        tahun: { label: 'Tahun', type: 'text' },
        kd_pemda: { label: 'Kode Pemda', type: 'text' },
      },

      async authorize(creds) {
        const username = (creds?.username || '').trim()
        const password = (creds?.password || '').trim()
        const tahun = (creds?.tahun || '').trim()
        const kd_pemda = (creds?.kd_pemda || '').trim()

        const keyUser = process.env.ENCRYPT_USER_KEY2
        const keyPwd = process.env.ENCRYPT_PWD_KEY2

        if (!username || !password || !tahun || !kd_pemda) {
          throw new Error('Parameter login belum lengkap.')
        }
        if (!keyUser || !keyPwd) {
          throw new Error('Key enkripsi belum diset (ENCRYPT_USER_KEY2 / ENCRYPT_PWD_KEY2).')
        }
        if (!/^\d{4}$/.test(tahun)) {
          throw new Error('Tahun harus 4 digit.')
        }

        const rows = await prisma.$queryRaw<Array<Record<string, any>>>(
          Prisma.sql`EXEC SP_Login_UserSiskeudes
            @Tahun=${tahun},
            @Kd_Pemda=${kd_pemda},
            @Username=${username},
            @Password=${password},
            @Key1=${keyUser},
            @Key2=${keyPwd}`
        )

        const out = getFirstValue(rows?.[0]).toString().trim()
        console.log('[MOBILE LOGIN] out=', JSON.stringify(out))

        if (!out) throw new Error('SP tidak mengembalikan output.')

        const { kd_desa, nama_desa, pesan, raw } = parseSpOut(out)

        /**
         * ✅ KUNCI PERBAIKAN:
         * Anggap sukses jika kd_desa valid (bertitik).
         * Pesan tidak dipakai untuk menentukan sukses/gagal
         * karena pesan bisa bervariasi ("Login sukses!", "OK", dll).
         */
        if (isKdDesaDot(kd_desa)) {
          return {
            id: `${kd_pemda}-${tahun}-${kd_desa}-${username}`,
            username,
            kd_desa,
            nama_desa: nama_desa || '',
            tahun,
            kd_pemda,
          } as any
        }

        // gagal → tampilkan pesan kalau ada
        throw new Error(pesan || raw)
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).mobile = {
          username: (user as any).username,
          kd_desa: (user as any).kd_desa,
          nama_desa: (user as any).nama_desa,
          tahun: (user as any).tahun,
          kd_pemda: (user as any).kd_pemda,
        }
      }
      return token
    },

    async session({ session, token }) {
      ;(session as any).mobile = (token as any).mobile || null
      return session
    },
  },

  pages: {
    signIn: '/mobile/login-desa',
    error: '/mobile/login-desa',
  },
}
