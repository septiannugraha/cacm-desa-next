'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useState } from 'react';
import { FiEye } from 'react-icons/fi';

interface ChartData {
  Kategori1: string;
  Kategori2: string;
  Nilai1: number;
  Nilai2: number;
}

interface PieChartDashboardProps {
  data: ChartData[];
  title?: string;
  dataKey?: 'Nilai1' | 'Nilai2';
  nameKey?: 'Kategori1' | 'Kategori2';
  label?: string;
  colors?: string[];
  mini?: boolean
  columnLabels?: {
    Kategori1?: string;
    Kategori2?: string;
    Nilai1?: string;
    Nilai2?: string;
  };
}

const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export default function PieChartDashboard({
  data,
  title = 'Distribution Chart',
  dataKey = 'Nilai1',
  nameKey = 'Kategori1',
  label = 'Anggaran',
  colors = DEFAULT_COLORS,
  columnLabels = {Kategori1: 'Kategori', Nilai1: `${label}`},
  mini=false,
}: PieChartDashboardProps) {
  const [showTable, setShowTable] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const pieData = data.map((item) => ({
    name: item[nameKey],
    value: item[dataKey],
  }));

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const showPersen =
    columnLabels.Nilai1 && columnLabels.Nilai2;

  return (
    <div className="w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={() => setShowTable(true)}
          className="flex items-center gap-2 px-3 py-1.5 border  text-blue-600 border-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
        >
          <FiEye />
          Lihat Data
        </button>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%"  height={400}
      style={mini ? { transform: 'scale(0.75)', transformOrigin: 'top left' } : {}}

      >
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              `${name} (${((value / total) * 100).toFixed(1)}%)`,
            ]}
          />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{
              fontSize: '12px',
              marginRight: '10px',
              lineHeight: '1.2',
            }}
            formatter={(value: string, entry: any) => {
              const percentage = ((entry.payload.value / total) * 100).toFixed(1);
            
              // Format proper: kapitalisasi awal setiap kata
              const properLabel = value
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            
              return `${properLabel} (${percentage}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Modal Table */}
      {showTable && (
        <div className="fixed top-0 left-64 right-0 bottom-0  inset-0  z-50 bg-transparent bg-opacity-30 flex items-center justify-center">
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