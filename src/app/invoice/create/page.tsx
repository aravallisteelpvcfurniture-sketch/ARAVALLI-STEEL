'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle, Trash2, Loader } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNavbar from '@/components/bottom-navbar';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface Item {
  id: number;
  product: string;
  qty: number;
  rate: number;
  total: number;
}

export default function CreateInvoicePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const partyId = searchParams.get('partyId');
    
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [items, setItems] = useState<Item[]>([]);
    const [product, setProduct] = useState('');
    const [qty, setQty] = useState(1);
    const [rate, setRate] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddItem = () => {
        if (!product || qty <= 0 || rate <= 0) {
             toast({
                variant: 'destructive',
                title: 'Invalid Item',
                description: 'Please fill in all item details correctly.',
            });
            return;
        }
        const newItem: Item = {
            id: Date.now(),
            product,
            qty,
            rate,
            total: qty * rate,
        };
        setItems([...items, newItem]);
        // Reset form
        setProduct('');
        setQty(1);
        setRate(0);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const grandTotal = items.reduce((acc, item) => acc + item.total, 0);

    const handleSaveBill = async () => {
        if (!user || !firestore || !partyId) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Cannot save bill. User or party not found.',
            });
            return;
        }
        if (items.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Empty Bill',
                description: 'Please add at least one item to the bill.',
            });
            return;
        }

        setIsLoading(true);

        const invoiceData = {
            userId: user.uid,
            partyId,
            items: items.map(({ id, ...rest }) => rest), // Remove client-side id
            grandTotal,
            createdAt: new Date().toISOString(),
        };

        try {
            const invoicesColRef = collection(firestore, `users/${user.uid}/invoices`);
            addDocumentNonBlocking(invoicesColRef, invoiceData);
            
            toast({
                title: 'Invoice Saved',
                description: 'The invoice has been saved successfully.',
            });

            router.push('/invoice');
        } catch (error) {
            console.error("Error saving invoice: ", error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not save the invoice. Please try again.',
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-headline text-primary">Create Invoice</h1>
                <div className="w-10"></div>
            </header>
            <main className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-6">
                    {/* Add Item Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="product">Product</Label>
                                <Input id="product" placeholder="Enter product name" value={product} onChange={e => setProduct(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="qty">Quantity</Label>
                                    <Input id="qty" type="number" placeholder="0" value={qty} onChange={e => setQty(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rate">Rate</Label>
                                    <Input id="rate" type="number" placeholder="0.00" value={rate} onChange={e => setRate(Number(e.target.value))} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleAddItem} className="w-full">
                                <PlusCircle className="mr-2" />
                                Add Item
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Items List */}
                    {items.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Bill Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-center">Rate</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.product}</TableCell>
                                                <TableCell className="text-center">{item.qty}</TableCell>
                                                <TableCell className="text-center">₹{item.rate.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">₹{item.total.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <div className="text-right">
                                        <p className="text-muted-foreground">Grand Total</p>
                                        <p className="text-2xl font-bold">₹{grandTotal.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg" onClick={handleSaveBill} disabled={isLoading}>
                                    {isLoading ? <Loader className="animate-spin" /> : 'Save Bill'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </main>
            <BottomNavbar />
        </div>
    );
}
