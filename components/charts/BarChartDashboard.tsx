'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import { FiEye } from 'react-icons/fi';

interface ChartData {
  Kategori1: string;
  Kategori2: string;
  Nilai1: number;
  Nilai2: number;
}

interface BarChartDashboardProps {
  data: ChartData[];
  title?: string;
  xAxisKey?: 'Kategori1' | 'Kategori2';
  nilai1Label?: string;
  nilai2Label?: string;
  nilai1Color?: string;
  nilai2Color?: string;
  mode?: 'normal' | 'stacked';
  mini?: boolean;
  columnLabels?: {
    Kategori1?: string;
    Kategori2?: string;
    Nilai1?: string;
    Nilai2?: string;
  };
}

export default function BarChartDashboard({
  data,
  title = 'Comparison Chart',
  xAxisKey = 'Kategori1',
  nilai1Label = 'Anggaran',
  nilai2Label = 'Realisasi',
  nilai1Color = '#3b82f6',
  nilai2Color = '#10b981',
  columnLabels = {Kategori1: 'Kategori', Nilai1: `${nilai1Label}` , Nilai2: `${nilai2Label}`},
  mode = 'normal',
  mini = false,
}: BarChartDashboardProps) {
  const [showTable, setShowTable] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}Rb`;
    return value.toString();
  };

  const showPersen = columnLabels.Nilai1 && columnLabels.Nilai2;


  

  const CATEGORY_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  ];
  
  const darken = (hex: string) =>
    hex.replace(/#(..)(..)(..)/, (_, r, g, b) => {
      const dark = (x: string) =>
        Math.max(0, parseInt(x, 16) - 40).toString(16).padStart(2, '0');
      return `#${dark(r)}${dark(g)}${dark(b)}`;
  });

  


  return (
    <div className="w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button  
          onClick={() => setShowTable(true)}
          className="flex items-center gap-2 px-3 py-1.5 border  text-blue-600 border-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
        >
          <FiEye size={16} />
          Lihat Data
        </button>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}
      
      >
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        stackOffset={mode === 'stacked' ? 'none' : undefined}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: '#6b7280', fontSize: 12, angle: -45, textAnchor: 'end', width: 150 }}
          tickLine={{ stroke: '#9ca3af' }}
          interval={0}
          tickFormatter={(value: string) => {
            const cleaned = value.replace('PEMERINTAH DESA ', '');
            const words = cleaned.split(' ');
          
            // Kapitalisasi awal setiap kata
            const capitalized = words.map(word =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            );
          
            // Batasi maksimal 3 baris
            const lines: string[] = [];
            for (let i = 0; i < capitalized.length; i++) {
              const lineIndex = Math.floor(i / Math.ceil(capitalized.length / 3));
              lines[lineIndex] = (lines[lineIndex] || '') + (lines[lineIndex] ? ' ' : '') + capitalized[i];
            }
          
            return lines.slice(0, 3).join('\n');
          }}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#9ca3af' }}
          tickFormatter={formatNumber}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '0.75rem',
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        
        {mode === 'normal' ? (
          <>
            <Bar dataKey="Nilai1" name={nilai1Label} fill={nilai1Color} radius={[8, 8, 0, 0]} />
            <Bar dataKey="Nilai2" name={nilai2Label} fill={nilai2Color} radius={[8, 8, 0, 0]} />
          </>
        ) : (
          <>
            <Bar dataKey="Nilai1" stackId="stack" name={nilai1Label} radius={[0, 0, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`n1-${index}`}
                  fill={darken(CATEGORY_COLORS[index % CATEGORY_COLORS.length])}
                />
              ))}
            </Bar>

            <Bar dataKey="Nilai2" stackId="stack" name={nilai2Label} radius={[20, 20, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`n2-${index}`}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
              ))}
            </Bar>
          </>
        )}
      </BarChart>
      </ResponsiveContainer>

      {/* Modal Table */}
      {showTable && (
        <div className="fixed top-0 left-64 right-0 bottom-0  inset-0 z-50 bg-transparent shadow  flex items-center justify-center">
          <div className="bg-gray-100 rounded-xl shadow-2xl max-w-4xl w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Tabel Data {title}
              </h4>
              <button
                onClick={() => setShowTable(false)}
                className="text-sm text-gray-600 hover:text-red-500"
              >
                Tutup ✕
              </button>
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
  <thead className="bg-gray-100">
    <tr>
      {columnLabels.Kategori1 && <th className="px-4 py-2 border">{columnLabels.Kategori1}</th>}
      {columnLabels.Kategori2 && <th className="px-4 py-2 border">{columnLabels.Kategori2}</th>}
      {columnLabels.Nilai1 && <th className="px-4 py-2 border">{columnLabels.Nilai1}</th>}
      {columnLabels.Nilai2 && <th className="px-4 py-2 border">{columnLabels.Nilai2}</th>}
      {showPersen && <th className="px-4 py-2 border">Persen</th>}
    </tr>
  </thead>

  <tbody>
    {data.map((item, i) => (
      <tr key={i} className="hover:bg-gray-50">
        {columnLabels.Kategori1 && <td className="px-4 py-2 border">{item.Kategori1}</td>}
        {columnLabels.Kategori2 && <td className="px-4 py-2 border">{item.Kategori2}</td>}
        {columnLabels.Nilai1 && (
          <td className="px-4 py-2 border text-right">{formatCurrency(item.Nilai1)}</td>
        )}
        {columnLabels.Nilai2 && (
          <td className="px-4 py-2 border text-right">{formatCurrency(item.Nilai2)}</td>
        )}
        {showPersen && (
          <td className="px-4 py-2 border text-center">
            {item.Nilai1 > 0 ? `${((item.Nilai2 / item.Nilai1) * 100).toFixed(1)}%` : '-'}
          </td>
        )}
      </tr>
    ))}
  </tbody>

  <tfoot className="bg-gray-100 font-semibold">
  <tr>
    {columnLabels.Kategori1 && (
      <td className="px-4 py-2 border text-right" colSpan={columnLabels.Kategori2 ? 2 : 1}>
        Jumlah
      </td>
    )}
    {columnLabels.Nilai1 && (
      <td className="px-4 py-2 border text-right">
        {formatCurrency(data.reduce((sum, item) => sum + item.Nilai1, 0))}
      </td>
    )}
    {columnLabels.Nilai2 && (
      <td className="px-4 py-2 border text-right">
        {formatCurrency(data.reduce((sum, item) => sum + item.Nilai2, 0))}
      </td>
    )}
    {showPersen && (
      <td className="px-4 py-2 border text-center">
        {(() => {
          const totalNilai1 = data.reduce((sum, item) => sum + item.Nilai1, 0);
          const totalNilai2 = data.reduce((sum, item) => sum + item.Nilai2, 0);
          return totalNilai1 > 0
            ? `${((totalNilai2 / totalNilai1) * 100).toFixed(1)}%`
            : '-';
        })()}
      </td>
    )}
  </tr>
</tfoot>
</table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}