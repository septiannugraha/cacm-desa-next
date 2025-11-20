'use client';

import type { BreadcrumbItem } from '@/types/map';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
      {/* Home icon for Indonesia */}
      <button
        onClick={() => onNavigate(0)}
        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        aria-label="Back to Indonesia"
      >
        <Home className="w-4 h-4" />
        <span>Indonesia</span>
      </button>

      {/* Breadcrumb items */}
      {items.slice(1).map((item, index) => {
        const actualIndex = index + 1;
        const isLast = actualIndex === items.length - 1;

        return (
          <div key={actualIndex} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="text-sm font-semibold text-gray-900">
                {item.name}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(actualIndex)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {item.name}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
