'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, MessageSquare, CheckCircle, HelpCircle } from 'lucide-react';

const mobileResponItems = [
  {
    name: 'Atensi',
    href: '/respon/atensi',
    icon: Bell,
  },
  {
    name: 'Respon',
    href: '/respon/respon',
    icon: MessageSquare,
  },
  {
    name: 'Selesai',
    href: '/respon/selesai',
    icon: CheckCircle,
  },
  {
    name: 'Petunjuk',
    href: '/respon/petunjuk',
    icon: HelpCircle,
  },
];

export default function MobileResponMenu() {
  const pathname = usePathname();

  // Only show on mobile devices and on respon routes
  const shouldShow = pathname?.startsWith('/respon');

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {mobileResponItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
