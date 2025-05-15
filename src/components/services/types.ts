
import { ReactNode } from 'react';

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface BoatOrganization {
  id: number;
  title: string;
  description: string;
  image: string;
  icon: ReactNode;
  category: string;
}
