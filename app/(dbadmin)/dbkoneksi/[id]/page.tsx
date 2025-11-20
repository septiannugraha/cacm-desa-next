'use client';

import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingButton from '@/components/ui/loadingbutton';

export interface KoneksiForm {
  id?: string;
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

export default function EditDBKoneksiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<KoneksiForm>({
    Nama_Koneksi: '',
    Jenis_Koneksi: '',
    Server: '',
    UID: '',
    Pwd: '',
    DB: '',
    Mode: 'SQL',
    ConStat: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // 🔹 Ambil data jika sedang edit
  useEffect(() => {
    if (id && id !== 'create') {
      fetchKoneksi();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchKoneksi = async () => {
    try {
      const res = await fetch(`/api/dbkoneksi/${id}`);
      if (!res.ok) throw new Error('Gagal memuat koneksi');
      const data = await res.json();

      // 🔹 Pastikan hasil GET sudah didekripsi di backend
      setFormData({
        id: data.id,
        Nama_Koneksi: data.Nama_Koneksi || '',
        Jenis_Koneksi: data.Jenis_Koneksi || '',
        Server: data.Server || '',
        UID: data.UID || '',
        Pwd: data.Pwd || '',
        DB: data.DB || '',
        Mode: data.Mode || 'SQL',
        ConStat: data.ConStat || false,
      });
    } catch (err) {
      console.error('Error fetch koneksi:', err);
      alert('Gagal memuat data koneksi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = id === 'create' ? '/api/dbkoneksi' : `/api/dbkoneksi/${id}`;
      const method = id === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan koneksi');
      }

      alert('✅ Data koneksi berhasil disimpan');
      router.push('/dbkoneksi');
    } catch (err) {
      console.error(err);
      alert('❌ Gagal menyimpan koneksi');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.id || id === 'create') {
      alert('Simpan koneksi terlebih dahulu sebelum menguji.');
      return;
    }

    setTesting(true);
    try {
      const res = await fetch(`/api/dbkoneksi/test/${formData.id}`);
      const result = await res.json();

      if (res.ok) alert(`✅ Koneksi berhasil: ${result.message}`);
      else alert(`❌ Gagal: ${result.error}`);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat uji koneksi.');
    } finally {
      setTesting(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id === 'create' ? 'Tambah' : 'Edit'} Koneksi
          </h1>
          <p className="text-gray-600 mt-1">
            {id === 'create' ? 'Tambahkan koneksi baru' : 'Perbarui koneksi database'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Nama Koneksi" value={formData.Nama_Koneksi} onChange={(v) => setFormData({ ...formData, Nama_Koneksi: v })} />
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Koneksi</label>
  <select
    value={formData.Jenis_Koneksi || 'Siskeudes'}
    onChange={(e) => setFormData({ ...formData, Jenis_Koneksi: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    required
  >
    <option value="Siskeudes">Siskeudes</option>
    <option value="Sipades">Sipades</option>
  </select>
</div>

          <Input label="Server" value={formData.Server ?? ''} onChange={(v) => setFormData({ ...formData, Server: v })} />
          <Input label="Database" value={formData.DB ?? ''} onChange={(v) => setFormData({ ...formData, DB: v })} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
            <select
              value={formData.Mode ?? ''}
              onChange={(e) => setFormData({ ...formData, Mode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Mode</option>
              <option value="Windows">Windows</option>
              <option value="SQL">SQL</option>
            </select>
          </div>

          <Input label="User ID" value={formData.UID ?? ''} onChange={(v) => setFormData({ ...formData, UID: v })} />
          <Input label="Password" type="password" value={formData.Pwd ?? ''} onChange={(v) => setFormData({ ...formData, Pwd: v })} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Koneksi</label>
            <div
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                formData.ConStat ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {formData.ConStat ? 'Aktif' : 'Tidak Aktif'}
            </div>
          </div>

          {/* Tombol */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <LoadingButton
  onClick={handleTestConnection}
  loading={testing}
  className={`flex items-center gap-2 px-6 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50`}
  title="Uji koneksi"
  aria-label={`Uji koneksi ${formData.Nama_Koneksi}`}
>
  {testing ? (
    <>
      <svg className="animate-spin h-4 w-4 text-green-600" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
        />
      </svg>
      Menguji...
    </>
  ) : (
    <>
      <ShieldCheck className="w-4 h-4" />
      Tes Koneksi
    </>
  )}
</LoadingButton>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 🔸 Komponen Input Reusable
function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  );
 
}
