'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/header';
import { Loader } from 'lucide-react';
import BottomNavbar from '@/components/bottom-navbar';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1"></main>
      <BottomNavbar />
    </div>
  );
}
