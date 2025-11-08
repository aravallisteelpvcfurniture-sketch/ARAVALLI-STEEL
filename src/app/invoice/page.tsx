'use client';

import { useState } from 'react';
import BottomNavbar from '@/components/bottom-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, User, ArrowLeft, Loader, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Party } from '@/models/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { deletePartyAndInvoices } from '@/app/actions';


const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-500"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );


export default function InvoicePage() {
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const partiesRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/parties`);
    }, [user, firestore]);

    const { data: parties, isLoading } = useCollection<Party>(partiesRef);

    const handleWhatsAppClick = (e: React.MouseEvent, mobile: string) => {
        e.stopPropagation(); // Prevents the card's click event
        const cleanedMobile = mobile.replace(/[^0-9+]/g, '');
        let whatsappUrl = `https://wa.me/${cleanedMobile}`;
        if (!cleanedMobile.startsWith('+') && cleanedMobile.length >= 10) {
            whatsappUrl = `https://wa.me/91${cleanedMobile.slice(-10)}`;
        }
        window.open(whatsappUrl, '_blank');
    };

    const handleDeleteClick = (e: React.MouseEvent, party: Party) => {
        e.stopPropagation();
        setPartyToDelete(party);
    };
    
    const confirmDelete = async () => {
        if (!partyToDelete || !user) return;
        setIsDeleting(true);

        const result = await deletePartyAndInvoices(user.uid, partyToDelete.id);

        if (result.success) {
            toast({
                title: 'Party Deleted',
                description: `${partyToDelete.name} and all their invoices have been deleted.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Delete Failed',
                description: result.error || 'Could not delete the party. Please try again.',
            });
        }

        setIsDeleting(false);
        setPartyToDelete(null);
    };


  return (
    <div className="flex flex-col h-screen">
       <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
        <h1 className="text-xl font-headline text-primary">Party List</h1>
        <div className="flex items-center gap-2">
            <Link href="/invoice/add-party">
            <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Party
            </Button>
            </Link>
            <Link href="/invoice/create">
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Bill
                </Button>
            </Link>
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center mt-16">
                <Loader className="animate-spin text-primary" />
            </div>
          )}
          {!isLoading && parties && parties.length === 0 ? (
            <div className="text-center text-muted-foreground mt-16">
              <p className="mb-2">No parties found.</p>
              <p className="text-sm">Click "Add Party" to create your first one.</p>
            </div>
          ) : (
            parties?.map((party) => (
              <Card key={party.id} className="hover:bg-secondary/50 transition-colors group">
                <CardContent className="p-4 flex items-center gap-4" onClick={() => router.push(`/invoice/party/${party.id}`)}>
                  <div className="p-3 bg-secondary rounded-full">
                    <User className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-card-foreground">{party.name}</p>
                    <p className="text-sm text-muted-foreground">{party.mobile}</p>
                  </div>
                  <div onClick={(e) => handleWhatsAppClick(e, party.mobile)} className="p-2 rounded-full hover:bg-green-100 cursor-pointer">
                    <WhatsAppIcon />
                  </div>
                   <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={(e) => handleDeleteClick(e, party)}>
                    <Trash2 className="h-5 w-5"/>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <BottomNavbar />

      <AlertDialog open={!!partyToDelete} onOpenChange={(isOpen) => !isOpen && setPartyToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the party <span className="font-bold">{partyToDelete?.name}</span> and all of their associated invoices.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
            >
                {isDeleting ? <Loader className="animate-spin mr-2" /> : null}
                Yes, delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
