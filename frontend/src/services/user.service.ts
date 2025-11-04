import { apiClient } from "@/lib/api-client";
import { User, UserUpdate } from "@/types";

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export const userService = {
  getAllUsers: async (skip = 0, limit = 100): Promise<UserResponse[]> => {
    return apiClient.get<UserResponse[]>(`/api/users?skip=${skip}&limit=${limit}`);
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    return apiClient.get<UserResponse>("/api/users/me");
  },

  getUserById: async (userId: number): Promise<UserResponse> => {
    return apiClient.get<UserResponse>(`/api/users/${userId}`);
  },

  updateProfile: async (data: UserUpdate): Promise<User> => {
    return apiClient.patch<User>("/api/users/me", data);
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/users/${userId}`);
  },
};

