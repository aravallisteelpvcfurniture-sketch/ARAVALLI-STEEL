'use client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Invoice, Party } from '@/models/types';
import { Loader, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InvoiceContent = ({ invoice, party }: { invoice: Invoice, party: Party }) => {
    const subTotal = invoice.items.reduce((acc, item) => acc + item.total, 0);
    // Assuming a fixed tax rate for now as it's not in the model.
    const taxRate = 0.05; // 5%
    const taxAmount = subTotal * taxRate;
    const grandTotal = invoice.grandTotal;
    const amountPaid = 0; // Assuming not tracked in model yet
    const balanceDue = grandTotal - amountPaid;

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none rounded-lg font-sans text-gray-800">
            <div className="p-8 md:p-12">
                {/* Header */}
                <header className="flex justify-between items-start pb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 uppercase">ARAVALLI</h2>
                        <p className="text-sm text-gray-500 mt-1">123 Industrial Area, Kishangarh, Rajasthan</p>
                        <p className="text-sm text-gray-500">email@aravalli.com</p>
                        <p className="text-sm text-gray-500">(123) 456-7890</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-5xl font-bold text-gray-700 tracking-wider">INVOICE</h1>
                        <div className="mt-4 flex items-center justify-end">
                             <div className="grid grid-cols-2 gap-x-4 text-sm">
                                <span className="font-semibold text-gray-600">Invoice No:</span><span>#{invoice.id.substring(0, 6).toUpperCase()}</span>
                                <span className="font-semibold text-gray-600">Invoice Date:</span><span>{new Date(invoice.createdAt).toLocaleDateString('en-GB')}</span>
                                <span className="font-semibold text-gray-600">Due Date:</span><span>{new Date(new Date(invoice.createdAt).setDate(new Date(invoice.createdAt).getDate() + 30)).toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Billing Info */}
                <section className="flex justify-between mt-4 pb-8 border-b">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">BILL TO</h3>
                        <p className="font-bold text-lg text-gray-900 mt-2">{party.name}</p>
                        {party.address && <p className="text-sm text-gray-600">{party.address}</p>}
                        <p className="text-sm text-gray-600">{party.mobile}</p>
                        {party.email && <p className="text-sm text-gray-600">{party.email}</p>}
                    </div>
                    {/* Ship to can be added here if needed */}
                </section>
                
                {/* Items Table */}
                <section className="mt-8">
                    <table className="w-full text-sm">
                        <thead className="border-b-2 border-gray-300">
                            <tr>
                                <th className="p-2 text-left font-bold text-gray-600 uppercase tracking-wider">DESCRIPTION</th>
                                <th className="p-2 text-right font-bold text-gray-600 uppercase tracking-wider w-24">QTY</th>
                                <th className="p-2 text-right font-bold text-gray-600 uppercase tracking-wider w-32">UNIT PRICE</th>
                                <th className="p-2 text-right font-bold text-gray-600 uppercase tracking-wider w-32">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="p-2 py-3">
                                        <p className="font-medium text-gray-800">{item.product}</p>
                                    </td>
                                    <td className="p-2 py-3 text-right">{item.qty}</td>
                                    <td className="p-2 py-3 text-right">₹{item.rate.toFixed(2)}</td>
                                    <td className="p-2 py-3 text-right font-medium">₹{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Total Section */}
                <section className="flex justify-end mt-6">
                    <div className="w-full max-w-sm text-sm">
                         <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">SUBTOTAL</span>
                                <span className="font-medium text-gray-800">₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">TOTAL TAX</span>
                                <span className="font-medium text-gray-800">₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 mt-2 border-t-2 border-gray-300 font-bold text-xl">
                                <span className="text-gray-800">Balance Due</span>
                                <span className="text-gray-800">₹{balanceDue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
                    <p className="mb-4">Thank you for your business!</p>
                    <h4 className="font-semibold text-gray-600 mb-1">Terms & Instructions</h4>
                    <p>Payment is due within 30 days. Late payments are subject to fees.</p>
                </footer>
            </div>
        </div>
    );
}

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
    }, [user, firestore, invoice?.partyId]);
    const { data: party, isLoading: isLoadingParty } = useDoc<Party>(partyRef);
    
    const isLoading = isLoadingInvoice || (!!invoice && isLoadingParty);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <Loader className="animate-spin text-primary" />
            </div>
        );
    }
    
    if (!invoice || !party) {
        return (
           <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100 dark:bg-gray-900">
               <p className="text-xl font-semibold text-red-600">Invoice or Party not found</p>
               <Button onClick={() => router.back()} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Go Back</Button>
           </div>
       );
   }
   
    if (isPrintView) {
        return (
            <div className="bg-white">
                <InvoiceContent invoice={invoice} party={party} />
            </div>
        )
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
             <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300">Invoice Preview</h1>
                <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Printer className="mr-2"/>
                    Print
                </Button>
            </header>
            <main className="p-4 md:p-8 pt-4">
                <InvoiceContent invoice={invoice} party={party} />
            </main>
        </div>
    );
}
