'use client';

import { useEffect, useState } from 'react';
import type { Invoice, Party } from '@/models/types';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AravalliLogo = () => (
    <svg width="80" height="80" viewBox="0 0 100 100" className="text-primary">
        <path fill="currentColor" d="M50 0L61.8 18.2L80.9 20.6L68.4 35.4L73.6 54.5L50 45.5L26.4 54.5L31.6 35.4L19.1 20.6L38.2 18.2L50 0Z" />
        <path fill="currentColor" d="M50 60L61.8 78.2L80.9 80.6L68.4 95.4L73.6 114.5L50 105.5L26.4 114.5L31.6 95.4L19.1 80.6L38.2 78.2L50 60Z" opacity="0.6" />
    </svg>
);


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
                            <th className="p-3 text-center w-24">Qty</th>
                            <th className="p-3 text-center w-24">Per Kg</th>
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
                                <td className="p-3 text-center">{item.qty}</td>
                                <td className="p-3 text-center">{item.perKg > 0 ? item.perKg : '-'}</td>
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
};


export default function PrintAllInvoicesPage() {
    const [data, setData] = useState<{ party: Party; invoices: Invoice[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('printData');
            if (storedData) {
                setData(JSON.parse(storedData));
                // Optional: remove the data from localStorage after reading
                // localStorage.removeItem('printData');
            }
        } catch (error) {
            console.error("Failed to parse print data from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && data) {
            // Delay print to allow content to render
            const timer = setTimeout(() => {
                window.print();
            }, 1000); 
            return () => clearTimeout(timer);
        }
    }, [isLoading, data]);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <Loader className="animate-spin text-primary h-10 w-10" />
                <p className="ml-4 text-lg">Preparing Invoices for Printing...</p>
            </div>
        );
    }
    
    if (!data) {
        return (
           <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100 dark:bg-gray-900">
               <p className="text-xl font-semibold text-red-600">No data found for printing.</p>
               <p className="text-gray-500">Please go back and try again.</p>
           </div>
       );
   }

    return (
        <div className="bg-white">
            {data.invoices.map((invoice, index) => (
                <div key={invoice.id} className="page-break-after">
                    <InvoiceContent invoice={invoice} party={data.party} />
                </div>
            ))}
            <style jsx global>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page-break-after {
                        page-break-after: always;
                    }
                }
            `}</style>
        </div>
    );
}
