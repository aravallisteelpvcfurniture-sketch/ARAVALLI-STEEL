'use client';

import { Home, LayoutGrid, User as UserIcon, MoreHorizontal, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Category', icon: LayoutGrid },
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
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.photoURL ?? ''} alt={userData?.profileName ?? 'User'} />
          <AvatarFallback className="text-xs bg-muted-foreground/20">
            {getInitials(userData?.profileName ?? user.email)}
          </AvatarFallback>
        </Avatar>
      );
    }
    return <UserIcon className="h-6 w-6" />;
  };
  
  const NavItem = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => {
    const isActive = pathname === href;
    const isAccount = label === 'Account';
    
    return (
      <Link 
          href={href}
          className={cn(
              'flex flex-col items-center justify-center gap-1 w-16 h-16 transition-colors duration-200',
              isActive 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-primary',
          )}
      >
          <div className='flex items-center justify-center h-6 w-6'>
            {isAccount ? <AccountIcon /> : <Icon className="h-6 w-6" />}
          </div>
          <span className="text-xs font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full px-4">
      <div className="relative flex items-center justify-center">
        {/* Scanner Button */}
        <Link href="/scanner" className="absolute bottom-5 z-10 flex items-center justify-center w-16 h-16 bg-primary rounded-full shadow-lg text-primary-foreground hover:bg-primary/90 transition-transform duration-300 ease-out hover:scale-105">
          <ScanLine className="w-8 h-8" />
        </Link>
        
        {/* Main Nav Bar */}
        <div className="relative flex justify-around items-center w-full max-w-sm h-20 bg-background/80 backdrop-blur-md rounded-full shadow-lg border border-border/20 overflow-hidden">
          <div className="flex justify-between items-center w-full px-2">
            <div className="flex">
              <NavItem {...navItems[0]} />
              <NavItem {...navItems[1]} />
            </div>
            <div className="w-16"></div>
            <div className="flex">
              <NavItem {...navItems[2]} />
              <NavItem {...navItems[3]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;
