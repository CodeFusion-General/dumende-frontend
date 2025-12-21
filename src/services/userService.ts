import { BaseService } from "./base/BaseService";
import {
  UserDTO,
  CreateUserCommand,
  UpdateUserCommand,
  UserQuery,
  UserFilters,
} from "@/types/contact.types";

class UserService extends BaseService {
  constructor() {
    // axios baseURL zaten /api - duplicate /api önlendi
    super("/users");
  }

  public async getUsers(filters?: UserFilters): Promise<UserDTO[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    // Backend: GET /api/users/
    return this.get<UserDTO[]>(`${queryString ? '?' + queryString : ''}`);
  }

  public async getUserById(id: number): Promise<UserDTO> {
    // Backend: GET /api/users/{id}
    return this.get<UserDTO>(`/${id}`);
  }

  // ✅ DÜZELT: Backend POST endpoint kullanıyor, GET değil
  public async getUsersByQuery(query: UserQuery): Promise<UserDTO[]> {
    // Backend: POST /api/users/query (UserQuery request body)
    return this.post<UserDTO[]>("/query", query);
  }

  public async createUser(data: CreateUserCommand): Promise<UserDTO> {
    return this.post<UserDTO>("", data);
  }

  public async updateUser(data: UpdateUserCommand): Promise<UserDTO> {
    return this.put<UserDTO>(`/${data.id}`, data);
  }

  public async deleteUser(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  // ❌ DEPRECATED: Backend'de bu endpoint'ler YOK
  // UserDTO zaten nested olarak bookings, reviews, boats içeriyor
  // Kullanım: const user = await userService.getUserById(userId); user.bookings

  /*
  public async getUserBookings(userId: number): Promise<UserDTO> {
    return this.get<UserDTO>(`/${userId}/bookings`);
  }

  public async getUserReviews(userId: number): Promise<UserDTO> {
    return this.get<UserDTO>(`/${userId}/reviews`);
  }

  public async getUserBoats(userId: number): Promise<UserDTO> {
    return this.get<UserDTO>(`/${userId}/boats`);
  }
  */

  // ✅ ALTERNATİF: UserDTO'dan nested data kullan
  public async getUserWithDetails(userId: number): Promise<UserDTO> {
    // UserDTO zaten bookings, reviews, boats içeriyor
    return this.getUserById(userId);
  }

  public async uploadProfileImage(
    userId: number,
    file: File
  ): Promise<UserDTO> {
    return this.uploadFile<UserDTO>(`/${userId}/profile-image`, file);
  }

  // Pagination support
  public async getUsersPaginated(
    filters?: UserFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ) {
    return this.getPaginated<UserDTO>("/paginated", filters);
  }
}

export const userService = new UserService();
