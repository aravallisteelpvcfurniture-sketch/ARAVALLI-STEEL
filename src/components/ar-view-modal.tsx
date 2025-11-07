'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera } from 'lucide-react';
import type { FC } from 'react';

interface ArViewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const ArViewModal: FC<ArViewModalProps> = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Camera /> Augmented Reality View
          </DialogTitle>
          <DialogDescription className="font-body">
            This feature will allow you to place the configured furniture in your own space using your device's camera.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center font-body">
            <p className="font-semibold text-lg text-accent">Coming Soon!</p>
            <p className="text-muted-foreground">We are working hard to bring this feature to you.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArViewModal;
