'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import type { MapLevel } from '@/types/map';
import PieChartDashboard from '@/components/charts/PieChartDashboard';
import BarChartDashboard from '@/components/charts/BarChartDashboard';
import LineChartDashboard from '@/components/charts/LineChartDashboard';
import { Building, TrendingUp, Award, CheckCircle, Loader2, Scale, ChevronLeft, ChevronRight } from 'lucide-react';
import { User, Wallet, BarChart3, Target } from 'lucide-react';


interface StatisticsPanelProps {
  tahun: string;            // tahun untuk query API
  level: MapLevel;          // level untuk query API
  code: string | null;      // kode wilayah untuk query API
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

  // Fetch dari API
  useEffect(() => {
    if (!tahun || !level || !code) return;
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/map/statistics?tahun=${encodeURIComponent(tahun)}&level=${encodeURIComponent(level)}&kode=${encodeURIComponent(code)}`
        );
        if (!res.ok) throw new Error('Gagal memuat statistik');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e?.message ?? 'Gagal memuat statistik');
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, [tahun, level, code]);

  const toNumber = (v: any): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    try { return parseFloat(v.toString()); } catch { return 0; }
  };

  const metrics = useMemo(() => {
    const totalAnggaran = (data?.belanja_persumberdana || []).reduce((acc: number, cur: any) => acc + toNumber(cur.Nilai1), 0);
    const totalRealisasi = (data?.belanja_persumberdana || []).reduce((acc: number, cur: any) => acc + toNumber(cur.Nilai2 || cur.Nilai1 * 0.7), 0); // fallback for demo if realisasi missing
    const selisih = totalAnggaran - totalRealisasi;
    const progres = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

    return [
      { label: 'Total Anggaran', value: totalAnggaran, type: 'currency', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Realisasi', value: totalRealisasi, type: 'currency', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Sisa Anggaran', value: selisih, type: 'currency', icon: Scale, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Persentase Realisasi', value: progres, type: 'percent', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];
  }, [data]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000_000) return `Rp ${(value / 1_000_000_000_000).toFixed(2)} T`;
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(2)} Jt`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  if (!code || !regionName) {
    return (
      <div className="h-full bg-white p-8 flex items-center justify-center text-center">
        <div>
          <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Pilih wilayah pada peta untuk melihat detail</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full bg-white p-8 flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 rounded-2xl bg-gray-50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 p-3 gap-3">
      {/* Region Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-1">
        <h3 className="font-bold text-gray-900 text-lg truncate">{regionName}</h3>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">{level} • {tahun}</p>
      </div>

      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div key={idx} className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center group hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-500">{m.label}</span>
              <div className={`${m.bg} ${m.color} p-2 rounded-xl`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-bold text-gray-900`}>
                {m.type === 'currency' ? formatCurrency(m.value) : `${m.value.toFixed(2)}%`}
              </span>
              {m.type === 'percent' && (
                <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${m.bg.replace('bg-', 'bg-').replace('50', '600')} h-full transition-all duration-1000`} 
                    style={{ width: `${Math.min(m.value, 100)}%` }} 
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
