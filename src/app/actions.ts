'use server';

import { getMaterialSizeRecommendation, MaterialSizeRecommendationInput, MaterialSizeRecommendationOutput } from "@/ai/flows/material-size-recommendation";
import { z } from 'zod';
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

export async function getInvoiceForSharing(userId: string, invoiceId: string): Promise<{ invoice: Invoice | null; party: Party | null; error?: string }> {
     // This function is no longer using firebase-admin and will be handled client-side
     // with updated security rules. This function body can be removed or left as is.
     // For safety, returning an error to indicate it should not be used.
     return { invoice: null, party: null, error: "This server action is deprecated." };
}
