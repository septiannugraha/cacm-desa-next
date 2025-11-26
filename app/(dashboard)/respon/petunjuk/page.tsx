import { HelpCircle } from 'lucide-react';

export default function PetunjukPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Petunjuk</h1>
          <p className="text-gray-600 mt-1">Panduan penggunaan sistem respon</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cara Menggunakan Menu Respon</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. Atensi</h4>
              <p className="text-gray-600">Halaman ini menampilkan daftar atensi yang perlu ditindaklanjuti. Anda dapat melihat detail atensi dan memberikan respon.</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. Respon</h4>
              <p className="text-gray-600">Halaman untuk mengelola respon yang telah Anda berikan terhadap atensi. Anda dapat mengedit atau menghapus respon.</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. Selesai</h4>
              <p className="text-gray-600">Halaman ini menampilkan daftar atensi yang telah diselesaikan dan ditutup.</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">4. Petunjuk</h4>
              <p className="text-gray-600">Halaman panduan penggunaan sistem (halaman ini).</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tips:</strong> Gunakan menu navigasi di bagian bawah layar untuk berpindah antar halaman dengan mudah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
