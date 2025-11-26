import { MessageSquare } from 'lucide-react';

export default function ResponPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Respon</h1>
          <p className="text-gray-600 mt-1">Kelola respon terhadap atensi</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          Halaman Respon - Fitur dalam pengembangan
        </p>
      </div>
    </div>
  );
}
