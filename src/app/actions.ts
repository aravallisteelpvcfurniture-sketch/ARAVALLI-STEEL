'use server';

import { getMaterialSizeRecommendation, MaterialSizeRecommendationInput, MaterialSizeRecommendationOutput } from "@/ai/flows/material-size-recommendation";
import { z } from 'zod';
import { getFirestore, doc, collection, where, query, getDocs, writeBatch, getDoc } from 'firebase-admin/firestore';
import { initializeAdminApp } from "@/firebase/admin";
import type { Invoice, Party } from "@/models/types";

type RecommendationState = {
    status: 'idle' | 'loading' | 'success' | 'error';
    data?: MaterialSizeRecommendationOutput;
    error?: string;
}

const formSchema = z.object({
    projectDescription: z.string(),
    pastProjects: z.string().optional(),
});


export async function getMaterialSizeRecommendationAction(
    prevState: RecommendationState,
    formData: FormData
): Promise<RecommendationState> {
    const parsed = formSchema.safeParse({
        projectDescription: formData.get('projectDescription'),
        pastProjects: formData.get('pastProjects'),
    });

    if (!parsed.success) {
        return { status: 'error', error: 'Invalid form data.' };
    }
    
    const input: MaterialSizeRecommendationInput = {
        projectDescription: parsed.data.projectDescription,
        pastProjects: parsed.data.pastProjects ? parsed.data.pastProjects.split('\n').filter(p => p.trim() !== '') : [],
    };
    
    try {
        const result = await getMaterialSizeRecommendation(input);
        return { status: 'success', data: result };
    } catch (e) {
        return { status: 'error', error: e instanceof Error ? e.message : 'An unknown error occurred.' };
    }
}

export async function deletePartyAndInvoices(userId: string, partyId: string) {
    if (!userId || !partyId) {
        return { success: false, error: 'User ID and Party ID are required.' };
    }
    
    try {
        const { firestore } = await initializeAdminApp();
        
        const batch = writeBatch(firestore);
        
        // 1. Delete the party document
        const partyRef = doc(firestore, `users/${userId}/parties/${partyId}`);
        batch.delete(partyRef);

        // 2. Find and delete all invoices associated with the party
        const invoicesRef = collection(firestore, `users/${userId}/invoices`);
        const invoicesQuery = query(invoicesRef, where('partyId', '==', partyId));
        const invoicesSnapshot = await getDocs(invoicesQuery);
        
        invoicesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Commit the batch
        await batch.commit();

        return { success: true };
    } catch (error) {
        console.error('Error deleting party and invoices:', error);
        return { success: false, error: 'Failed to delete party and associated data.' };
    }
}

export async function getInvoiceForSharing(userId: string, invoiceId: string): Promise<{ invoice: Invoice | null; party: Party | null; error?: string }> {
    if (!userId || !invoiceId) {
        return { invoice: null, party: null, error: 'Invalid parameters.' };
    }

    try {
        const { firestore } = await initializeAdminApp();

        // Fetch invoice
        const invoiceRef = doc(firestore, `users/${userId}/invoices/${invoiceId}`);
        const invoiceSnap = await getDoc(invoiceRef);

        if (!invoiceSnap.exists()) {
            return { invoice: null, party: null, error: 'Invoice not found.' };
        }
        const invoice = { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;

        // Fetch party
        const partyRef = doc(firestore, `users/${userId}/parties/${invoice.partyId}`);
        const partySnap = await getDoc(partyRef);

        if (!partySnap.exists()) {
            return { invoice: invoice, party: null, error: 'Party not found.' };
        }
        const party = { id: partySnap.id, ...partySnap.data() } as Party;

        return { invoice, party };

    } catch (error) {
        console.error("Error fetching invoice for sharing:", error);
        return { invoice: null, party: null, error: 'Could not fetch invoice data.' };
    }
}
