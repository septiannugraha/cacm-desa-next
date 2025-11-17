'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ChartData {
  Kategori1: string
  Kategori2: string
  Nilai1: number
  Nilai2: number
}

interface PieChartDashboardProps {
  data: ChartData[]
  title?: string
  dataKey?: 'Nilai1' | 'Nilai2'
  nameKey?: 'Kategori1' | 'Kategori2'
  label?: string
  colors?: string[]
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

export default function PieChartDashboard({
  data,
  title = 'Distribution Chart',
  dataKey = 'Nilai1',
  nameKey = 'Kategori1',
  label = 'Anggaran',
  colors = DEFAULT_COLORS,
}: PieChartDashboardProps) {
  // Format currency for Indonesia
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Prepare data for pie chart
  const pieData = data.map((item) => ({
    name: item[nameKey],
    value: item[dataKey],
  }))

  // Calculate percentage
  const total = pieData.reduce((sum, item) => sum + item.value, 0)

  // Custom label renderer
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
  }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Hide label if less than 5%

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
    )
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
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
  layout="vertical" // atau "horizontal" tergantung kebutuhan
  align="center" // bisa juga "left", "center"
  verticalAlign="bottom" // bisa juga "top", "bottom"
  wrapperStyle={{
    fontSize: '12px', // mengecilkan ukuran teks
    marginRight: '10px', // jarak dari pie chart
    lineHeight: '1.2',
  }}
  formatter={(value, entry: any) => {
    const percentage = ((entry.payload.value / total) * 100).toFixed(1)
    return `${value} (${percentage}%)`
  }}
/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
