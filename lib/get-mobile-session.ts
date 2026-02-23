import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { headers } from 'next/headers'
import { mobileAuthOptions } from '@/lib/mobile-auth'

/**
 * Bentuk session mobile yang kita pakai di project ini.
 * (Sesuaikan jika kamu menambah field lain di mobile-auth.ts)
 */
export type MobileSession = Session & {
  mobile?: {
    username: string
    kd_desa: string
    nama_desa: string
    tahun: string
    kd_pemda?: string
  } | null
}

export type MobileIdentity = {
  username: string
  kd_desa: string
  nama_desa: string
  tahun: string
  kd_pemda?: string
}

/**
 * Response Unauthorized standar (konsisten untuk semua endpoint mobile)
 */
export function unauthorized(extra?: Record<string, any>) {
  return NextResponse.json(
    { error: 'Unauthorized', ...(extra || {}) },
    { status: 401 }
  )
}

/**
 * Ambil session mobile (bisa null).
 * Gunakan ini kalau endpoint bersifat optional / bisa anonymous.
 */
export async function getMobileSession(): Promise<MobileSession | null> {
  const session = (await getServerSession(mobileAuthOptions)) as MobileSession | null
  return session
}

/**
 * Ambil identitas mobile (kd_desa, tahun, dll) dalam bentuk ringkas.
 * Return null jika tidak ada session / tidak lengkap.
 */
export async function getMobileIdentity(): Promise<MobileIdentity | null> {
  const session = await getMobileSession()
  const m = session?.mobile || null
  if (!m?.kd_desa || !m?.tahun || !m?.username) return null

  return {
    username: m.username,
    kd_desa: m.kd_desa,
    nama_desa: m.nama_desa || '',
    tahun: m.tahun,
    kd_pemda: m.kd_pemda,
  }
}

/**
 * Mode yang paling sering dipakai di route handler:
 * - Kalau tidak login -> return 401 response siap-return
 * - Kalau login -> return { ok:true, kd_desa, tahun, ... }
 */
export async function requireMobileAuth() {
  const session = await getMobileSession()
  const mobile = session?.mobile || null

  const kd_desa = mobile?.kd_desa || null
  const tahun = mobile?.tahun || null
  const username = mobile?.username || null
  const kd_pemda = mobile?.kd_pemda || null
  const nama_desa = mobile?.nama_desa || null

  if (!kd_desa || !tahun || !username) {
    return {
      ok: false as const,
      session: null,
      mobile: null,
      kd_desa: null,
      tahun: null,
      username: null,
      kd_pemda: null,
      nama_desa: null,
      response: unauthorized(),
    }
  }

  return {
    ok: true as const,
    session,
    mobile,
    kd_desa,
    tahun,
    username,
    kd_pemda,
    nama_desa,
    response: null,
  }
}

/**
 * Versi "strict" yang langsung mengembalikan NextResponse 401 (throw).
 * Cocok jika kamu ingin early exit tanpa if panjang.
 *
 * Pemakaian:
 *   const { kd_desa, tahun } = await requireMobileSession()
 */
export async function requireMobileSession(): Promise<MobileIdentity> {
  const ident = await getMobileIdentity()
  if (!ident) {
    // throw NextResponse biar route handler bisa `return` cepat via try/catch,
    // tapi biasanya lebih enak pakai requireMobileAuth() di atas.
    throw unauthorized()
  }
  return ident
}

/**
 * Opsional: Debug cookie mobile apakah ikut terkirim ke endpoint ini.
 * Sangat membantu jika masih Unauthorized padahal login sukses.
 */
export async function debugCookiePresence() {
  const cookieHeader = (await headers()).get('cookie') || ''
  const hasMobileCookie =
    cookieHeader.includes('cacm_desa_mobile.session-token') ||
    cookieHeader.includes('__Secure-cacm_desa_mobile.session-token')

  return {
    hasMobileCookie,
    cookieHeaderSample: cookieHeader.slice(0, 250),
  }
}
