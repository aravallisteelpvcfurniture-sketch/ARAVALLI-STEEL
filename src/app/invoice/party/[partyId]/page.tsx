'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { Party, Invoice } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader, FileText, Share, Printer, Plus } from 'lucide-react';
import BottomNavbar from '@/components/bottom-navbar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function PartyDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const partyId = params.partyId as string;
    const { toast } = useToast();

    const { user } = useUser();
    const firestore = useFirestore();

    const partyRef = useMemoFirebase(() => {
        if (!user || !firestore || !partyId) return null;
        return doc(firestore, `users/${user.uid}/parties`, partyId);
    }, [user, firestore, partyId]);
    const { data: party, isLoading: isLoadingParty } = useDoc<Party>(partyRef);
    
    const invoicesQuery = useMemoFirebase(() => {
        if (!user || !firestore || !partyId) return null;
        return query(collection(firestore, `users/${user.uid}/invoices`), where('partyId', '==', partyId));
    }, [user, firestore, partyId]);

    const { data: invoices, isLoading: isLoadingInvoices } = useCollection<Invoice>(invoicesQuery);

    const isLoading = isLoadingParty || isLoadingInvoices;
    
    const copyLinkFallback = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({
            title: "Link Copied",
            description: "Share link copied to clipboard!",
        });
    };

    const handleShare = async (invoiceId: string) => {
        const url = `${window.location.origin}/invoice/${invoiceId}?print=true`;
        const shareData = {
            title: `Invoice from Aravalli Furniture`,
            text: `Hi ${party?.name || ''}, please find your invoice here. Click the link to view and download the PDF.`,
            url: url
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // Fallback to copying the link if user cancels or there's an error.
                // We don't log the error to avoid showing the Next.js error overlay.
                copyLinkFallback(url);
            }
        } else {
            copyLinkFallback(url);
        }
    }

    const handlePrint = (invoiceId: string) => {
        const url = `${window.location.origin}/invoice/${invoiceId}?print=true`;
        window.open(url, '_blank');
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="animate-spin text-primary" />
            </div>
        );
    }
    
    if (!party) {
         return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <p className="text-xl font-semibold">Party not found</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => router.push('/invoice')}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-headline text-primary truncate">{party.name}</h1>
                <Link href={`/invoice/create?partyId=${partyId}`}>
                    <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> New Bill
                    </Button>
                </Link>
            </header>

            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Party Details</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Mobile:</strong> {party.mobile}</p>
                        {party.email && <p><strong>Email:</strong> {party.email}</p>}
                        {party.address && <p><strong>Address:</strong> {party.address}</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoices && invoices.length > 0 ? (
                            <div className="space-y-3">
                                {invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(invoice => (
                                    <Card key={invoice.id} className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground"/>
                                                    Invoice #{invoice.id.substring(0, 6)}...
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(invoice.createdAt).toLocaleDateString()} - <span className="font-medium text-foreground">₹{invoice.grandTotal.toFixed(2)}</span>
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleShare(invoice.id)}>
                                                    <Share className="h-4 w-4"/>
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => handlePrint(invoice.id)}>
                                                    <Printer className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No invoices found for this party.</p>
                        )}
                    </CardContent>
                </Card>
            </main>

            <BottomNavbar />
        </div>
    );
}
