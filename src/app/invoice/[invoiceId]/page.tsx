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
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg print:shadow-none rounded-lg font-sans">
            <div className="p-8 md:p-12">
                <header className="flex justify-between items-start pb-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">INVOICE</h1>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-blue-600 uppercase">ARAVALLI</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">123 Industrial Area, Kishangarh, Rajasthan</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">P: (123) 456-7890</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">email@aravalli.com</p>
                    </div>
                </header>
                
                <section className="flex justify-between mt-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Billed To</h3>
                        <p className="font-bold text-lg text-gray-900 dark:text-white mt-1">{party.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{party.address}</p>
                    </div>
                    <div className="text-right">
                         <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <span className="font-semibold text-gray-500 dark:text-gray-400">Invoice Number</span><span className="text-gray-800 dark:text-gray-100 font-medium">#{invoice.id.substring(0, 6).toUpperCase()}</span>
                            <span className="font-semibold text-gray-500 dark:text-gray-400">Date of Issue</span><span className="text-gray-800 dark:text-gray-100 font-medium">{new Date(invoice.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>
                </section>
                
                <section className="mt-10">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800 dark:bg-gray-900 text-white">
                            <tr>
                                <th className="p-3 text-left font-semibold">DESCRIPTION</th>
                                <th className="p-3 text-right font-semibold w-24">RATE</th>
                                <th className="p-3 text-right font-semibold w-20">QTY</th>
                                <th className="p-3 text-right font-semibold w-32">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 even:bg-gray-50 dark:even:bg-gray-700/50">
                                    <td className="p-3">
                                        <p className="font-medium text-gray-800 dark:text-gray-100">{item.product}</p>
                                        {item.perKg > 0 && <p className="text-xs text-gray-500 dark:text-gray-400">({item.qty} x {item.perKg} kg)</p>}
                                    </td>
                                    <td className="p-3 text-right">₹{item.rate.toFixed(2)}</td>
                                    <td className="p-3 text-right">{item.perKg > 0 ? (item.qty * item.perKg).toFixed(2) : item.qty.toFixed(2)}</td>
                                    <td className="p-3 text-right font-medium">₹{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="flex justify-end mt-6">
                    <div className="w-full max-w-xs text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                            <span className="font-medium text-gray-800 dark:text-gray-100">₹{subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-300">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                            <span className="font-medium text-gray-800 dark:text-gray-100">₹{taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-300">Total</span>
                            <span className="font-medium text-gray-800 dark:text-gray-100">₹{grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 my-2 rounded">
                            <span>Balance Due</span>
                            <span>₹{balanceDue.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Terms &amp; conditions</h4>
                            <p>Payment is due within 30 days. Late payments are subject to fees.</p>
                        </div>
                        <div className="w-48 text-center">
                            <div className="border-b-2 border-gray-400 border-dotted h-16"></div>
                            <p className="mt-2">Authorized Signature</p>
                        </div>
                    </div>
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
    
    const isLoading = isLoadingInvoice || (!invoice ? false : isLoadingParty);

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
            <div className="bg-white dark:bg-gray-900">
                <InvoiceContent invoice={invoice} party={party} />
            </div>
        )
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
             <header className="flex items-center justify-between p-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300">Invoice Preview</h1>
                <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Printer className="mr-2"/>
                    Print
                </Button>
            </header>
            <main className="p-4 md:p-8 pt-0">
                <InvoiceContent invoice={invoice} party={party} />
            </main>
        </div>
    );
}
