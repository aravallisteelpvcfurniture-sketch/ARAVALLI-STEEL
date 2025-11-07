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
    return (
      <Link 
          href={href}
          className={cn(
              'flex flex-col items-center justify-center text-muted-foreground w-full h-16 transition-colors duration-200',
              isActive ? 'text-primary' : 'hover:text-primary/80'
          )}
      >
          {label === 'Account' ? <AccountIcon /> : <Icon className="h-6 w-6" />}
          <span className="text-xs mt-1 sr-only">{label}</span>
      </Link>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-24 px-4 pointer-events-none">
        <div className="relative h-full w-full">
            
            <Link href="/scanner" className="pointer-events-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform duration-300 ease-in-out hover:scale-110">
                    <Plus className="h-8 w-8" />
                </div>
            </Link>

            <nav 
                className="absolute bottom-4 left-0 right-0 h-16 bg-background rounded-2xl shadow-t-strong overflow-hidden pointer-events-auto"
                style={{
                    boxShadow: '0 -4px 12px -1px rgba(0, 0, 0, 0.08)'
                }}
            >
                <div className="flex justify-around items-center h-full">
                    <NavItem {...navItems[0]} />
                    <NavItem {...navItems[1]} />
                    <div className="w-full" /> {/* Spacer for the center button */}
                    <NavItem {...navItems[2]} />
                    <NavItem {...navItems[3]} />
                </div>

                {/* SVG for the notch */}
                <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[40px] pointer-events-none"
                >
                    <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 40V14C0 6.26801 6.26801 0 14 0H86C93.732 0 100 6.26801 100 14V40H0Z" fill="hsl(var(--background))"/>
                    </svg>
                </div>
            </nav>
        </div>
    </div>
  );
};

export default BottomNavbar;
