import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	assignmentService,
} from "@/services";
import {
	CreateAssignmentRequest,
	UpdateAssignmentRequest,
	SubmitAnswerRequest,
} from "@/types";
import toast from "react-hot-toast";

export const assignmentKeys = {
	all: ["assignments"] as const,
	byClass: (classId: number) => ["assignments", "class", classId] as const,
	detail: (id: number) => ["assignments", id] as const,
	submissions: (id: number) => ["assignments", id, "submissions"] as const,
	mySubmission: (id: number) => ["assignments", id, "my-submission"] as const,
};

export function useClassAssignments(classId: number) {
	return useQuery({
		queryKey: assignmentKeys.byClass(classId),
		queryFn: () => assignmentService.getClassAssignments(classId),
		enabled: !!classId,
	});
}

export function useAssignmentDetail(assignmentId: number) {
	return useQuery({
		queryKey: assignmentKeys.detail(assignmentId),
		queryFn: () => assignmentService.getAssignmentDetails(assignmentId),
		enabled: !!assignmentId,
	});
}

export function useAssignmentSubmissions(assignmentId: number) {
	return useQuery({
		queryKey: assignmentKeys.submissions(assignmentId),
		queryFn: () => assignmentService.getAssignmentSubmissions(assignmentId),
		enabled: !!assignmentId,
	});
}

export function useMySubmission(assignmentId: number) {
	return useQuery({
		queryKey: assignmentKeys.mySubmission(assignmentId),
		queryFn: () => assignmentService.getMySubmission(assignmentId),
		enabled: !!assignmentId,
	});
}

export function useCreateAssignment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAssignmentRequest) =>
			assignmentService.createAssignment(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: assignmentKeys.byClass(variables.kelas_id),
			});
			toast.success("Tugas berhasil dibuat!");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal membuat tugas");
		},
	});
}

export function useUpdateAssignment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			assignmentId,
			data,
		}: {
			assignmentId: number;
			data: UpdateAssignmentRequest;
		}) => assignmentService.updateAssignment(assignmentId, data),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: assignmentKeys.detail(variables.assignmentId),
			});
			queryClient.invalidateQueries({
				queryKey: assignmentKeys.byClass(response.kelas_id),
			});
			toast.success("Tugas berhasil diperbarui!");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal memperbarui tugas");
		},
	});
}

// Delete assignment
export function useDeleteAssignment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (assignmentId: number) =>
			assignmentService.deleteAssignment(assignmentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
			toast.success("Tugas berhasil dihapus!");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal menghapus tugas");
		},
	});
}

export function useSubmitTypedAnswer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			assignmentId,
			data,
		}: {
			assignmentId: number;
			data: SubmitAnswerRequest;
		}) => assignmentService.submitTypedAnswer(assignmentId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: assignmentKeys.mySubmission(variables.assignmentId),
			});
			queryClient.invalidateQueries({
				queryKey: assignmentKeys.submissions(variables.assignmentId),
			});
			toast.success("Jawaban berhasil dikirim!");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal mengirim jawaban");
		},
	});
}

export function useSubmitOCRAnswer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			assignmentId,
			file,
		}: {
			assignmentId: number;
			file: File;
		}) => assignmentService.submitOCRAnswer(assignmentId, file),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: assignmentKeys.mySubmission(variables.assignmentId),
			});
			queryClient.invalidateQueries({
				queryKey: assignmentKeys.submissions(variables.assignmentId),
			});
			toast.success("File berhasil dikirim!");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal mengirim file");
		},
	});
}

export function useCancelSubmission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (assignmentId: number) =>
			assignmentService.cancelMySubmission(assignmentId),
		onSuccess: (_, assignmentId) => {
			queryClient.invalidateQueries({
				queryKey: assignmentKeys.mySubmission(assignmentId),
			});
			queryClient.invalidateQueries({
				queryKey: assignmentKeys.submissions(assignmentId),
			});
			toast.success(
				"Pengumpulan dibatalkan. Anda dapat mengumpulkan ulang."
			);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal membatalkan pengumpulan");
		},
	});
}