import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

function normalizeDigits(v: string) {
  return (v || '').toString().trim().replace(/\D/g, '')
}

function getFirstValue(row: Record<string, any> | undefined | null): string {
  if (!row) return ''
  const vals = Object.values(row)
  if (!vals.length) return ''
  return String(vals[0] ?? '').trim()
}

export const mobileAuthOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.MOBILE_AUTH_SECRET,

  /**
   * Cookie beda nama + path /mobile supaya tidak tabrakan
   * dengan session aplikasi induk.
   */
  cookies: {
    sessionToken: {
      name: 'cacm_desa_mobile.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/mobile',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: 'cacm_desa_mobile.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/mobile',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  providers: [
    Credentials({
      // id default = "credentials" (cocok dengan signIn('credentials', ...))
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

        // kunci dari ENV (server-side)
        const keyUser = process.env.ENCRYPT_USER_KEY2
        const keyPwd = process.env.ENCRYPT_PWD_KEY2

        if (!username || !password || !tahun || !kd_pemda) {
          throw new Error('Parameter login belum lengkap.')
        }
        if (!keyUser || !keyPwd) {
          throw new Error('Key enkripsi belum diset di ENV (ENCRYPT_USER_KEY2 / ENCRYPT_PWD_KEY2).')
        }
        if (!/^\d{4}$/.test(tahun)) {
          throw new Error('Tahun harus 4 digit.')
        }

        try {
          /**
           * SP mengembalikan 1 row berisi 1 kolom:
           * - jika sukses: Kd_Desa
           * - jika gagal: pesan ("Username tidak terdaftar!" / "Password Anda Salah!")
           *
           * Jangan bergantung nama kolom "Result".
           */
          const rows = await prisma.$queryRaw<Array<Record<string, any>>>(
            Prisma.sql`EXEC SP_Login_UserSiskeudes
              @Tahun=${tahun},
              @Kd_Pemda=${kd_pemda},
              @Username=${username},
              @Password=${password},
              @Key1=${keyUser},
              @Key2=${keyPwd}`
          )

          const out = getFirstValue(rows?.[0])

          // Debug (opsional): uncomment jika perlu lihat output SP di server
          // console.log('[MOBILE LOGIN] SP out:', out)

          if (!out) {
            throw new Error('SP tidak mengembalikan output.')
          }

          // sukses jika output berisi kd_desa (12 digit)
          const kdDesa = normalizeDigits(out)
          if (kdDesa.length === 12) {
            return {
              id: `${kd_pemda}-${tahun}-${kdDesa}-${username}`,
              username,
              kd_desa: kdDesa,
              nama_desa: '', // opsional: bisa lookup
              tahun,
              kd_pemda,
            } as any
          }

          // selain itu, anggap pesan error dari SP
          throw new Error(out)
        } catch (e: any) {
          // jika sudah Error(out) di atas, teruskan message-nya ke client
          const msg =
            typeof e?.message === 'string' && e.message.trim()
              ? e.message.trim()
              : 'Login gagal (error internal).'
          throw new Error(msg)
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.mobile = {
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
      // simpan semua field mobile dalam session.mobile
      ;(session as any).mobile = (token as any).mobile || null
      return session
    },
  },

  pages: {
    signIn: '/mobile/login-desa',
  },
}
