import { Bell } from 'lucide-react';

export default function AtensiPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atensi</h1>
          <p className="text-gray-600 mt-1">Daftar atensi yang perlu ditindaklanjuti</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          Halaman Atensi - Fitur dalam pengembangan
        </p>
      </div>
    </div>
  );
}
