import { apiClient } from "@/lib/api-client";
import { OCRResultRead } from "@/types";

export const ocrService = {
  uploadPDF: async (file: File): Promise<OCRResultRead> => {
    const formData = new FormData();
    formData.append("file", file);
    
    return apiClient.uploadFile<OCRResultRead>("/api/ocr/upload", formData);
  },

  getLatestResult: async (): Promise<OCRResultRead> => {
    return apiClient.get<OCRResultRead>("/api/ocr/result");
  },
};

