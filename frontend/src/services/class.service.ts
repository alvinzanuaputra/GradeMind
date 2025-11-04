import { apiClient } from "@/lib/api-client";
import {
	CreateClassRequest,
	UpdateClassRequest,
	JoinClassRequest,
	ClassResponse,
	ClassDetailResponse,
	InviteCodeResponse,
} from "@/types";

export const classService = {
	createClass: async (data: CreateClassRequest): Promise<ClassResponse> => {
		return apiClient.post<ClassResponse>("/api/classes", data);
	},

	searchClasses: async (query: string): Promise<ClassResponse[]> => {
		return apiClient.get<ClassResponse[]>(
			`/api/classes/search?query=${encodeURIComponent(query)}`
		);
	},

	getAllClasses: async (): Promise<ClassResponse[]> => {
		return apiClient.get<ClassResponse[]>("/api/classes");
	},

	getClassDetails: async (classId: number): Promise<ClassDetailResponse> => {
		return apiClient.get<ClassDetailResponse>(`/api/classes/${classId}`);
	},

	updateClass: async (
		classId: number,
		data: UpdateClassRequest
	): Promise<ClassResponse> => {
		return apiClient.put<ClassResponse>(`/api/classes/${classId}`, data);
	},

	deleteClass: async (classId: number): Promise<void> => {
		return apiClient.delete<void>(`/api/classes/${classId}`);
	},

	joinClass: async (
		data: JoinClassRequest
	): Promise<{ message: string; class_id: number }> => {
		return apiClient.post<{ message: string; class_id: number }>(
			"/api/classes/join",
			data
		);
	},

	getInviteCode: async (classId: number): Promise<InviteCodeResponse> => {
		return apiClient.post<InviteCodeResponse>(
			`/api/classes/${classId}/invite`,
			{}
		);
	},

	removeParticipant: async (
		classId: number,
		userId: number
	): Promise<void> => {
		return apiClient.delete<void>(
			`/api/classes/${classId}/participants/${userId}`
		);
	},
};
