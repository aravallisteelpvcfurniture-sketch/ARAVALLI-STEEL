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
    if (!name) return <UserIcon className="h-6 w-6" />;
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
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
    <div className="md:hidden fixed bottom-8 left-0 right-0 z-50 flex justify-center">
        <nav className="flex justify-around items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-full shadow-lg p-2">
            {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
                <Link 
                    key={label} 
                    href={href}
                    className={cn(
                        'flex flex-col items-center justify-center text-muted-foreground w-16 h-12 transition-all duration-300 rounded-full',
                        isActive ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
                    )}
                >
                    {label === 'Account' ? <AccountIcon /> : <Icon className="h-5 w-5" />}
                    <span className="text-xs mt-1">{label}</span>
                </Link>
            );
            })}
        </nav>
    </div>
  );
};

export default BottomNavbar;
