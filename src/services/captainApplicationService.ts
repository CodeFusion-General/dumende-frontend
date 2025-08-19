import { BaseService } from "./base/BaseService";
import type {
  CaptainApplication,
  CaptainApplicationStatus,
  CreateCaptainApplicationRequest,
  CreateCaptainApplicationMultipartRequest,
  ReviewCaptainApplicationRequest,
} from "@/types/captain.types";

class CaptainApplicationService extends BaseService {
  constructor() {
    super("/captain-applications");
  }

  // JSON create
  async create(data: CreateCaptainApplicationRequest): Promise<CaptainApplication> {
    return this.post<CaptainApplication>("", data);
  }

  // Multipart create (dosyalar dahil)
  async createMultipart(data: CreateCaptainApplicationMultipartRequest): Promise<CaptainApplication> {
    const formData = new FormData();
    formData.append("userId", String(data.userId));
    formData.append("licenseNumber", data.licenseNumber);
    formData.append("licenseExpiry", data.licenseExpiry);
    formData.append("yearsOfExperience", String(data.yearsOfExperience));

    if (data.specializations) {
      data.specializations.forEach((s) => formData.append("specializations", s));
    }
    if (data.bio) formData.append("bio", data.bio);

    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((file) => formData.append("documents", file));
    }

    if (data.company) {
      const companyJson = typeof data.company === "string" ? data.company : JSON.stringify(data.company);
      formData.append("companyJson", companyJson);
    }

    // Contract approval bilgileri
    formData.append("contractApproved", String(data.contractApproved));
    formData.append("contractVersion", data.contractVersion);

    return this.uploadMultipleFiles<CaptainApplication>("/multipart", formData);
  }

  // Belge ekleme
  async uploadDocuments(applicationId: number, files: File[]): Promise<CaptainApplication> {
    const formData = new FormData();
    files.forEach((f) => formData.append("documents", f));
    return this.uploadMultipleFiles<CaptainApplication>(`/${applicationId}/documents`, formData);
  }

  // Admin: başvuruyu onayla/ret
  async review(applicationId: number, data: ReviewCaptainApplicationRequest): Promise<CaptainApplication> {
    return this.post<CaptainApplication>(`/${applicationId}/review`, data);
  }

  // Admin: listele (sayfalı)
  async list(params?: { status?: CaptainApplicationStatus; page?: number; size?: number }) {
    const query = this.buildQueryString({ ...params });
    const url = query ? `?${query}` : "";
    return this.getPaginated<CaptainApplication>(`${url}`);
  }

  // Admin: detay
  async getById(id: number): Promise<CaptainApplication> {
    return this.get<CaptainApplication>(`/${id}`);
  }

  // Kullanıcının son başvurusu
  async getMyLatest(): Promise<CaptainApplication | null> {
    try {
      return await this.get<CaptainApplication>(`/me/latest`);
    } catch (e: any) {
      // 404 vb. durumlarda null döndürmek istenirse buraya şart koyulabilir.
      throw e;
    }
  }
}

export const captainApplicationService = new CaptainApplicationService();


