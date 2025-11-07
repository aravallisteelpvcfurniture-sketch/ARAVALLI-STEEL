'use client';

import { Home, LayoutGrid, ScanLine, User, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Category', icon: LayoutGrid },
  { href: '/scanner', label: 'Scanner', icon: ScanLine },
  { href: '/account', label: 'Account', icon: User },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

const BottomNavbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden z-50">
      <div className="flex justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={label} href={href}>
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground w-20 h-16 transition-colors',
                  isActive ? 'text-primary' : 'hover:text-primary'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
