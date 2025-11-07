'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BottomNavbar from '@/components/bottom-navbar';

export default function AddPartyPage() {
    const router = useRouter();

    const handleSaveParty = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically save the party details
        // For now, we'll just navigate to the create invoice page
        router.push('/invoice/create');
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-headline text-primary">Add New Party</h1>
                <div className="w-10"></div>
            </header>
            <main className="flex-1 p-4 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Party Details</CardTitle>
                        <CardDescription>Fill in the details for the new party.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSaveParty}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Enter party name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input id="mobile" type="tel" placeholder="Enter mobile number" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input id="email" type="email" placeholder="Enter email address" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address (Optional)</Label>
                                <Textarea id="address" placeholder="Enter full address" />
                            </div>
                            <Button type="submit" className="w-full">Save Party & Add Items</Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
            <BottomNavbar />
        </div>
    );
}
