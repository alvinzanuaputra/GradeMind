import { apiClient } from "@/lib/api-client";
import {
	UserCreate,
	LoginRequest,
	LoginResponse,
	RegisterResponse,
	User,
} from "@/types";

export const authService = {
	register: async (data: UserCreate): Promise<RegisterResponse> => {
		return apiClient.post<RegisterResponse>("/api/auth/register", data);
	},

	login: async (data: LoginRequest): Promise<LoginResponse> => {
		return apiClient.post<LoginResponse>("/api/auth/login", data);
	},

	getCurrentUser: async (): Promise<User> => {
		return apiClient.get<User>("/api/auth/me");
	},

	logout: async (token: string): Promise<{ message: string }> => {
		return apiClient.post<{ message: string }>("/api/auth/logout", {
			token,
		});
	},
};
