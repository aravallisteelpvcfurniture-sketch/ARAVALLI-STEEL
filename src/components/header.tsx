'use client';
import type { FC } from 'react';
import { useAuth, useUser } from '@/firebase';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';

const Header: FC = () => {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userData } = useDoc(userDocRef);

  const handleLogout = () => {
    auth.signOut();
  };

  const getInitials = (name: string | null | undefined) => {
    return name ? name.split(' ').map(n => n[0]).join('') : <UserIcon />;
  }

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <h1 className="text-3xl font-headline text-primary">Aravalli Furniture</h1>
       <div className="flex items-center gap-4">
        {isUserLoading ? null : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL ?? ''} alt={userData?.profileName ?? 'User'} />
                  <AvatarFallback>{getInitials(userData?.profileName ?? user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
