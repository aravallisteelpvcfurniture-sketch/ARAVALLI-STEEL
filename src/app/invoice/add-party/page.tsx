'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import BottomNavbar from '@/components/bottom-navbar';


export default function AddPartyPage() {
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);


    const handleSaveParty = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to add a party.',
            });
            return;
        }

        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const partyData = {
            userId: user.uid,
            name: formData.get('name') as string,
            mobile: formData.get('mobile') as string,
            email: formData.get('email') as string,
            address: formData.get('address') as string,
            createdAt: new Date().toISOString(),
        };

        if (!partyData.name || !partyData.mobile) {
            toast({
                variant: 'destructive',
                title: 'Missing Details',
                description: 'Please fill in the party name and mobile number.',
            });
            setIsLoading(false);
            return;
        }

        try {
            const partiesColRef = collection(firestore, `users/${user.uid}/parties`);
            const docRefPromise = addDocumentNonBlocking(partiesColRef, partyData);
            
            toast({
                title: 'Party Saved',
                description: `${partyData.name} has been added.`,
            });
            
            const docRef = await docRefPromise;
            router.push(`/invoice/create?partyId=${docRef.id}`);

        } catch (error) {
            console.error("Error adding party: ", error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not save the party. Please try again.',
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
                                <Input id="name" name="name" placeholder="Enter party name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input id="mobile" name="mobile" type="tel" placeholder="Enter mobile number" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input id="email" name="email" type="email" placeholder="Enter email address" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address (Optional)</Label>
                                <Textarea id="address" name="address" placeholder="Enter full address" />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader className="animate-spin" /> : 'Save Party & Add Items'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
            <BottomNavbar />
        </div>
    );
}
