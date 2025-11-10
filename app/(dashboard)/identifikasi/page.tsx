'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { log } from 'console'

export default function IdentifikasiPage() {
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [cutoffInfo, setCutoffInfo] = useState<string>('')

  const fetchData = async () => {
    const res = await axios.get('/api/identifikasi')
    setData(res.data.rows)
    setColumns(res.data.columns)
    setCutoffInfo(res.data.cutoffInfo)
  }

  const handleCekRedflags = async () => {
    await axios.post('/api/identifikasi/cek')
    fetchData()
  }
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // hasil: '2025-11-04'
    
  };


  const [cutoffDate, setCutoffDate] = useState<string>(getTodayString());

  const handleArsipkan = async () => {
    await axios.post('/api/identifikasi/arsipkan')
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
  
     
     
     <div className="space-y-2">
  {/* Baris horizontal: Judul + DatePicker + Tombol */}
  <div className="flex flex-wrap items-center justify-between gap-4">
    {/* Judul */}
    <h2 className="text-xl font-semibold">Identifikasi Redflags</h2>

    {/* DatePicker */}
    <div className="flex items-center space-x-2">
      <label htmlFor="cutoffDate" className="text-sm font-medium text-gray-700">
       Cut Off:
      </label>
      <input
        type="date"
        id="cutoffDate"
        value={cutoffDate}
        onChange={(e) => setCutoffDate(e.target.value)}
        className="px-3 py-2 border rounded text-sm text-gray-800"
      />
    </div>

    {/* Tombol */}
    <div className="flex items-center space-x-2">
      <button
        onClick={handleCekRedflags}
        className="flex items-center px-4 py-2 bg-yellow-400 text-gray-900 rounded hover:bg-yellow-500"
      >
        <span className="mr-2">🔄</span> Cek Redflags
      </button>
      <button
        onClick={handleArsipkan}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <span className="mr-2">📨</span> Arsipkan
      </button>
    </div>
  </div>

  {/* Cutoff Info */}
  <p className="text-sm text-gray-600">{cutoffInfo || '-'}</p>
 

      <div className="overflow-auto border rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-sm text-gray-800">
                    {row[col] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}