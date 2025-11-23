'use client';

import { useEffect, useState, useRef } from 'react';
import type { RegionStatistics, MapLevel } from '@/types/map';
import PieChartDashboard from '@/components/charts/PieChartDashboard';
import BarChartDashboard from '@/components/charts/BarChartDashboard';
import { Building, TrendingUp, Award, CheckCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface StatisticsPanelProps {
  level: MapLevel;
  code: string | null;
  regionName: string | null;
}

export default function StatisticsPanel({ level, code, regionName }: StatisticsPanelProps) {
  const [statistics, setStatistics] = useState<RegionStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Carousel navigation
  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const slideWidth = container.offsetWidth;
      container.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => {
    const totalSlides = statistics ? (statistics.chartData.budgetByType.length > 0 ? 1 : 0) + (statistics.chartData.topRegions.length > 0 ? 1 : 0) : 0;
    if (currentSlide < totalSlides - 1) {
      scrollToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      scrollToSlide(currentSlide - 1);
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

  // Calculate total slides
  const totalSlides = (statistics?.chartData.budgetByType.length > 0 ? 1 : 0) + (statistics?.chartData.topRegions.length > 0 ? 1 : 0);

  return (
    <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 md:px-6 md:py-4">
        <h2 className="text-sm md:text-xl font-bold truncate">{statistics.name}</h2>
        <p className="text-xs md:text-sm text-blue-100 mt-0.5 md:mt-1">
          {level === 'provinsi' && 'Provinsi'}
          {level === 'pemda' && 'Kabupaten/Kota'}
          {level === 'kecamatan' && 'Kecamatan'}
          {level === 'desa' && 'Desa'}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 md:p-6 space-y-3 md:space-y-6">
          {/* Statistics Cards - Compact on Mobile */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {/* Total Desa */}
            <div className="bg-blue-50 rounded-lg p-2 md:p-4 border border-blue-200">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <Building className="w-3 h-3 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                <span className="text-[10px] md:text-sm font-medium text-blue-900 line-clamp-1">Total Desa</span>
              </div>
              <p className="text-sm md:text-2xl font-bold text-blue-900">
                {statistics.stats.totalDesa.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Total Budget */}
            <div className="bg-green-50 rounded-lg p-2 md:p-4 border border-green-200">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <TrendingUp className="w-3 h-3 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span className="text-[10px] md:text-sm font-medium text-green-900 line-clamp-1">Total APBDes</span>
              </div>
              <p className="text-xs md:text-lg font-bold text-green-900 truncate">
                {formatCurrency(statistics.stats.totalBudget)}
              </p>
            </div>

            {/* Avg Budget */}
            <div className="bg-orange-50 rounded-lg p-2 md:p-4 border border-orange-200">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <Award className="w-3 h-3 md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
                <span className="text-[10px] md:text-sm font-medium text-orange-900 line-clamp-1">Rata-rata/Desa</span>
              </div>
              <p className="text-xs md:text-lg font-bold text-orange-900 truncate">
                {formatCurrency(statistics.stats.avgBudgetPerDesa)}
              </p>
            </div>

            {/* Audited */}
            <div className="bg-purple-50 rounded-lg p-2 md:p-4 border border-purple-200">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <CheckCircle className="w-3 h-3 md:w-5 md:h-5 text-purple-600 flex-shrink-0" />
                <span className="text-[10px] md:text-sm font-medium text-purple-900 line-clamp-1">Diaudit</span>
              </div>
              <p className="text-sm md:text-2xl font-bold text-purple-900">
                {statistics.stats.totalAudited}
                <span className="text-[10px] md:text-sm font-normal text-purple-700 ml-0.5 md:ml-1">
                  ({statistics.stats.auditPercentage.toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>

          {/* Charts Carousel - Mobile Optimized */}
          {totalSlides > 0 && (
            <div className="relative">
              {/* Carousel Container */}
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 md:gap-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={(e) => {
                  const container = e.currentTarget;
                  const slideWidth = container.offsetWidth;
                  const newSlide = Math.round(container.scrollLeft / slideWidth);
                  setCurrentSlide(newSlide);
                }}
              >
                {/* Pie Chart Slide */}
                {statistics.chartData.budgetByType.length > 0 && (
                  <div className="flex-shrink-0 w-full snap-start">
                    <div className="bg-gray-50 rounded-lg p-2 md:p-4">
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
                  </div>
                )}

                {/* Bar Chart Slide */}
                {statistics.chartData.topRegions.length > 0 && (
                  <div className="flex-shrink-0 w-full snap-start">
                    <div className="bg-gray-50 rounded-lg p-2 md:p-4">
                      <BarChartDashboard
                        data={statistics.chartData.topRegions}
                        title={`Top 5 ${level === 'provinsi' ? 'Kabupaten/Kota' : level === 'pemda' ? 'Kecamatan' : 'Desa'}`}
                        xAxisKey="Kategori1"
                        nilai1Label="Anggaran"
                        nilai2Label="Realisasi"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons - Mobile Only */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-1 md:p-2 shadow-lg transition-all z-10 md:hidden"
                    aria-label="Previous chart"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-1 md:p-2 shadow-lg transition-all z-10 md:hidden"
                    aria-label="Next chart"
                  >
                    <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
                  </button>

                  {/* Slide Indicators */}
                  <div className="flex justify-center gap-1.5 mt-3 md:hidden">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToSlide(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          currentSlide === index
                            ? 'bg-blue-600 w-4'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Additional Info - Compact */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 md:p-4">
            <p className="text-[10px] md:text-sm text-blue-900">
              <strong className="hidden md:inline">Tip:</strong>
              <span className="md:hidden">💡</span> Double-klik pada peta untuk drill down
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
