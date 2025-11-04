import { apiClient } from "@/lib/api-client";
import {
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  SubmitAnswerRequest,
  AssignmentResponse,
  AssignmentDetailResponse,
  SubmissionResponse,
  MySubmissionResponse,
} from "@/types";

export const assignmentService = {
  createAssignment: async (data: CreateAssignmentRequest): Promise<AssignmentResponse> => {
    return apiClient.post<AssignmentResponse>("/api/assignments", data);
  },

  getClassAssignments: async (classId: number): Promise<AssignmentResponse[]> => {
    return apiClient.get<AssignmentResponse[]>(`/api/assignments/class/${classId}`);
  },

  getAssignmentDetails: async (assignmentId: number): Promise<AssignmentDetailResponse> => {
    return apiClient.get<AssignmentDetailResponse>(`/api/assignments/${assignmentId}`);
  },

  updateAssignment: async (
    assignmentId: number,
    data: UpdateAssignmentRequest
  ): Promise<AssignmentResponse> => {
    return apiClient.put<AssignmentResponse>(`/api/assignments/${assignmentId}`, data);
  },

  deleteAssignment: async (assignmentId: number): Promise<void> => {
    return apiClient.delete<void>(`/api/assignments/${assignmentId}`);
  },

  submitTypedAnswer: async (
    assignmentId: number,
    data: SubmitAnswerRequest
  ): Promise<{ message: string; submission_id: number }> => {
    return apiClient.post<{ message: string; submission_id: number }>(
      `/api/assignments/${assignmentId}/submit/typing`,
      data
    );
  },

  submitOCRAnswer: async (
    assignmentId: number,
    file: File
  ): Promise<{ message: string; submission_id: number; extracted_text: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.uploadFile<{
      message: string;
      submission_id: number;
      extracted_text: string;
    }>(`/api/assignments/${assignmentId}/submit/ocr`, formData);
  },

  getAssignmentSubmissions: async (assignmentId: number): Promise<SubmissionResponse[]> => {
    return apiClient.get<SubmissionResponse[]>(`/api/assignments/${assignmentId}/submissions`);
  },

  getMySubmission: async (assignmentId: number): Promise<MySubmissionResponse> => {
    return apiClient.get<MySubmissionResponse>(`/api/assignments/${assignmentId}/my-submission`);
  },

  cancelMySubmission: async (assignmentId: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/assignments/${assignmentId}/my-submission`);
  },
};

