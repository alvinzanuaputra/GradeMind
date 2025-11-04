import { apiClient } from "@/lib/api-client";
import {
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types";

export const profileService = {
  getProfile: async (): Promise<ProfileResponse> => {
    return apiClient.get<ProfileResponse>("/api/profile/me");
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    return apiClient.put<ProfileResponse>("/api/profile/me", data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/api/profile/me/change-password", data);
  },

  uploadProfilePhoto: async (file: File): Promise<{ message: string; photo_url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    
    return apiClient.uploadFile<{ message: string; photo_url: string }>(
      "/api/profile/me/upload-photo",
      formData
    );
  },
};

