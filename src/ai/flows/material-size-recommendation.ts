'use server';
/**
 * @fileOverview AI-powered material and size recommendation flow for PVC furniture configuration.
 *
 * - getMaterialSizeRecommendation - A function that handles the recommendation process.
 * - MaterialSizeRecommendationInput - The input type for the getMaterialSizeRecommendation function.
 * - MaterialSizeRecommendationOutput - The return type for the getMaterialSizeRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaterialSizeRecommendationInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('The description of the furniture project, including intended use, style, and environment.'),
  pastProjects: z.array(z.string()).optional().describe('List of descriptions of similar past projects, if any.'),
});
export type MaterialSizeRecommendationInput = z.infer<typeof MaterialSizeRecommendationInputSchema>;

const MaterialSizeRecommendationOutputSchema = z.object({
  recommendedMaterial: z.string().describe('The recommended PVC material for the project.'),
  recommendedDimensions: z.string().describe('The recommended dimensions (height, width, depth) for the furniture piece.'),
  considerations: z.array(z.string()).describe('List of key considerations for the recommendation.'),
});
export type MaterialSizeRecommendationOutput = z.infer<typeof MaterialSizeRecommendationOutputSchema>;

export async function getMaterialSizeRecommendation(input: MaterialSizeRecommendationInput): Promise<MaterialSizeRecommendationOutput> {
  return materialSizeRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'materialSizeRecommendationPrompt',
  input: {schema: MaterialSizeRecommendationInputSchema},
  output: {schema: MaterialSizeRecommendationOutputSchema},
  prompt: `You are an AI assistant that recommends suitable PVC materials and dimensions for furniture projects.

  Based on the project description and past project details, provide a recommendation for material and dimensions, as well as key considerations.

  Project Description: {{{projectDescription}}}
  {{~#if pastProjects}}
  Past Projects:
  {{~#each pastProjects}}- {{{this}}}
  {{~/each}}
  {{~else}}
  No past projects provided.
  {{~/if}}
  `,
});

const materialSizeRecommendationFlow = ai.defineFlow(
  {
    name: 'materialSizeRecommendationFlow',
    inputSchema: MaterialSizeRecommendationInputSchema,
    outputSchema: MaterialSizeRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
