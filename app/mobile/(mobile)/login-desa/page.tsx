'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function isYear4(y: string) {
  return /^\d{4}$/.test(y.trim())
}

export default function MobileLoginPage() {
  const router = useRouter()
  const sp = useSearchParams()

  const defaultYear = useMemo(() => new Date().getFullYear().toString(), [])
  const from = sp.get('from') || '/mobile/atensidesa'
  const tahunFromQS = (sp.get('tahun') || '').trim()

  const pemdaFromEnv = (process.env.NEXT_PUBLIC_PEMDA_CODE || '').trim()

  const [kd_pemda, setKdPemda] = useState(pemdaFromEnv)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tahun, setTahun] = useState(tahunFromQS || defaultYear)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setTahun(tahunFromQS || defaultYear)
  }, [tahunFromQS, defaultYear])

  useEffect(() => {
    setKdPemda(pemdaFromEnv)
  }, [pemdaFromEnv])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    const kp = kd_pemda.trim()
    const u = username.trim()
    const p = password.trim()
    const y = tahun.trim()

    if (!kp) {
      setErrorMsg('Kode Pemda belum diset di ENV. Set NEXT_PUBLIC_PEMDA_CODE lalu restart.')
      return
    }
    if (!u) return setErrorMsg('Nama User wajib diisi.')
    if (!p) return setErrorMsg('Password wajib diisi.')
    if (!isYear4(y)) return setErrorMsg('Tahun harus 4 digit (mis. 2025).')

    setLoading(true)

    const res = await signIn('credentials', {
      redirect: false,
      username: u,
      password: p,
      tahun: y,
      kd_pemda: kp,
    })
    
    setLoading(false)

    if (!res?.ok) {
      setErrorMsg('Login gagal. Periksa Nama User / Password / Tahun.')
      return
    }

    router.replace(from)
  }

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-5">
          <Image src="/cacm_logo.png" alt="CACM Desa" width={44} height={44} />
          <div>
            <div className="text-lg font-semibold leading-tight">CACM Desa</div>
            <div className="text-xs text-slate-500">Login Siskeudes (Mobile)</div>
          </div>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <form onSubmit={onSubmit} className="space-y-3">
              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}
 

              <div className="space-y-1">
                <div className="text-xs text-slate-600">Nama User</div>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-600">Password</div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-600">Tahun</div>
                <Input
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  inputMode="numeric"
                  placeholder="2025"
                />
              </div>

              <Button type="submit" className="w-full rounded-xl" disabled={loading || !kd_pemda}>
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>

              <div className="text-[11px] text-slate-500">
                Session mobile tersimpan di <b>session.mobile</b>: <b>username, kd_desa, nama_desa, tahun</b>.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
