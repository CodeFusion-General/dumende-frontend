import { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { httpClient } from "@/lib/axios";
import { tokenUtils } from "@/lib/utils";

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
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second base delay

  constructor(baseUrl: string) {
    this.api = httpClient;
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = tokenUtils.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  protected async get<T>(url: string, params?: any): Promise<T> {
    return this.executeWithRetry(async () => {
      const fullUrl = `${this.baseUrl}${url}`;
      const response: AxiosResponse<T> = await this.api.get(fullUrl, {
        params,
        headers: this.getAuthHeaders(),
      });
      return response.data;
    }, `GET ${this.baseUrl}${url}`);
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<T> = await this.api.post(
        `${this.baseUrl}${url}`,
        data,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    }, `POST ${this.baseUrl}${url}`);
  }

  protected async put<T>(url: string, data?: any): Promise<T> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<T> = await this.api.put(
        `${this.baseUrl}${url}`,
        data,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    }, `PUT ${this.baseUrl}${url}`);
  }

  protected async patch<T>(url: string, data?: any): Promise<T> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<T> = await this.api.patch(
        `${this.baseUrl}${url}`,
        data,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    }, `PATCH ${this.baseUrl}${url}`);
  }

  protected async delete<T>(url: string): Promise<T> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<T> = await this.api.delete(
        `${this.baseUrl}${url}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    }, `DELETE ${this.baseUrl}${url}`);
  }

  // File upload support
  protected async uploadFile<T>(
    url: string,
    file: File,
    additionalData?: any
  ): Promise<T> {
    return this.executeWithRetry(async () => {
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
            ...this.getAuthHeaders(),
          },
        }
      );
      return response.data;
    }, `UPLOAD ${this.baseUrl}${url}`);
  }

  // Multiple file upload support
  protected async uploadMultipleFiles<T>(
    url: string,
    formData: FormData
  ): Promise<T> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<T> = await this.api.post(
        `${this.baseUrl}${url}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...this.getAuthHeaders(),
          },
        }
      );
      return response.data;
    }, `UPLOAD_MULTIPLE ${this.baseUrl}${url}`);
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
    return this.executeWithRetry(async () => {
      const response = await this.api.get(`${this.baseUrl}${url}`, {
        params,
        headers: this.getAuthHeaders(),
      });
      return response.data;
    }, `GET_PAGINATED ${this.baseUrl}${url}`);
  }

  // Retry logic for network and server errors
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`${operationName} - Attempt ${attempt} failed:`, error);

      // Check if error is retryable
      if (this.isRetryableError(error) && attempt < this.maxRetries) {
        const delay = this.calculateRetryDelay(attempt);
        console.log(
          `Retrying ${operationName} in ${delay}ms (attempt ${attempt + 1}/${
            this.maxRetries
          })`
        );

        await this.sleep(delay);
        return this.executeWithRetry(operation, operationName, attempt + 1);
      }

      // Handle error and throw
      this.handleError(error);
      throw error;
    }
  }

  // Check if error is retryable
  private isRetryableError(error: any): boolean {
    // Don't retry auth errors (401, 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      return false;
    }

    // Don't retry client errors (400-499) except for specific cases
    if (error.response?.status >= 400 && error.response?.status < 500) {
      // Retry on 408 (Request Timeout) and 429 (Too Many Requests)
      return error.response.status === 408 || error.response.status === 429;
    }

    // Retry on server errors (500-599)
    if (error.response?.status >= 500) {
      return true;
    }

    // Retry on network errors (no response)
    if (!error.response) {
      // Check for specific network error types
      const errorMessage = error.message?.toLowerCase() || "";
      return (
        errorMessage.includes("network") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("fetch") ||
        error.code === "NETWORK_ERROR" ||
        error.code === "TIMEOUT" ||
        error.code === "ECONNABORTED"
      );
    }

    return false;
  }

  // Calculate exponential backoff delay
  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s
    const baseDelay = this.retryDelay * Math.pow(2, attempt - 1);
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * baseDelay;
    return Math.min(baseDelay + jitter, 10000); // Cap at 10 seconds
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
          this.handleAuthorizationError(
            error,
            "Authentication failed. Please log in again."
          );
          break;
        case 403:
          console.error("Forbidden: Insufficient permissions");
          this.handleAuthorizationError(
            error,
            "You don't have permission to perform this action."
          );
          break;
        case 404:
          console.error("API endpoint not found:", error.config?.url);
          this.enhanceErrorWithUserMessage(
            error,
            "The requested resource was not found."
          );
          break;
        case 408:
          console.error("Request Timeout");
          this.enhanceErrorWithUserMessage(
            error,
            "Request timed out. Please try again."
          );
          break;
        case 429:
          console.error("Too Many Requests");
          this.enhanceErrorWithUserMessage(
            error,
            "Too many requests. Please wait a moment and try again."
          );
          break;
        case 500:
          console.error("Internal Server Error");
          this.enhanceErrorWithUserMessage(
            error,
            "Server error occurred. Please try again later."
          );
          break;
        case 502:
          console.error("Bad Gateway");
          this.enhanceErrorWithUserMessage(
            error,
            "Service temporarily unavailable. Please try again later."
          );
          break;
        case 503:
          console.error("Service Unavailable");
          this.enhanceErrorWithUserMessage(
            error,
            "Service is temporarily unavailable. Please try again later."
          );
          break;
        case 504:
          console.error("Gateway Timeout");
          this.enhanceErrorWithUserMessage(
            error,
            "Request timed out. Please try again."
          );
          break;
        default:
          console.error(
            `HTTP Error ${error.response.status}:`,
            apiError.message
          );
          this.enhanceErrorWithUserMessage(
            error,
            apiError.message || "An error occurred. Please try again."
          );
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error("Network Error:", error.request);
      this.handleNetworkError(error);
    } else {
      // Something else happened
      console.error("Request Error:", error.message);
      this.enhanceErrorWithUserMessage(
        error,
        "An unexpected error occurred. Please try again."
      );
    }
  }

  // Enhanced authorization error handling
  private handleAuthorizationError(error: any, userMessage: string): void {
    const statusCode = error.response?.status;

    // Create enhanced error with user-friendly message
    const enhancedError = new Error(userMessage);
    (enhancedError as any).statusCode = statusCode;
    (enhancedError as any).originalError = error;
    (enhancedError as any).isAuthError = true;

    // For 401 errors, clear auth data and redirect to login
    if (statusCode === 401) {
      this.clearAuthToken();

      // Delay redirect to allow error handling in components
      setTimeout(() => {
        // Only redirect if we're not already on the login page
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          // Store current path for redirect after login
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== "/") {
            localStorage.setItem("redirectAfterLogin", currentPath);
          }

          // Redirect to home page (which will show login)
          window.location.href = "/";
        }
      }, 100);
    }

    // For 403 errors, just throw the enhanced error for component handling
    if (statusCode === 403) {
      // Don't redirect, let the component handle the error
      throw enhancedError;
    }

    throw enhancedError;
  }

  // Handle network errors specifically
  private handleNetworkError(error: any): void {
    let userMessage =
      "Network error occurred. Please check your connection and try again.";

    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code;

    if (errorCode === "ECONNABORTED" || errorMessage.includes("timeout")) {
      userMessage =
        "Connection timed out. Please check your internet connection and try again.";
    } else if (
      errorMessage.includes("network") ||
      errorCode === "NETWORK_ERROR"
    ) {
      userMessage =
        "Network connection failed. Please check your internet connection.";
    } else if (errorMessage.includes("connection")) {
      userMessage = "Unable to connect to the server. Please try again later.";
    }

    this.enhanceErrorWithUserMessage(error, userMessage);
  }

  // Enhance error with user-friendly message
  private enhanceErrorWithUserMessage(error: any, userMessage: string): void {
    const enhancedError = new Error(userMessage);
    (enhancedError as any).statusCode = error.response?.status;
    (enhancedError as any).originalError = error;
    (enhancedError as any).isNetworkError = !error.response;
    (enhancedError as any).isServerError = error.response?.status >= 500;

    throw enhancedError;
  }

  // Token temizleme method'u ekle
  private clearAuthToken(): void {
    tokenUtils.clearAuthToken();
    tokenUtils.clearUserData();

    window.location.href = "/";
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
