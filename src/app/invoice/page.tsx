'use client';

import Header from '@/components/header';
import BottomNavbar from '@/components/bottom-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Mock data for parties has been removed.
const parties: any[] = [];

export default function InvoicePage() {
    const router = useRouter();

  return (
    <div className="flex flex-col h-screen">
       <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
        <h1 className="text-xl font-headline text-primary">Party List</h1>
        <Link href="/invoice/add-party">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Party
          </Button>
        </Link>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {parties.length === 0 ? (
            <div className="text-center text-muted-foreground mt-16">
              <p className="mb-2">No parties found.</p>
              <p className="text-sm">Click "Add Party" to create your first one.</p>
            </div>
          ) : (
            parties.map((party) => (
              <Card key={party.id} className="hover:bg-secondary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <User className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">{party.name}</p>
                    <p className="text-sm text-muted-foreground">{party.city}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
}
