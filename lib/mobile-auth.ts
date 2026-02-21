import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

function isKdDesa(value: string) {
  // asumsi kd_desa = 12 digit (sesuai model Kd_Desa varchar(12))
  return /^\d{12}$/.test(value.trim())
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
      name: 'Siskeudes',
      credentials: {
        username: { label: 'Nama User', type: 'text' },
        password: { label: 'Password', type: 'password' },
        tahun: { label: 'Tahun', type: 'text' },
        kd_pemda: { label: 'Kode Pemda', type: 'text' }, // ✅ tambahan
      },

      async authorize(creds) {
        const username = (creds?.username || '').trim()
        const password = (creds?.password || '').trim()
        const tahun = (creds?.tahun || '').trim()
        const kd_pemda = (creds?.kd_pemda || '').trim()

        const keyUser = process.env.ENCRYPT_USER_KEY2 // sesuai permintaan
        const keyPwd = process.env.ENCRYPT_PWD_KEY2   // sesuai permintaan

        if (!username || !password || !tahun || !kd_pemda) return null
        if (!keyUser || !keyPwd) return null

        try {
          /**
           * SP mengembalikan 1 kolom bernama Result (string)
           * - Jika berhasil -> Result = Kd_Desa
           * - Jika gagal -> Result = pesan error
           */
          const rows = await prisma.$queryRawUnsafe<Array<{ Result: string }>>(
            `EXEC SP_Login_UserSiskeudes 
               @Tahun='${tahun}',
               @Kd_Pemda='${kd_pemda}',
               @Username=N'${username}',
               @Password=N'${password}',
               @Key1=N'${keyUser}',
               @Key2=N'${keyPwd}'`
          )

          const result = rows?.[0]?.Result?.toString?.() ?? ''
          const out = result.trim()

          if (!out) return null

          // Jika output berupa Kd_Desa -> login sukses
          if (isKdDesa(out)) {
            return {
              id: `${kd_pemda}-${tahun}-${out}-${username}`, // id pseudo (karena SP tak kasih ID)
              username,
              kd_desa: out,
              nama_desa: '', // opsional, kalau ada tabel referensi desa nanti bisa dilengkapi
              tahun,
              kd_pemda,
            } as any
          }

          // selain itu dianggap error message dari SP
          // NextAuth akan treat null sebagai login gagal
          return null
        } catch (e) {
          console.error('SP_Login_UserSiskeudes error:', e)
          return null
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
      session.mobile = token.mobile as any
      return session
    },
  },

  pages: {
    signIn: '/mobile/login-siskeudes',
  },
}
