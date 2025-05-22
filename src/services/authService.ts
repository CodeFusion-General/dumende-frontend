import { BaseService } from './base/BaseService';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth.types';

class AuthService extends BaseService {
    constructor() {
        super('/auth');
    }

    public async register(data: RegisterRequest): Promise<AuthResponse> {
        return this.post<AuthResponse>('/register', data);
    }

    public async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await this.post<AuthResponse>('/login', data);
        if (response.token) {
            localStorage.setItem('token', response.token);
        }
        return response;
    }

    public async logout(): Promise<void> {
        await this.post<void>('/logout');
        localStorage.removeItem('token');
    }

    public async getCurrentUser(): Promise<User> {
        return this.get<User>('/user');
    }

    public async updateUser(data: Partial<User>): Promise<User> {
        return this.put<User>('/user', data);
    }

    public async deleteUser(): Promise<void> {
        await this.delete<void>('/user');
        localStorage.removeItem('token');
    }
}

export const authService = new AuthService();