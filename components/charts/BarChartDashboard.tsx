'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ChartData {
  Kategori1: string
  Kategori2: string
  Nilai1: number
  Nilai2: number
}

interface BarChartDashboardProps {
  data: ChartData[]
  title?: string
  xAxisKey?: 'Kategori1' | 'Kategori2'
  nilai1Label?: string
  nilai2Label?: string
  nilai1Color?: string
  nilai2Color?: string
}

export default function BarChartDashboard({
  data,
  title = 'Comparison Chart',
  xAxisKey = 'Kategori1',
  nilai1Label = 'Anggaran',
  nilai2Label = 'Realisasi',
  nilai1Color = '#3b82f6',
  nilai2Color = '#10b981',
}: BarChartDashboardProps) {
  // Format currency for Indonesia
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format large numbers
  const formatNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}M`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}Jt`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}Rb`
    }
    return value.toString()
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 65,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{
              fill: '#6b7280',
              fontSize: 12,
              angle: -45,
              textAnchor: 'end',
            }}
            tickLine={{ stroke: '#9ca3af' }}
            interval={0}
            tickFormatter={(value: string) => value.replace('PEMERINTAH DESA ', '')}
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
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{
                paddingTop: '1rem',
              }}
            />
          <Bar dataKey="Nilai1" name={nilai1Label} fill={nilai1Color} radius={[8, 8, 0, 0]} />
          <Bar dataKey="Nilai2" name={nilai2Label} fill={nilai2Color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
