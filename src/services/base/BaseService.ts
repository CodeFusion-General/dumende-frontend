import { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { httpClient } from "@/lib/axios";

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  statusCode: number;
}

// Error response interface
export interface ApiError {
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  errors?: any[];
}

export abstract class BaseService {
  protected api: AxiosInstance;
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.api = httpClient;
    this.baseUrl = baseUrl;
  }

  protected async get<T>(url: string, params?: any): Promise<T> {
    try {
      const fullUrl = `${this.baseUrl}${url}`;
      const response: AxiosResponse<T> = await this.api.get(fullUrl, {
        params,
      });

      return response.data;
    } catch (error) {
      console.error("API GET Error:", `${this.baseUrl}${url}`, error);
      this.handleError(error);
      throw error;
    }
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(
        `${this.baseUrl}${url}`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(
        `${this.baseUrl}${url}`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected async patch<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.patch(
        `${this.baseUrl}${url}`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected async delete<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(
        `${this.baseUrl}${url}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // File upload support
  protected async uploadFile<T>(
    url: string,
    file: File,
    additionalData?: any
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
          formData.append(key, additionalData[key]);
        });
      }

      const response: AxiosResponse<T> = await this.api.post(
        `${this.baseUrl}${url}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Multiple file upload support
  protected async uploadMultipleFiles<T>(
    url: string,
    formData: FormData
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(
        `${this.baseUrl}${url}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Pagination support
  protected async getPaginated<T>(
    url: string,
    params?: {
      page?: number;
      size?: number;
      sort?: string;
      [key: string]: any;
    }
  ): Promise<{
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    try {
      const response = await this.api.get(`${this.baseUrl}${url}`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected handleError(error: any): void {
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = {
        message: error.response.data?.message || "Sunucu hatası",
        statusCode: error.response.status,
        timestamp: new Date().toISOString(),
        path: error.config?.url || "",
        errors: error.response.data?.errors || [],
      };

      console.error("API Error:", apiError);

      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          console.error("Unauthorized - Token invalid or expired");
          this.clearAuthToken();
          break;
        case 403:
          console.error("Forbidden: Insufficient permissions");
          break;
        case 404:
          console.error("API endpoint not found:", error.config?.url);
          break;
        case 500:
          console.error("Internal Server Error");
          break;
        default:
          console.error(
            `HTTP Error ${error.response.status}:`,
            apiError.message
          );
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.request);
      // Network hatası için token temizleme!
    } else {
      // Something else happened
      console.error("Request Error:", error.message);
    }
  }

  // Token temizleme method'u ekle
  private clearAuthToken(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    window.location.href = '/';
  }

  // Utility method for building query strings
  protected buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((item) => queryParams.append(key, item.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return queryParams.toString();
  }
}