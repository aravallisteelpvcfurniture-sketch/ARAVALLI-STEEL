'use client';

import { Home, LayoutGrid, User as UserIcon, MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Category', icon: LayoutGrid },
  { href: '/scanner', label: 'Scanner', icon: Plus },
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
    if (!name) return <UserIcon className="h-5 w-5" />;
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  }

  const AccountIcon = () => {
    if (user) {
      return (
        <Avatar className="h-5 w-5">
          <AvatarImage src={user.photoURL ?? ''} alt={userData?.profileName ?? 'User'} />
          <AvatarFallback className="text-xs bg-muted-foreground/20">
            {getInitials(userData?.profileName ?? user.email)}
          </AvatarFallback>
        </Avatar>
      );
    }
    return <UserIcon className="h-5 w-5" />;
  };

  const NavItem = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => {
    const isActive = pathname === href;
    const isScanner = label === 'Scanner';
    return (
      <Link 
          href={href}
          className={cn(
              'relative flex items-center justify-center gap-2 h-12 px-3 transition-colors duration-200 text-sm font-medium',
              isActive 
                ? 'bg-primary text-primary-foreground rounded-t-lg' 
                : 'bg-muted/60 text-muted-foreground hover:bg-muted rounded-t-lg',
              isScanner && 'hidden' // Hide scanner from the main row
          )}
      >
          {label === 'Account' ? <AccountIcon /> : <Icon className="h-5 w-5" />}
          <span>{label}</span>
      </Link>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-background shadow-t-strong">
      <div className="flex justify-around items-end h-full">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </div>
  );
};

export default BottomNavbar;
