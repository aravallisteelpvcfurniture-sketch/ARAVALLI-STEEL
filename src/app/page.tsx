'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/header';
import { Loader, Receipt, Handshake, Users } from 'lucide-react';
import BottomNavbar from '@/components/bottom-navbar';
import Link from 'next/link';

const ToolCard = ({ icon: Icon, title, href }: { icon: React.ElementType, title: string, href: string }) => (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer aspect-square">
        <Icon className="w-12 h-12 text-primary" />
        <p className="mt-4 text-sm font-semibold text-center text-card-foreground">{title}</p>
      </div>
    </Link>
  );

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
      <main className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4">
            <ToolCard icon={Receipt} title="Invoice Bill" href="#" />
            <ToolCard icon={Handshake} title="Greetings" href="#" />
            <ToolCard icon={Users} title="Visitors" href="#" />
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
}
