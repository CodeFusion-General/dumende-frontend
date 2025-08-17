import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenUtils } from "./utils";

class HttpClient {
  private static instance: HttpClient;
  private api: AxiosInstance;

  private constructor() {
    // Use environment variable for API base URL, fallback to /api for development proxy
    const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
    const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000");
    
    this.api = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Cookie'leri otomatik gönder
    });

    this.setupInterceptors();
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor - JWT token'ı otomatik header'a ekle
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenUtils.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Token expiry ve error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Check if this is a public endpoint that doesn't require auth
          const requestUrl = error.config?.url || '';
          const publicEndpoints = ['/boats', '/tours', '/auth/register', '/auth/login'];
          const isPublicEndpoint = publicEndpoints.some(endpoint => 
            requestUrl.includes(endpoint) && !requestUrl.includes('/my-') && !requestUrl.includes('/owner')
          );
          
          // Only redirect if this is not a public endpoint or if we have auth token
          if (!isPublicEndpoint || tokenUtils.hasAuthToken()) {
            // Token expired veya invalid - auth verilerini temizle
            tokenUtils.clearAllAuthData();
            
            // Only redirect if we're not already on auth page
            const currentPath = window.location.pathname;
            const currentSearch = window.location.search;
            
            if (!currentSearch.includes('auth=true')) {
              if (currentPath.startsWith('/captain') || currentPath.startsWith('/admin')) {
                window.location.href = "/?auth=true";
              } else if (currentPath !== '/') {
                window.location.href = "/?auth=true";
              }
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export const httpClient = HttpClient.getInstance().getAxiosInstance();
