"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Loader2, Lock, User } from "lucide-react"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from 'framer-motion'


// ✅ Skema validasi dengan fiscalYear sebagai number
const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
  fiscalYear: z.number().int().min(2020, "Tahun minimal 2020").max(2030, "Tahun maksimal 2030"),
})

type LoginFormData = z.infer<typeof loginSchema>
const formContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12
    }
  }
}

const fieldVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut"
    }
  }
}
export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const currentYear = new Date().getFullYear()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      fiscalYear: currentYear, // ✅ default number
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        fiscalYear: data.fiscalYear, // sudah number
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <motion.div
          initial={{
            opacity: 0,
            y: 80,
            scale: 0.92,
            boxShadow: "0px 0px 0px rgba(0,0,0,0)"
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            boxShadow: "0px 25px 60px rgba(0,0,0,0.12)"
          }}
          transition={{
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="rounded-2xl"
        >
        <motion.div variants={fieldVariants} className="bg-white/80 backdrop-blur-sm rounded-t-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto w-40 h-10 bg-white rounded-full flex items-center justify-center mb-4">
              <Image
                src="/cacm_logo.png"
                alt="CACM Logo"
                width={120}
                height={80}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Continuous Audit Continuous Monitoring
            </h1>
            <p className="text-lg text-gray-700">Pengelolaan Keuangan Desa</p>
          </div>
        </motion.div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-b-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            variants={formContainerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Username */}
            <motion.div variants={fieldVariants}>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  {...register("username")}
                  type="text"
                  id="username"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Masukkan username"
                  disabled={isLoading}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={fieldVariants}>
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
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </motion.div>

            {/* Fiscal Year */}
            <motion.div variants={fieldVariants}>
              <label htmlFor="fiscalYear" className="block text-sm font-medium text-gray-700 mb-1">
                Tahun Anggaran
              </label>
              <div className="relative">
                <select
                  {...register("fiscalYear", { valueAsNumber: true })} // ✅ valueAsNumber
                  id="fiscalYear"
                  disabled={isLoading}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                >
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = 2020 + i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.fiscalYear && (
                <p className="mt-1 text-sm text-red-600">{errors.fiscalYear.message}</p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div variants={fieldVariants} className="flex items-center justify-between pt-4">
              <Link
                href="/register"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Register
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </motion.div>
          </motion.form>
        
        </div>
        </motion.div> 
      </div>
    </div>

  )
}