'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import ThreeDPreview from '@/components/three-d-preview';
import { Button } from '@/components/ui/button';
import { Save, Share2, Camera } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ArViewModal from './ar-view-modal';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

export type FurnitureType = 'chair' | 'table' | 'cabinet' | 'shelf';

export interface Material {
  id: string;
  name: string;
  color: string;
}

export interface Configuration {
  furnitureType: FurnitureType;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  material: Material;
}

const initialConfiguration: Configuration = {
  furnitureType: 'chair',
  dimensions: {
    width: 1,
    height: 1.8,
    depth: 1,
  },
  material: {
    id: 'rigid-pvc',
    name: 'Rigid PVC',
    color: '#ffffff',
  },
};

const Configurator: FC = () => {
  const [config, setConfig] = useState<Configuration>(initialConfiguration);
  const [isArModalOpen, setArModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('aravalli-config-local');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error("Failed to load configuration from local storage", error);
    }
  }, []);

  useEffect(() => {
    // Save to local storage on every change for non-logged-in users or as a backup
    try {
        localStorage.setItem('aravalli-config-local', JSON.stringify(config));
    } catch (error) {
        console.error("Could not save configuration to local storage.", error);
    }
  }, [config]);


  const handleSave = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "Please log in to save your configurations.",
      });
      return;
    }
    
    try {
      const configurationsColRef = collection(firestore, `users/${user.uid}/configurations`);
      addDocumentNonBlocking(configurationsColRef, {
        ...config,
        userId: user.uid,
        configurationDate: new Date().toISOString(),
      });
      
      toast({
        title: "Configuration Saved",
        description: "Your furniture configuration has been saved to your account.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save configuration to your account.",
      });
    }
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('config', btoa(JSON.stringify(config)));
    navigator.clipboard.writeText(url.toString());
    toast({
      title: "Link Copied",
      description: "A shareable link has been copied to your clipboard.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 overflow-hidden">
        <div className="md:col-span-1 lg:col-span-1 h-full overflow-y-auto bg-card p-4 rounded-lg shadow-md">
          <Sidebar config={config} setConfig={setConfig} />
        </div>
        <div className="md:col-span-2 lg:col-span-3 h-full relative rounded-lg overflow-hidden shadow-inner bg-secondary/50">
          <ThreeDPreview config={config} />
        </div>
      </main>
      <footer className="bg-card border-t p-4 flex justify-center items-center gap-4">
        <Button onClick={() => setArModalOpen(true)}>
          <Camera />
          AR View
        </Button>
        <Button onClick={handleSave}>
          <Save />
          Save Configuration
        </Button>
        <Button onClick={handleShare}>
          <Share2 />
          Share
        </Button>
      </footer>
      <ArViewModal isOpen={isArModalOpen} onOpenChange={setArModalOpen} />
    </div>
  );
};

export default Configurator;
