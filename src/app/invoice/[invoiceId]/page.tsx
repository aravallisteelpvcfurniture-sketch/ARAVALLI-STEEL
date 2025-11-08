'use client';
import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Invoice, Party } from '@/models/types';
import { Loader, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvoicePrintPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const invoiceId = params.invoiceId as string;
    const isPrintView = searchParams.get('print') === 'true';
    
    const { user } = useUser();
    const firestore = useFirestore();

    const invoiceRef = useMemoFirebase(() => {
        if (!user || !firestore || !invoiceId) return null;
        return doc(firestore, `users/${user.uid}/invoices`, invoiceId);
    }, [user, firestore, invoiceId]);
    const { data: invoice, isLoading: isLoadingInvoice } = useDoc<Invoice>(invoiceRef);

    const partyRef = useMemoFirebase(() => {
        if (!user || !firestore || !invoice?.partyId) return null;
        return doc(firestore, `users/${user.uid}/parties`, invoice.partyId);
    }, [user, firestore, invoice]);
    const { data: party, isLoading: isLoadingParty } = useDoc<Party>(partyRef);
    
    // The automatic print dialog was removed to allow users to view the layout first.
    // The user can manually trigger the print function from the button or browser menu.

    const isLoading = isLoadingInvoice || isLoadingParty;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="animate-spin text-primary" />
            </div>
        );
    }
    
    if (!invoice || !party) {
        return (
           <div className="flex flex-col items-center justify-center h-screen text-center">
               <p className="text-xl font-semibold">Invoice not found</p>
               <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
           </div>
       );
   }

    return (
        <div className={`bg-white text-black min-h-screen ${isPrintView ? 'p-4 md:p-8' : 'p-4 md:p-8'}`}>
            <header className="print:hidden flex items-center justify-between p-4 border-b bg-card shadow-sm mb-4 max-w-4xl mx-auto rounded-t-lg">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-headline text-primary">Invoice</h1>
                <Button onClick={() => window.print()}>Print</Button>
            </header>
            <div className="max-w-4xl mx-auto p-8 border rounded-lg bg-white shadow-lg print:shadow-none print:border-none print:p-0">
                <header className="text-center mb-8 pb-4 border-b">
                    <h1 className="text-4xl font-bold text-gray-800 font-headline">Aravalli Furniture</h1>
                    <p className="text-gray-500">Your trusted partner in quality furniture</p>
                </header>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2">Billed To:</h3>
                        <p className="font-semibold text-lg">{party.name}</p>
                        <p>{party.address}</p>
                        <p>{party.mobile}</p>
                        <p>{party.email}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-gray-700">Invoice #{invoice.id.substring(0, 8)}</h3>
                        <p><span className="font-semibold">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <table className="w-full mb-8">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left font-semibold text-gray-600">Product</th>
                            <th className="p-3 text-center font-semibold text-gray-600">Qty</th>
                            <th className="p-3 text-center font-semibold text-gray-600">Per Kg</th>
                            <th className="p-3 text-center font-semibold text-gray-600">Rate</th>
                            <th className="p-3 text-right font-semibold text-gray-600">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-3">{item.product}</td>
                                <td className="p-3 text-center">{item.qty}</td>
                                <td className="p-3 text-center">{(item as any).perKg > 0 ? (item as any).perKg : '-'}</td>
                                <td className="p-3 text-center">₹{item.rate.toFixed(2)}</td>
                                <td className="p-3 text-right">₹{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-8">
                    <div className="w-full md:w-1/3">
                        <div className="flex justify-between py-2">
                            <span className="font-semibold text-gray-600">Subtotal</span>
                            <span>₹{invoice.grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold text-xl border-t-2 border-gray-800 mt-2">
                            <span className="text-gray-800">Grand Total</span>
                            <span className="text-gray-800">₹{invoice.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <footer className="text-center text-sm text-gray-500 pt-4 border-t mt-8 print:mt-4">
                    <p>Thank you for your business!</p>
                </footer>
            </div>
        </div>
    );
}
