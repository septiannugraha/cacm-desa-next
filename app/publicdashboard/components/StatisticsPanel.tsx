'use client';

import { useEffect, useState } from 'react';
import type { RegionStatistics, MapLevel } from '@/types/map';
import PieChartDashboard from '@/components/charts/PieChartDashboard';
import BarChartDashboard from '@/components/charts/BarChartDashboard';
import { Building, TrendingUp, Award, CheckCircle, Loader2 } from 'lucide-react';

interface StatisticsPanelProps {
  level: MapLevel;
  code: string | null;
  regionName: string | null;
}

export default function StatisticsPanel({ level, code, regionName }: StatisticsPanelProps) {
  const [statistics, setStatistics] = useState<RegionStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setStatistics(null);
      return;
    }

    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/map/statistics/${level}/${code}`);
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Gagal memuat statistik');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [level, code]);

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000_000) {
      return `Rp ${(value / 1_000_000_000_000).toFixed(2)} T`;
    } else if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
    } else if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(2)} Jt`;
    } else {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
  };

  // Empty state
  if (!code || !regionName) {
    return (
      <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Pilih region di peta</p>
          <p className="text-sm text-gray-500 mt-1">
            Klik pada peta untuk melihat statistik keuangan
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Memuat statistik...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !statistics) {
    return (
      <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <p className="text-gray-600 font-medium">{error || 'Gagal memuat data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 z-10">
        <h2 className="text-xl font-bold">{statistics.name}</h2>
        <p className="text-sm text-blue-100 mt-1">
          {level === 'provinsi' && 'Provinsi'}
          {level === 'pemda' && 'Kabupaten/Kota'}
          {level === 'kecamatan' && 'Kecamatan'}
          {level === 'desa' && 'Desa'}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Desa */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Desa</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {statistics.stats.totalDesa.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Total Budget */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Total APBDes</span>
            </div>
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(statistics.stats.totalBudget)}
            </p>
          </div>

          {/* Avg Budget */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Rata-rata/Desa</span>
            </div>
            <p className="text-lg font-bold text-orange-900">
              {formatCurrency(statistics.stats.avgBudgetPerDesa)}
            </p>
          </div>

          {/* Audited */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Diaudit</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {statistics.stats.totalAudited}
              <span className="text-sm font-normal text-purple-700 ml-1">
                ({statistics.stats.auditPercentage.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>

        {/* Charts */}
        {statistics.chartData.budgetByType.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <PieChartDashboard
              data={statistics.chartData.budgetByType}
              title="Distribusi Anggaran"
              dataKey="Nilai1"
              nameKey="Kategori1"
              label="Anggaran"
              columnLabels={{
                Kategori1: 'Jenis',
                Nilai1: 'Anggaran',
                Nilai2: 'Realisasi'
              }}
            />
          </div>
        )}

        {statistics.chartData.topRegions.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <BarChartDashboard
              data={statistics.chartData.topRegions}
              title={`Top 5 ${level === 'provinsi' ? 'Kabupaten/Kota' : level === 'pemda' ? 'Kecamatan' : 'Desa'}`}
              xAxisKey="Kategori1"
              nilai1Label="Anggaran"
              nilai2Label="Realisasi"
            />
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Double-klik pada peta untuk melihat detail lebih lanjut di tingkat yang lebih rendah.
          </p>
        </div>
      </div>
    </div>
  );
}
