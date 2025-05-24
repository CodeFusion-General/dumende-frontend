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
    super("/users");
  }

  public async getUsers(filters?: UserFilters): Promise<UserDTO[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    return this.get<UserDTO[]>(`?${queryString}`);
  }

  public async getUserById(id: number): Promise<UserDTO> {
    return this.get<UserDTO>(`/${id}`);
  }

  public async getUsersByQuery(query: UserQuery): Promise<UserDTO[]> {
    const queryString = this.buildQueryString(query);
    return this.get<UserDTO[]>(`/search?${queryString}`);
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

  public async getUserBookings(userId: number): Promise<UserDTO> {
    return this.get<UserDTO>(`/${userId}/bookings`);
  }

  public async getUserReviews(userId: number): Promise<UserDTO> {
    return this.get<UserDTO>(`/${userId}/reviews`);
  }

  public async getUserBoats(userId: number): Promise<UserDTO> {
    return this.get<UserDTO>(`/${userId}/boats`);
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
