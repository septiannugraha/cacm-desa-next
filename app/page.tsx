'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Map,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  Users, Bell,
  UserCog,
  Building2,
  Settings
} from 'lucide-react'

const PEMDA_NAME =
  process.env.NEXT_PUBLIC_PEMDA_NAME || 'Nama Pemerintah Daerah'

const modules = [
  {
    title: 'Integrated Maps',
    icon: Map,
    href: '/integrated-maps',
    color: 'text-blue-600',
    accent: 'bg-blue-600',
  },
  {
    title: 'Dashboard Monitoring',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-indigo-600',
    accent: 'bg-indigo-600',
  },
  {
    title: 'Compliance Monitoring',
    icon: ShieldCheck,
    href: '/compliance-monitoring',
    color: 'text-emerald-600',
    accent: 'bg-emerald-600',
  },
  {
    title: 'Early Warning System',
    icon: AlertTriangle,
    href: '/redflags/atensi',
    color: 'text-red-600',
    accent: 'bg-red-600',
  },
  {
    title: 'BPD Monitoring',
    icon: Users,
    href: '/bpd-monitoring',
    color: 'text-purple-600',
    accent: 'bg-purple-600',
  },
  {
    title: 'Internal Auditor Monitoring',
    icon: UserCog,
    href: '/internal-auditor-monitoring',
    color: 'text-teal-600',
    accent: 'bg-teal-600',
  },
  {
    title: 'Response Desa',
    icon: Bell,
    href: '/mobile/login-desa',
    color: 'text-amber-600',
    accent: 'bg-amber-600',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/admin/pemda',
    color: 'text-gray-700',
    accent: 'bg-gray-700',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= TOPBAR ================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* LEFT: Logo Pemda + Nama */}
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Logo Pemda"
              width={42}
              height={42}
            />
            <h1 className="text-lg font-semibold text-gray-900 tracking-wide">
              {PEMDA_NAME}
            </h1>
          </div>

          {/* RIGHT: Logo CACM */}
          <Image
            src="/cacm_logo.png"
            alt="CACM"
            width={38}
            height={38}
          />
        </div>
      </header>

      {/* ================= COMMAND CENTER ================= */}
      <main className="max-w-7xl mx-auto px-6 py-14">

        {/* JUDUL BARU */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-gray-900 tracking-wide">
            Continuous Audit Continuous Monitoring
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ruang Kendali Monitoring dan Pengawasan Terintegrasi
          </p>
        </motion.div>

        {/* GRID 4 KOLOM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {modules.map((module, i) => {
            const Icon = module.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* AKSEN WARNA ATAS */}
                <div className={`h-2 ${module.accent}`} />

                <Link href={module.href} className="block text-center p-6">

                  <div className="flex flex-col items-center gap-4">

                    <Icon size={32} className={module.color} />

                    <h3 className={`text-sm font-semibold ${module.color}`}>
                      {module.title}
                    </h3>

                  </div>

                </Link>
              </motion.div>
            )
          })}

        </div>

      </main>
    </div>
  )
}