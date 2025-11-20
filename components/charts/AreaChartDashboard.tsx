'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ChartData {
  Kategori1: string
  Kategori2?: string
  Nilai1: number
  Nilai2?: number
  Nilai3?: number
}

interface AreaChartDashboardProps {
  data: ChartData[]
  title?: string
  xAxisKey?: 'Kategori1' | 'Kategori2'
  nilai1Label?: string
  nilai2Label?: string
  nilai1Color?: string
  nilai2Color?: string
  stacked?: boolean
}

export default function AreaChartDashboard({
  data,
  title = 'Cumulative Chart',
  xAxisKey = 'Kategori1',
  nilai1Label = 'Anggaran',
  nilai2Label = 'Realisasi',
  nilai1Color = '#3b82f6',
  nilai2Color = '#10b981',
  stacked = false,
}: AreaChartDashboardProps) {
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
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
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
            wrapperStyle={{
              paddingTop: '1rem',
            }}
          />
          <defs>
            <linearGradient id="colorNilai1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={nilai1Color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={nilai1Color} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorNilai2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={nilai2Color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={nilai2Color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="Nilai1"
            name={nilai1Label}
            stroke={nilai1Color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorNilai1)"
            stackId={stacked ? '1' : undefined}
          />
          <Area
            type="monotone"
            dataKey="Nilai2"
            name={nilai2Label}
            stroke={nilai2Color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorNilai2)"
            stackId={stacked ? '1' : undefined}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
