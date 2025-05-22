import { AxiosInstance, AxiosResponse } from 'axios';
import { httpClient } from '@/lib/axios';

export abstract class BaseService {
    protected api: AxiosInstance;
    protected baseUrl: string;

    constructor(baseUrl: string) {
        this.api = httpClient;
        this.baseUrl = baseUrl;
    }

    protected async get<T>(url: string, params?: any): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.get(`${this.baseUrl}${url}`, { params });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    protected async post<T>(url: string, data?: any): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.post(`${this.baseUrl}${url}`, data);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    protected async put<T>(url: string, data?: any): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.put(`${this.baseUrl}${url}`, data);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    protected async delete<T>(url: string): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api.delete(`${this.baseUrl}${url}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    protected handleError(error: any): void {
        console.error('API Error:', error);
        // Burada hata yönetimi için özel logik eklenebilir
        // Örneğin: Toast gösterimi, error tracking servisi entegrasyonu vb.
    }
} 