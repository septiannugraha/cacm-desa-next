'use client';

import { Edit, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import LoadingButton from '@/components/ui/loadingbutton';

export interface KoneksiDB {
  id: string;
  Kd_Pemda?: string;
  Nama_Koneksi: string;
  Jenis_Koneksi: string;
  Server?: string;
  UID?: string;
  Pwd?: string;
  DB?: string;
  Mode?: string;
  ConStat?: boolean;
  create_at?: Date;
  create_by?: string;
  update_at?: Date;
  update_by?: string;
}

export default function DBKoneksiPage() {
  const router = useRouter();
  const [koneksi, setKoneksi] = useState<KoneksiDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKoneksi = useCallback(async () => {
    try {
      const response = await fetch('/api/dbkoneksi');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Jika API mengembalikan array langsung
      const koneksiList = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      setKoneksi(koneksiList);

      console.log('✅ Koneksi diset:', koneksiList);
      setError(null);
    } catch (err) {
      console.error('❌ Gagal mengambil koneksi:', err);
      setKoneksi([]);
      setError('Gagal mengambil data koneksi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKoneksi();
  }, [fetchKoneksi]);

  const handleDeleteById = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus koneksi ini?')) return;
    try {
      const response = await fetch(`/api/dbkoneksi/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchKoneksi();
      } else {
        const err = await response.text();
        alert(`❌ Gagal menghapus koneksi: ${err}`);
      }
    } catch (error) {
      console.error('❌ Gagal menghapus koneksi:', error);
      alert('Terjadi kesalahan saat menghapus koneksi.');
    }
  };

  const [testingId, setTestingId] = useState<string | null>(null);
 
  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const response = await fetch(`/api/dbkoneksi/test/${id}`);
      const result = await response.json();
      alert(response.ok
        ? `✅ Koneksi berhasil: ${result.message}`
        : `❌ Koneksi gagal: ${result.error || 'Tidak diketahui'}`
      );
    } catch (error) {
      console.error('❌ Gagal uji koneksi:', error);
      alert('Terjadi kesalahan saat uji koneksi.');
    } finally {
      setTestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Koneksi</h1>
          <p className="text-gray-600 mt-1">Kelola koneksi database</p>
        </div>
        <button
          onClick={() => router.push('/dbkoneksi/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          aria-label="Tambah koneksi baru"
        >
          <Plus className="w-5 h-5" />
          Tambah Koneksi
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Nama Koneksi', 'Jenis', 'Server', 'Database', 'Mode', 'Status', 'Aksi'].map((th) => (
                  <th
                    key={th}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {koneksi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data koneksi.
                  </td>
                </tr>
              ) : (
                koneksi.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.Nama_Koneksi}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.Jenis_Koneksi}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.Server ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.DB ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.Mode ?? '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.ConStat ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.ConStat ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium flex items-center gap-3 justify-end">
                      <button
                        onClick={() => router.push(`/dbkoneksi/${item.id}`)}
                        title="Edit koneksi"
                        aria-label={`Edit koneksi ${item.Nama_Koneksi}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteById(item.id)}
                        title="Hapus koneksi"
                        aria-label={`Hapus koneksi ${item.Nama_Koneksi}`}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                      <LoadingButton
  onClick={() => handleTestConnection(item.id)}
  loading={testingId === item.id}
  className={`text-sm font-semibold ${
    testingId === item.id
      ? 'text-green-400 cursor-not-allowed'
      : 'text-green-600 hover:text-green-900'
  }`}
  title="Uji koneksi"
  aria-label={`Uji koneksi ${item.Nama_Koneksi}`}
>
  {testingId === item.id ? 'Menguji...' : 'Tes Koneksi'}
</LoadingButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}