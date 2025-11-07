'use client';
import type { Dispatch, SetStateAction, FC } from 'react';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { getMaterialSizeRecommendationAction } from '@/app/actions';
import type { Configuration } from './configurator';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    projectDescription: z.string().min(10, 'Please provide a more detailed description.'),
    pastProjects: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AiRecommendationsProps {
  setConfig: Dispatch<SetStateAction<Configuration>>;
}

const AiRecommendations: FC<AiRecommendationsProps> = ({ setConfig }) => {
    const [state, formAction] = useActionState(getMaterialSizeRecommendationAction, { status: 'idle' });
    const { toast } = useToast();
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectDescription: '',
            pastProjects: '',
        },
    });

    const applyRecommendation = () => {
        if (state.status === 'success' && state.data) {
            const { recommendedDimensions } = state.data;
            const dims = recommendedDimensions.match(/(\d+(\.\d+)?)/g);
            if (dims && dims.length === 3) {
                setConfig(prev => ({
                    ...prev,
                    dimensions: {
                        height: parseFloat(dims[0]),
                        width: parseFloat(dims[1]),
                        depth: parseFloat(dims[2]),
                    }
                }));
                toast({
                    title: 'Dimensions Applied',
                    description: 'The AI recommended dimensions have been applied to your model.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Application Failed',
                    description: 'Could not parse dimensions from AI recommendation.',
                });
            }
        }
    }
    
    useEffect(() => {
        if(state.status === 'error') {
            toast({
                variant: "destructive",
                title: "AI Recommendation Failed",
                description: state.error,
            });
        }
    }, [state, toast]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-headline">AI-Powered Recommendations</h2>
            <p className="text-sm text-muted-foreground font-body">
                Describe your project, and our AI will suggest the best materials and dimensions for you.
            </p>
            <Form {...form}>
                <form action={formAction} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="projectDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., A modern coffee table for a small living room, needs to be durable and easy to clean." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="pastProjects"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Similar Past Projects (optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Built a set of outdoor chairs last year." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        <Bot />
                        Get Recommendation
                    </Button>
                </form>
            </Form>
            
            {state.status === 'loading' && <p>Getting recommendations...</p>}

            {state.status === 'success' && state.data && (
                <Card className="mt-4 bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                           <Bot /> AI Recommendation
                        </CardTitle>
                        <CardDescription>Based on your project description.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 font-body">
                        <div>
                            <p className="font-semibold">Recommended Material:</p>
                            <p>{state.data.recommendedMaterial}</p>
                        </div>
                         <div>
                            <p className="font-semibold">Recommended Dimensions:</p>
                            <p>{state.data.recommendedDimensions}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Considerations:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {state.data.considerations.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={applyRecommendation}><Wand2/> Apply Dimensions</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}

export default AiRecommendations;
