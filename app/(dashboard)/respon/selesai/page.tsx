import { CheckCircle } from 'lucide-react';

export default function SelesaiPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-8 h-8 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selesai</h1>
          <p className="text-gray-600 mt-1">Daftar atensi yang telah diselesaikan</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          Halaman Selesai - Fitur dalam pengembangan
        </p>
      </div>
    </div>
  );
}
