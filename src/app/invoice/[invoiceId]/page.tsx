'use client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Invoice, Party } from '@/models/types';
import { Loader, ArrowLeft, Printer, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getInvoiceForSharing } from '@/app/actions';

const InvoiceContent = ({ invoice, party }: { invoice: Invoice, party: Party }) => {
    const subTotal = invoice.items.reduce((acc, item) => acc + item.total, 0);
    // Assuming a fixed tax rate for now as it's not in the model.
    const taxRate = 0.05; // 5%
    const taxAmount = subTotal * taxRate;
    const grandTotal = invoice.grandTotal;
    const amountPaid = 0; // Assuming not tracked in model yet
    const balanceDue = grandTotal - amountPaid;

    return (
         <div className="max-w-4xl mx-auto p-8 bg-white text-gray-800 font-sans print:shadow-none print:p-0">
            {/* Header */}
            <header className="flex justify-between items-start pb-8 border-b-4 border-primary">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase">ARAVALLI</h2>
                    <p className="text-sm text-gray-500 mt-1">123 Industrial Area, Kishangarh, Rajasthan</p>
                    <p className="text-sm text-gray-500">email@aravalli.com | (123) 456-7890</p>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-bold text-primary uppercase tracking-wider">INVOICE</h1>
                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Invoice No:</strong> #{invoice.id.substring(0, 6).toUpperCase()}</p>
                        <p><strong>Invoice Date:</strong> {new Date(invoice.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>
                </div>
            </header>

            {/* Billing Info */}
            <section className="mt-8">
                <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wider">BILL TO</h3>
                <div className="mt-2 text-gray-700">
                    <p className="text-lg font-bold">{party.name}</p>
                    {party.address && <p>{party.address}</p>}
                    <p>{party.mobile}</p>
                    {party.email && <p>{party.email}</p>}
                </div>
            </section>

            {/* Items Table */}
            <section className="mt-8">
                <table className="w-full text-left">
                    <thead >
                        <tr className="bg-primary text-primary-foreground uppercase text-sm">
                            <th className="p-3">Description</th>
                            <th className="p-3 text-right w-24">Qty</th>
                            <th className="p-3 text-right w-32">Unit Price</th>
                            <th className="p-3 text-right w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="p-3">
                                    <p className="font-medium text-gray-800">{item.product}</p>
                                </td>
                                <td className="p-3 text-right">{item.qty}</td>
                                <td className="p-3 text-right">₹{item.rate.toFixed(2)}</td>
                                <td className="p-3 text-right font-medium">₹{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Total Section */}
            <section className="flex justify-end mt-8">
                <div className="w-full max-w-xs text-gray-700 space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total Tax ({ (taxRate * 100).toFixed(0) }%)</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-gray-300">
                        <span>Balance Due</span>
                        <span>₹{balanceDue.toFixed(2)}</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
                <p className="mb-4 font-semibold">Thank you for your business!</p>
                <h4 className="font-semibold text-gray-600 mb-1">Terms & Conditions</h4>
                <p>Payment is due within 30 days. Late payments are subject to fees.</p>
            </footer>
        </div>
    );
}

const InvoicePrintView = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    
    const invoiceId = params.invoiceId as string;
    const userId = searchParams.get('uid');

    const [data, setData] = useState<{ invoice: Invoice; party: Party } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId || !invoiceId) {
            setError("Invalid link parameters.");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            const result = await getInvoiceForSharing(userId, invoiceId);
            if (result.error) {
                setError(result.error);
            } else if (result.invoice && result.party) {
                setData({ invoice: result.invoice, party: result.party });
            } else {
                 setError("Could not retrieve invoice details.");
            }
            setIsLoading(false);
        };
        fetchData();
    }, [userId, invoiceId]);

     useEffect(() => {
        if (!isLoading && data) {
            setTimeout(() => window.print(), 1000); // Delay to ensure content is rendered
        }
    }, [isLoading, data]);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <Loader className="animate-spin text-primary h-10 w-10" />
                <p className="ml-4 text-lg">Loading Invoice...</p>
            </div>
        );
    }
    
    if (error || !data) {
        return (
           <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100 dark:bg-gray-900">
               <p className="text-xl font-semibold text-red-600">{error || 'Invoice not found'}</p>
               <p className="text-gray-500">The requested invoice could not be located.</p>
           </div>
       );
   }

    return (
        <div className="bg-white">
            <InvoiceContent invoice={data.invoice} party={data.party} />
        </div>
    );
};


const InvoiceDashboardView = () => {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const invoiceId = params.invoiceId as string;
    
    const { user } = useUser();
    const firestore = useFirestore();

    const invoiceRef = useMemoFirebase(() => {
        if (!user || !firestore || !invoiceId) return null;
        return doc(firestore, `users/${user.uid}/invoices`, invoiceId);
    }, [user, firestore, invoiceId]);
    const { data: invoice, isLoading: isLoadingInvoice } = useDoc<Invoice>(invoiceRef);

    const partyId = invoice?.partyId;
    const partyRef = useMemoFirebase(() => {
        if (!user || !firestore || !partyId) return null;
        return doc(firestore, `users/${user.uid}/parties`, partyId);
    }, [user, firestore, partyId]);
    const { data: party, isLoading: isLoadingParty } = useDoc<Party>(partyRef);
    
    const isLoading = isLoadingInvoice || (!!invoice && !party && isLoadingParty);
    
    const handleShare = () => {
        if (!party || !party.mobile) {
            toast({
                variant: 'destructive',
                title: "Mobile Number Missing",
                description: "This party does not have a mobile number to share to.",
            });
            return;
        }

        if (!user) {
             toast({
                variant: 'destructive',
                title: "User not found",
                description: "You must be logged in to share an invoice.",
            });
            return;
        }

        const invoiceUrl = `${window.location.origin}/invoice/${invoiceId}?print=true&uid=${user.uid}`;
        
        const message = `Dear ${party.name},
Greetings from ARAVALLI FURNITURE.
Thank you for your interest in our products. Please take a look at your Invoice.

Invoice Link - ${invoiceUrl}

Regards,
Aravalli Furniture
This invoice is generated by Aravalli Furniture app.`;
        
        const cleanedMobile = party.mobile.replace(/[^0-9+]/g, '');
        let whatsappUrl = `https://wa.me/${cleanedMobile}`;
        
        if (!cleanedMobile.startsWith('+') && cleanedMobile.length >= 10) {
            whatsappUrl = `https://wa.me/91${cleanedMobile.slice(-10)}`;
        }
        
        whatsappUrl += `?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
    }

    const handlePrint = () => {
        if (!user || !invoiceId) return;
        const url = `/invoice/${invoiceId}?print=true&uid=${user.uid}`;
        window.open(url, '_blank');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <Loader className="animate-spin text-primary h-10 w-10" />
                <p className="ml-4 text-lg">Loading Invoice...</p>
            </div>
        );
    }
    
    if (!invoice) {
        return (
           <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100 dark:bg-gray-900">
               <p className="text-xl font-semibold text-red-600">Invoice not found</p>
               <p className="text-gray-500">The requested invoice could not be located.</p>
               <Button onClick={() => router.back()} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Go Back</Button>
           </div>
       );
   }

   if (!party) {
         return (
           <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100 dark:bg-gray-900">
               <p className="text-xl font-semibold text-red-600">Party details not found for this invoice</p>
               <Button onClick={() => router.back()} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Go Back</Button>
           </div>
       );
   }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
             <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Invoice Preview</h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handlePrint}>
                        <Printer />
                    </Button>
                </div>
            </header>
            <main className="p-4 md:p-8 pt-4">
                <div className="shadow-lg rounded-lg overflow-hidden">
                    <InvoiceContent invoice={invoice} party={party} />
                </div>
            </main>
        </div>
    );
};

export default function InvoicePrintPage() {
    const searchParams = useSearchParams();
    const isPrintView = searchParams.get('print') === 'true';

    if (isPrintView) {
        return <InvoicePrintView />;
    }

    return <InvoiceDashboardView />;
}
