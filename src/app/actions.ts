'use server';

import { getMaterialSizeRecommendation, MaterialSizeRecommendationInput, MaterialSizeRecommendationOutput } from "@/ai/flows/material-size-recommendation";
import { z } from 'zod';
import { getFirestore, doc, collection, where, query, getDocs, writeBatch, getDoc, deleteDoc } from 'firebase-admin/firestore';
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
     // This function is no longer using firebase-admin and will be handled client-side
     // with updated security rules. This function body can be removed or left as is.
     // For safety, returning an error to indicate it should not be used.
     return { invoice: null, party: null, error: "This server action is deprecated." };
}
