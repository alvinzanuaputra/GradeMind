import { apiClient } from "@/lib/api-client";
import {
  GradeSubmissionRequest,
  NilaiResponse,
  AutoGradeResponse,
  AutoGradeAllResponse,
  AssignmentStatisticsResponse,
  SubmissionDetailResponse,
  ExcelExportData,
} from "@/types";

export const gradingService = {
  gradeSubmission: async (
    submissionId: number,
    data: GradeSubmissionRequest
  ): Promise<{ message: string; nilai_id: number }> => {
    return apiClient.post<{ message: string; nilai_id: number }>(
      `/api/grading/submissions/${submissionId}/grade`,
      data
    );
  },

  autoGradeSubmission: async (submissionId: number): Promise<AutoGradeResponse> => {
    return apiClient.post<AutoGradeResponse>(
      `/api/grading/submissions/${submissionId}/auto-grade`,
      {}
    );
  },

  autoGradeAllSubmissions: async (assignmentId: number): Promise<AutoGradeAllResponse> => {
    return apiClient.post<AutoGradeAllResponse>(
      `/api/grading/assignments/${assignmentId}/auto-grade-all`,
      {}
    );
  },

  getAssignmentStatistics: async (assignmentId: number): Promise<AssignmentStatisticsResponse> => {
    return apiClient.get<AssignmentStatisticsResponse>(
      `/api/grading/assignments/${assignmentId}/statistics`
    );
  },

  getAssignmentGrades: async (assignmentId: number): Promise<NilaiResponse[]> => {
    return apiClient.get<NilaiResponse[]>(`/api/grading/assignments/${assignmentId}/grades`);
  },

  getStudentGrades: async (studentId: number): Promise<NilaiResponse[]> => {
    return apiClient.get<NilaiResponse[]>(`/api/grading/students/${studentId}/grades`);
  },

  getSubmissionDetails: async (submissionId: number): Promise<SubmissionDetailResponse> => {
    return apiClient.get<SubmissionDetailResponse>(`/api/grading/submissions/${submissionId}/details`);
  },

  getGradeById: async (gradeId: number): Promise<NilaiResponse> => {
    throw new Error("Not implemented - use getAssignmentGrades instead");
  },

  deleteGrade: async (submissionId: number): Promise<void> => {
    return apiClient.delete<void>(`/api/grading/submissions/${submissionId}/grade`);
  },

  getExcelExportData: async (assignmentId: number): Promise<ExcelExportData> => {
    return apiClient.get<ExcelExportData>(`/api/grading/assignments/${assignmentId}/export-data`);
  },
};

