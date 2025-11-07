'use client';

import type { FC, Dispatch, SetStateAction } from 'react';
import type { Configuration, FurnitureType } from './configurator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import AiRecommendations from './ai-recommendations';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

interface SidebarProps {
  config: Configuration;
  setConfig: Dispatch<SetStateAction<Configuration>>;
}

const colors = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Oak Brown', value: '#8B4513' },
  { name: 'Charcoal Grey', value: '#36454F' },
  { name: 'Teak Wood', value: '#B8860B' },
  { name: 'Cream', value: '#FFFDD0' },
];

const Sidebar: FC<SidebarProps> = ({ config, setConfig }) => {
  const handleDimensionChange = (dim: 'width' | 'height' | 'depth', value: number) => {
    setConfig(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dim]: value }
    }));
  };

  const handleMaterialColorChange = (color: string) => {
    setConfig(prev => ({
      ...prev,
      material: { ...prev.material, color }
    }));
  };
  
  const handleFurnitureTypeChange = (type: FurnitureType) => {
    setConfig(prev => ({ ...prev, furnitureType: type }));
  }

  return (
    <Tabs defaultValue="furniture" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="furniture">Item</TabsTrigger>
        <TabsTrigger value="customize">Customize</TabsTrigger>
        <TabsTrigger value="ai">AI Help</TabsTrigger>
      </TabsList>
      <TabsContent value="furniture" className="mt-4">
        <div className="space-y-4">
          <Label className="text-lg font-headline">Select Furniture</Label>
          <RadioGroup 
            value={config.furnitureType} 
            onValueChange={(value) => handleFurnitureTypeChange(value as FurnitureType)}
            className="grid grid-cols-2 gap-4"
          >
            {PlaceHolderImages.map(item => (
              <Label key={item.id} htmlFor={item.id} className="cursor-pointer rounded-lg border-2 border-transparent has-[:checked]:border-primary p-2 transition-all hover:bg-secondary">
                <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                <Image 
                  src={item.imageUrl} 
                  alt={item.description}
                  width={150}
                  height={150}
                  data-ai-hint={item.imageHint}
                  className="w-full h-auto rounded-md object-cover aspect-square"
                />
                <p className="text-center font-body mt-2 text-sm capitalize">{item.id}</p>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </TabsContent>
      <TabsContent value="customize" className="mt-4 space-y-6">
        <div>
          <Label className="text-lg font-headline">Dimensions (meters)</Label>
          <div className="space-y-4 mt-2">
            {Object.keys(config.dimensions).map(dim => (
              <div key={dim} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor={dim} className="capitalize font-body">{dim}</Label>
                  <Input 
                    id={dim} 
                    type="number" 
                    value={config.dimensions[dim as keyof typeof config.dimensions]} 
                    onChange={(e) => handleDimensionChange(dim as any, parseFloat(e.target.value))}
                    className="w-24 h-8"
                    step="0.1"
                  />
                </div>
                <Slider
                  value={[config.dimensions[dim as keyof typeof config.dimensions]]}
                  onValueChange={([val]) => handleDimensionChange(dim as any, val)}
                  min={0.2}
                  max={3}
                  step={0.1}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-lg font-headline">Material Color</Label>
           <div className="flex flex-wrap gap-2 mt-2">
            {colors.map(color => (
              <button
                key={color.value}
                title={color.name}
                onClick={() => handleMaterialColorChange(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${config.material.color === color.value ? 'border-primary scale-110 ring-2 ring-primary ring-offset-2' : 'border-transparent'}`}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="ai" className="mt-4">
        <AiRecommendations setConfig={setConfig} />
      </TabsContent>
    </Tabs>
  );
};

export default Sidebar;
