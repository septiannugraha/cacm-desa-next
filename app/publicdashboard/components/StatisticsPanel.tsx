'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MapLevel } from '@/types/map';
import PieChartDashboard from '@/components/charts/PieChartDashboard';
import BarChartDashboard from '@/components/charts/BarChartDashboard';
import LineChartDashboard from '@/components/charts/LineChartDashboard';
import { Building, TrendingUp, Award, CheckCircle, Loader2, Scale } from 'lucide-react';

interface StatisticsPanelProps {
  tahun: string;            // ✅ tahun untuk query API
  level: MapLevel;          // ✅ level untuk query API
  code: string | null;      // ✅ kode wilayah untuk query API
  regionName: string | null;
}

interface ApiResponse {
  belanja_perbidang: any[];
  belanja_persumberdana: any[];
  trend_belanja_bulanan: any[];
}

export default function StatisticsPanel({
  tahun,
  level,
  code,
  regionName,
}: StatisticsPanelProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dari API /api/statistic setiap kali tahun/level/kode berubah
  useEffect(() => {
    if (!tahun || !level || !code) {
      setData(null);
      return;
    }

    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/map/statistics?tahun=${encodeURIComponent(tahun)}&level=${encodeURIComponent(
            level
          )}&kode=${encodeURIComponent(code)}`
        );
        if (!res.ok) throw new Error('Gagal memuat statistik');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        console.error('StatisticsPanel fetch error:', e);
        setError(e?.message ?? 'Gagal memuat statistik');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [tahun, level, code]);

  // Normalisasi nilai numerik aman (number | string | bigint | Decimal)
  const toNumber = (v: any): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    try {
      return parseFloat(v.toString());
    } catch {
      return 0;
    }
  };

  // Transformasi data API ke struktur komponen chart
  const pieData = useMemo(() => {
    if (!data?.belanja_persumberdana) return [];
    // Asumsi kolom dari SP: Kategori / SumberDana, NilaiAnggaran, NilaiRealisasi
    return data.belanja_persumberdana.map((d: any) => ({
      Kategori1: d.Kategori1 ?? d.SumberDana ?? 'N/A',
      Nilai1: toNumber(d.Nilai1 ?? d.Nilai1),
      Nilai2: toNumber(d.Nilai2 ?? d.Nilai2),
    }));
  }, [data]);

  const barData = useMemo(() => {
    if (!data?.belanja_perbidang) return [];
    // Asumsi kolom dari SP: Bidang, Anggaran, Realisasi
    return data.belanja_perbidang.map((d: any) => ({
      Kategori1: d.Kategori1 ?? d.Kategori ?? 'N/A',
      Nilai1: toNumber(d.Nilai1),
      Nilai2: toNumber(d.Nilai2),
    }));
  }, [data]);

  const lineData = useMemo(() => {
    if (!data?.trend_belanja_bulanan) return [];
    // Asumsi kolom: Bulan (1-12 atau nama), Anggaran, Realisasi
    return data.trend_belanja_bulanan.map((d: any) => ({
      label: d.Bulan ?? d.bulan ?? 'N/A',
      series1: toNumber(d.Anggaran),
      series2: toNumber(d.Realisasi),
    }));
  }, [data]);

  // Agregat ringkas untuk kartu statistik
  const summary = useMemo(() => {
    const totalAnggaran =
      barData.reduce((acc: number, cur: any) => acc + (cur.Nilai1 || 0), 0) ||
      pieData.reduce((acc: number, cur: any) => acc + (cur.Nilai1 || 0), 0);

    const totalRealisasi =
      barData.reduce((acc: number, cur: any) => acc + (cur.Nilai2 || 0), 0) ||
      pieData.reduce((acc: number, cur: any) => acc + (cur.Nilai2 || 0), 0);

    const totalDesa = 0; // Jika ingin tampilkan, sambungkan dari API lain/prop
    const avgPerDesa = totalDesa > 0 ? totalAnggaran / totalDesa : 0;
    const audited = 0;
    const auditPct = 0;

    return {
      totalAnggaran,
      totalRealisasi,
      totalDesa,
      avgPerDesa,
      audited,
      auditPct,
    };
  }, [barData, pieData]);

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

  // Loading
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

  // Error
  if (error) {
    return (
      <div className="h-screen bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex items-center justify-center ">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <p className="text-gray-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full  bg-white rounded-lg shadow-lg border border-gray-200  ">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 z-10">
        <h2 className="text-xl font-bold">{regionName}</h2>
        <p className="text-sm text-blue-100 mt-1">
          {level === 'provinsi' && 'Provinsi'}
          {level === 'pemda' && 'Kabupaten/Kota'}
          {level === 'kecamatan' && 'Kecamatan'}
          {level === 'desa' && 'Desa'}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6  overflow-y-auto " >
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Desa</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {summary.totalDesa.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Total APBDes</span>
            </div>
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(summary.totalAnggaran)}
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Rata-rata/Desa</span>
            </div>
            <p className="text-lg font-bold text-orange-900">
              {formatCurrency(summary.avgPerDesa)}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Diaudit</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {summary.audited}
              <span className="text-sm font-normal text-purple-700 ml-1">
                ({summary.auditPct.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>


        <div className="grid grid-cols-1 gap-2 h-full">
  {/* Pie chart */}
  {pieData.length > 0 && (
    <div
      className="bg-gray-50 rounded-lg p-4"
      
    >
      <PieChartDashboard
        mini={true}
        data={pieData}
        title="Distribusi Anggaran per Sumber Dana"
        dataKey="Nilai1"
        nameKey="Kategori1"
        label="Anggaran"
        columnLabels={{
          Kategori1: 'Sumber Dana',
          Nilai1: 'Anggaran',
          Nilai2: 'Realisasi',
        }}
      />
    </div>
  )}

  {/* Bar chart */}
  {barData.length > 0 && (
    <div
      className="bg-gray-50 rounded-lg p-4"
      
    >
      <BarChartDashboard
        data={barData}
        mini={true}
        title="Belanja per Bidang"
        xAxisKey="Kategori1"
        nilai1Label="Anggaran"
        nilai2Label="Realisasi"
      />
    </div>
  )}
</div>
      </div> 
   </div>
  
  );
}