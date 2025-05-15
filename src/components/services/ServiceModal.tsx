
import React from 'react';
import { LucideIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
}

const ServiceModal = ({ isOpen, onClose, title, description, Icon, color }: ServiceModalProps) => {
  // Extended description for the modal
  const extendedDescription = `${description} Our expert team ensures every detail is meticulously planned and executed to exceed your expectations. We prioritize safety, comfort, and creating memorable experiences that will last a lifetime. Contact us today to discuss how we can customize this service to perfectly match your needs and preferences.`;
  
  // Sample features for the selected service
  const features = [
    "Professional staff and equipment",
    "Flexible scheduling options",
    "Customizable packages",
    "Safety protocols and insurance",
    "Premium experience guarantee"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded", color)}>
              <Icon size={20} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            {extendedDescription}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2">
          <h4 className="font-semibold mb-2">Key Features:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="text-gray-700">{feature}</li>
            ))}
          </ul>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Close
          </Button>
          <Button>
            Book Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceModal;
