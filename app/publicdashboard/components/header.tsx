'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full bg-blue-900 text-white flex items-center justify-between px-6 py-4 shadow">
      <div className="flex items-center gap-4">
        <Image src="/cacm_logo.png" alt="CACM Logo" width={40} height={40} />
        <h1 className="text-lg font-semibold">CACM Pengelolaan Keuangan Desa</h1>
      </div>
      <Link
        href="/login"
        className="bg-white text-blue-900 px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        Masuk untuk Akses Lengkap
      </Link>
    </header>
  );
}