'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn, Smartphone } from 'lucide-react';
import Image from 'next/image';

export default function SiskeudesLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    serverAddress: '',
    databaseName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // This will be connected to Siskeudes authentication by Dian
      // For now, just show a placeholder message
      alert('Siskeudes login akan diintegrasikan oleh Dian. Fitur ini sedang dalam pengembangan.');

      // TODO: Connect to actual Siskeudes authentication API
      // const result = await signIn('siskeudes-credentials', {
      //   redirect: false,
      //   username: formData.username,
      //   password: formData.password,
      //   serverAddress: formData.serverAddress,
      //   databaseName: formData.databaseName,
      // });

      // if (result?.error) {
      //   setError('Login gagal. Periksa kembali kredensial Anda.');
      // } else {
      //   router.push('/respon/atensi');
      // }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm py-4 px-4 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Smartphone className="w-8 h-8 text-white" />
          <h1 className="text-white text-xl font-bold">CACM Desa Mobile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 p-3">
                <Image
                  src="/cacm_logo.png"
                  alt="CACM Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Login Siskeudes
              </h2>
              <p className="text-gray-600 text-center mt-2 text-sm">
                Masuk dengan kredensial Siskeudes Anda
              </p>
            </div>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Server Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Server
                </label>
                <input
                  type="text"
                  required
                  value={formData.serverAddress}
                  onChange={(e) => setFormData({ ...formData, serverAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="192.168.1.100:1433"
                />
              </div>

              {/* Database Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Database
                </label>
                <input
                  type="text"
                  required
                  value={formData.databaseName}
                  onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Siskeudes_2024"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="username"
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Masuk
                  </>
                )}
              </button>

              {/* Info Text */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  Login menggunakan kredensial Siskeudes yang sama dengan aplikasi desktop Anda
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-white text-sm opacity-90">
              CACM Desa Mobile v1.0
            </p>
            <p className="text-white text-xs opacity-75 mt-1">
              &copy; 2024 Continuous Audit & Monitoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
