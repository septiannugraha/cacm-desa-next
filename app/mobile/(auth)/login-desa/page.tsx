"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Loader2, Lock, User } from "lucide-react"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

function isYear4(y: string) {
  return /^\d{4}$/.test(y.trim())
}

function safeFrom(raw: string | null, fallback = "/mobile/atensidesa") {
  if (!raw) return fallback
  let v = raw.trim()
  try {
    v = decodeURIComponent(v)
  } catch {}
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v)
      v = u.pathname + (u.search || "")
    } catch {
      return fallback
    }
  }
  if (!v.startsWith("/")) v = "/" + v
  if (!v.startsWith("/mobile/")) return fallback
  v = v.replace(/^\/mobile\/mobile\//, "/mobile/")
  return v
}

const loginSchema = z.object({
  username: z.string().min(1, "Nama User wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
  tahun: z
    .string()
    .min(1, "Tahun wajib diisi.")
    .refine((v) => isYear4(v), { message: "Tahun harus 4 digit (mis. 2025)." }),
})

type LoginFormData = z.infer<typeof loginSchema>

// ✅ Bungkus komponen yang pakai useSearchParams dengan Suspense
export default function MobileLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
function SubmitLabel() {
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const onStart = () => setSubmitting(true)
    const onEnd = () => setSubmitting(false)

    document.addEventListener("submit", onStart, true)
    window.addEventListener("focus", onEnd)

    return () => {
      document.removeEventListener("submit", onStart, true)
      window.removeEventListener("focus", onEnd)
    }
  }, [])

  return submitting ? (
    <>
      <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    "Login"
  )
}


function LoginForm() {
  const router = useRouter()
  const sp = useSearchParams()

  const defaultYear = useMemo(() => new Date().getFullYear().toString(), [])
  const tahunFromQS = (sp.get("tahun") || "").trim()
  const from = useMemo(() => safeFrom(sp.get("from"), "/mobile/atensidesa"), [sp])

  const pemdaFromEnv = (process.env.NEXT_PUBLIC_PEMDA_CODE || "").trim()
  const [kd_pemda, setKdPemda] = useState(pemdaFromEnv)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tahun: tahunFromQS || defaultYear,
      username: "",
      password: "",
    },
  })

  useEffect(() => {
    setValue("tahun", tahunFromQS || defaultYear)
  }, [tahunFromQS, defaultYear, setValue])

  useEffect(() => {
    setKdPemda(pemdaFromEnv)
  }, [pemdaFromEnv])

  const onSubmit = async (data: LoginFormData) => {
    setError("")
    const kp = kd_pemda.trim()
    const u = data.username.trim()
    const p = data.password.trim()
    const y = data.tahun.trim()

    if (!kp) {
      setError("Kode Pemda belum diset di ENV. Set NEXT_PUBLIC_PEMDA_CODE lalu restart.")
      return
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username: u,
        password: p,
        tahun: y,
        kd_pemda: kp,
      })

      if (!result?.ok) {
        setError(result?.error || "Login gagal.")
        return
      }

      router.refresh()
      router.replace(from)
    } catch (e) {
      console.error("Login error:", e)
      setError("Terjadi kesalahan saat login")
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="bg-white/80 backdrop-blur-sm rounded-t-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto w-40 h-10 bg-white rounded-full flex items-center justify-center mb-4">
              <Image
                src="/cacm_logo.png"
                alt="CACM Logo"
                width={120}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">CACM Desa - Siskeudes</h1>
            <p className="text-lg text-gray-700">Silakan Login dengan akun Siskeudes Anda!</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-b-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nama User
              </label>
              <div className="relative">
                <input
                  {...register("username")}
                  type="text"
                  id="username"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Masukkan nama user"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type="password"
                  id="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Masukkan password"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Tahun */}
            <div>
              <label htmlFor="tahun" className="block text-sm font-medium text-gray-700 mb-1">
                Tahun Anggaran
              </label>
              <div className="relative">
                <select
                  {...register("tahun")}
                  id="tahun"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-900"
                >
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = 2020 + i
                    return (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    )
                  })}
                </select>
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.tahun && <p className="mt-1 text-sm text-red-600">{errors.tahun.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end pt-4">
              <button
                type="submit"
                disabled={!kd_pemda}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SubmitLabel />
              </button>
            </div>

            {!kd_pemda && (
              <p className="text-sm text-red-600">
                Kode Pemda belum diset. Isi <b>NEXT_PUBLIC_PEMDA_CODE</b> di .env lalu restart.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
