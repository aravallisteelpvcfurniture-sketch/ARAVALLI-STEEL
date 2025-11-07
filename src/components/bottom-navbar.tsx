'use client';

import { Home, LayoutGrid, ScanLine, User as UserIcon, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Category', icon: LayoutGrid },
  { href: '/scanner', label: 'Scanner', icon: ScanLine },
  { href: '/account', label: 'Account', icon: UserIcon },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

const BottomNavbar = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc(userDocRef);

  const getInitials = (name: string | null | undefined) => {
    return name ? name.split(' ').map(n => n[0]).join('') : <UserIcon className="h-6 w-6" />;
  }

  const AccountIcon = () => {
    if (user) {
      return (
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.photoURL ?? ''} alt={userData?.profileName ?? 'User'} />
          <AvatarFallback className="text-xs">
            {getInitials(userData?.profileName ?? user.email)}
          </AvatarFallback>
        </Avatar>
      );
    }
    return <UserIcon className="h-6 w-6" />;
  };

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
                {label === 'Account' ? <AccountIcon /> : <Icon className="h-6 w-6" />}
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
