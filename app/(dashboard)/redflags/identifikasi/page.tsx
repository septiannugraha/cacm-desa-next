'use client'


 
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function IdentifikasiPage() {
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [cutoffDate, setCutoffDate] = useState<string>('')

  const fetchData = async () => {
    const res = await axios.get('/api/identifikasi')
    setData(res.data.rows)
    setColumns(res.data.columns)
    setCutoffDate(res.data.cutoffDate)
  }
  
  const hiddenColumns = ['No_ID', 'Kd_Pemda', 'Tahun', 'Kecamatan'];
  const visibleColumns = columns.filter((col) => !hiddenColumns.includes(col));

  const handleCekRedflags = async () => {
    await axios.post('/api/identifikasi/cek')
    fetchData()
  }

  const handleArsipkan = async () => {
    await axios.post('/api/identifikasi/arsipkan')
    fetchData()
  }

  const groupByKecamatan = (rows: any[]) => {
    const grouped: Record<string, any[]> = {};
    for (const row of rows) {
      const kecamatan = row['Kecamatan'] || 'Tanpa Kecamatan';
      if (!grouped[kecamatan]) grouped[kecamatan] = [];
      grouped[kecamatan].push(row);
    }
    return grouped;
  };

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="p-6 space-y-4">

       <div className="p-6 space-y-4">
  {/* Header */}
  <div>
    <h2 className="text-xl font-semibold">Identifikasi Redflags</h2>
  </div>

  {/* Toolbar: DatePicker + Tombol */}
  <div className="flex flex-wrap items-center justify-between gap-4">
    {/* DatePicker */}
    <div className="flex items-center space-x-2">
      <label htmlFor="cutoffDate" className="text-sm font-medium text-gray-700">
        Tanggal Cut Off:
      </label>
      <input
        type="date"
        id="cutoffDate"
        value={cutoffDate}
        onChange={(e) => setCutoffDate(e.target.value)}
        className="px-3 py-2 border rounded text-sm text-gray-800"
      />
    </div>

    {/* Tombol Aksi */}
    <div className="space-x-2">
      <button
        onClick={handleCekRedflags}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Cek Redflags
      </button>
      <button
        onClick={handleArsipkan}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Arsipkan Redflags
      </button>
    </div>
  </div>

  {/* Cutoff Info */}
  <div>
    <p className="text-sm text-gray-600">{cutoffDate || '-'}</p>
  </div>
</div>





      <div className="overflow-auto border rounded">
      <table className="min-w-full table-auto">
  <thead className="bg-gray-100">
    <tr>
      {visibleColumns.map((col) => (
        <th key={col} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
          {col}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
  {Object.entries(groupByKecamatan(data)).map(([kecamatan, desaList], groupIdx) => (
    <>
  {/* Baris header Kecamatan */}
  <tr className="bg-blue-50">
    <td colSpan={visibleColumns.length} className="px-4 py-2 font-semibold text-blue-800">
      Kecamatan: {kecamatan}
    </td>
  </tr>

  {/* Baris data desa */}
  {desaList.map((row, idx) => (
    <tr key={idx} className="border-t">
      {visibleColumns.map((col) => (
        <td key={col} className="px-4 py-2 text-sm text-gray-800">
          {row[col] ?? '-'}
        </td>
      ))}
    </tr>
  ))}
</>

  ))}
</tbody>
</table>
        
      </div>
    </div>
  )
}