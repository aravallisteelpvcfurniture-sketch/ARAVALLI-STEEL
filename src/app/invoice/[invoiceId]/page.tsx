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
    
    const isLoading = isLoadingInvoice || isLoadingParty;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <Loader className="animate-spin text-blue-600" />
            </div>
        );
    }
    
    if (!invoice || !party) {
        return (
           <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
               <p className="text-xl font-semibold text-red-600">Invoice not found</p>
               <Button onClick={() => router.back()} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Go Back</Button>
           </div>
       );
   }

   const subTotal = invoice.items.reduce((acc, item) => acc + item.total, 0);
   // Assuming a fixed tax rate for now as it's not in the model.
   const taxRate = 0.05; // 5%
   const taxAmount = subTotal * taxRate;
   const balanceDue = subTotal + taxAmount;

    return (
        <div className={`bg-gray-100 min-h-screen font-sans text-gray-800 ${isPrintView ? 'p-0' : 'p-4 md:p-8'}`}>
             <header className="print:hidden flex items-center justify-between p-4 mb-4 max-w-5xl mx-auto">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold text-gray-700">Invoice Preview</h1>
                <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white">Print</Button>
            </header>
            <div className="max-w-5xl mx-auto bg-white shadow-lg print:shadow-none">
                {/* Decorative Header */}
                <div className="h-4 bg-gradient-to-r from-blue-500 to-cyan-400 print:hidden"></div>
                <div className="p-8 md:p-12">
                    <header className="flex justify-between items-start mb-10">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-headline">Aravalli Furniture</h1>
                            <p className="text-sm text-gray-500">123 Industrial Area, Kishangarh</p>
                            <p className="text-sm text-gray-500">Rajasthan, 305801</p>
                            <p className="text-sm text-gray-500">India</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-5xl font-light text-blue-600 tracking-wider">INVOICE</h2>
                        </div>
                    </header>

                    <section className="grid grid-cols-2 border-y border-gray-200 py-4 mb-10">
                        <div>
                            <div className="grid grid-cols-2 text-sm">
                                <span className="font-semibold text-gray-500">Invoice#</span><span className="font-bold text-gray-800">INV-{invoice.id.substring(0, 6).toUpperCase()}</span>
                                <span className="font-semibold text-gray-500">Invoice Date</span><span className="font-bold text-gray-800">{new Date(invoice.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                                <span className="font-semibold text-gray-500">Terms</span><span className="font-bold text-gray-800">Due on Receipt</span>
                                <span className="font-semibold text-gray-500">Due Date</span><span className="font-bold text-gray-800">{new Date(invoice.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 border-b pb-2 mb-2">Bill To</h3>
                            <p className="font-bold text-lg text-gray-900">{party.name}</p>
                            <p className="text-sm text-gray-600">{party.address}</p>
                            <p className="text-sm text-gray-600">{party.mobile}</p>
                        </div>
                         <div>
                            <h3 className="text-sm font-semibold text-gray-500 border-b pb-2 mb-2">Ship To</h3>
                            <p className="font-bold text-lg text-gray-900">{party.name}</p>
                            <p className="text-sm text-gray-600">{party.address || 'N/A'}</p>
                        </div>
                    </section>

                    <table className="w-full text-sm">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th className="p-3 text-left w-12">#</th>
                                <th className="p-3 text-left">Item & Description</th>
                                <th className="p-3 text-right w-24">Qty</th>
                                <th className="p-3 text-right w-32">Rate</th>
                                <th className="p-3 text-right w-32">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="p-3 text-center">{index + 1}</td>
                                    <td className="p-3">
                                        <p className="font-semibold">{item.product}</p>
                                        {item.perKg > 0 && <p className="text-xs text-gray-500">Qty: {item.qty} x {item.perKg} kg</p>}
                                    </td>
                                    <td className="p-3 text-right">{item.perKg > 0 ? (item.qty * item.perKg).toFixed(2) : item.qty.toFixed(2)}</td>
                                    <td className="p-3 text-right">₹{item.rate.toFixed(2)}</td>
                                    <td className="p-3 text-right">₹{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                        <div className="w-full max-w-sm text-sm">
                             <div className="flex justify-between py-2 border-b">
                                <span className="font-semibold text-gray-600">Sub Total</span>
                                <span>₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="font-semibold text-gray-600">Tax Rate</span>
                                <span>{(taxRate * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between py-2 font-bold text-lg bg-gray-100 px-2 rounded">
                                <span className="text-gray-800">Total</span>
                                <span className="text-gray-800">₹{balanceDue.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between py-2 font-bold text-lg text-blue-800">
                                <span >Balance Due</span>
                                <span >₹{balanceDue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <footer className="mt-16">
                        <p className="text-sm text-gray-500 mb-4">Thanks for shopping with us.</p>
                        <h4 className="font-bold text-gray-700 text-sm mb-1">Terms & Conditions</h4>
                        <p className="text-xs text-gray-500">Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.</p>
                    </footer>
                </div>
                 {/* Decorative Footer */}
                 <div className="h-4 bg-gradient-to-r from-blue-500 to-cyan-400 print:hidden"></div>
            </div>
        </div>
    );
}
