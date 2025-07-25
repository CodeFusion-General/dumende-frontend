import { BaseService } from '@/services/base/BaseService';
import {
  CaptainProfile,
  PersonalInfoFormData,
  ProfessionalInfoFormData,
  PersonalInfo,
  ProfessionalInfo,
  CaptainStatistics
} from '@/types/profile.types';

class CaptainProfileService extends BaseService {
  constructor() {
    super('/captain/profile');
  }

  // Get complete captain profile
  async getCaptainProfile(): Promise<CaptainProfile> {
    return this.get('');
  }

  // Get captain profile by ID (for public viewing)
  async getCaptainProfileById(userId: number): Promise<CaptainProfile> {
    return this.get(`/${userId}`);
  }

  // Get personal info only
  async getPersonalInfo(): Promise<PersonalInfo> {
    return this.get('/personal-info');
  }

  // Update personal info
  async updatePersonalInfo(data: PersonalInfoFormData): Promise<PersonalInfo> {
    return this.put('/personal-info', data);
  }

  // Get professional info only
  async getProfessionalInfo(): Promise<ProfessionalInfo> {
    return this.get('/professional-info');
  }

  // Update professional info
  async updateProfessionalInfo(data: ProfessionalInfoFormData): Promise<ProfessionalInfo> {
    return this.put('/professional-info', data);
  }

  // Get statistics only
  async getStatistics(): Promise<CaptainStatistics> {
    return this.get('/statistics');
  }

  // Upload profile photo
  async uploadProfilePhoto(file: File): Promise<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.upload('/photo', formData);
  }

  // Remove profile photo
  async removeProfilePhoto(): Promise<void> {
    return this.delete('/photo');
  }

  // Get profile photo
  async getProfilePhoto(userId: number): Promise<Blob> {
    const response = await this.api.get(`/photo/${userId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const captainProfileService = new CaptainProfileService();
