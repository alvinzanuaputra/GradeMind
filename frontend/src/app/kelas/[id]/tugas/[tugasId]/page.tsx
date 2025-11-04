"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { assignmentService } from "@/services";
import {
	ArrowLeft,
	Books,
	CalendarBlank,
	Play,
	CheckCircle,
	PencilSimple,
	Pencil,
	Trash,
	Copy,
	Check,
} from "phosphor-react";
import type { AssignmentDetailResponse, AnswerSubmit } from "@/types";
import { toast, Toaster } from "react-hot-toast";

export default function AssignmentDetailPage() {
	return (
		<ProtectedRoute>
			<AssignmentDetailContent />
		</ProtectedRoute>
	);
}

function AssignmentDetailContent() {
	const router = useRouter();
	const params = useParams();
	const queryClient = useQueryClient();
	const classId = parseInt(params.id as string);
	const assignmentId = parseInt(params.tugasId as string);
	const { user } = useAuth();
	const [answers, setAnswers] = useState<AnswerSubmit[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [lateError, setLateError] = useState<string | null>(null);
	const {
		data: assignment,
		isLoading,
		error,
	} = useQuery<AssignmentDetailResponse>({
		queryKey: ["assignment", assignmentId],
		queryFn: () => assignmentService.getAssignmentDetails(assignmentId),
	});

	const { data: mySubmission } = useQuery({
		queryKey: ["mySubmission", assignmentId],
		queryFn: () => assignmentService.getMySubmission(assignmentId),
		enabled: user?.user_role === "mahasiswa",
	});
	useEffect(() => {
		const hasSubmitted = mySubmission?.submitted || false;
		if (!hasSubmitted && answers.length > 0) {
			const storageKey = `assignment_${assignmentId}_answers`;
			sessionStorage.setItem(storageKey, JSON.stringify(answers));
		}
	}, [answers, assignmentId, mySubmission]);
	useEffect(() => {
		if (assignment?.questions && assignment.questions.length > 0) {
			const storageKey = `assignment_${assignmentId}_answers`;
			if (mySubmission?.submitted && mySubmission.answers) {
				const submittedAnswers = assignment.questions.map((q) => {
					const submittedAnswer = mySubmission.answers?.find(
						(a) => a.question_id === q.id
					);
					return {
						question_id: q.id,
						answer_text: submittedAnswer?.answer_text || "",
					};
				});
				setAnswers(submittedAnswers);
				sessionStorage.removeItem(storageKey);
			} else {
				const savedAnswers = sessionStorage.getItem(storageKey);

				if (savedAnswers) {
					try {
						const parsed = JSON.parse(savedAnswers);
						const validAnswers = assignment.questions.map((q) => {
							const saved = parsed.find((a: AnswerSubmit) => a.question_id === q.id);
							return {
								question_id: q.id,
								answer_text: saved?.answer_text || "",
							};
						});
						setAnswers(validAnswers);
					} catch (error) {
						console.error("Error parsing saved answers:", error);
						setAnswers(
							assignment.questions.map((q) => ({
								question_id: q.id,
								answer_text: "",
							}))
						);
					}
				} else {
					setAnswers(
						assignment.questions.map((q) => ({
							question_id: q.id,
							answer_text: "",
						}))
					);
				}
			}
		}
	}, [assignment, mySubmission, assignmentId]);

	const handleBack = () => {
		router.push(`/kelas/${classId}`);
	};

	const handleAnswerChange = (questionId: number, text: string) => {
		setAnswers((prev) =>
			prev.map((answer) =>
				answer.question_id === questionId
					? { ...answer, answer_text: text }
					: answer
			)
		);
	};

	const handleSubmit = async () => {
		const emptyAnswers = answers.filter((a) => !a.answer_text.trim());
		if (emptyAnswers.length > 0) {
			toast.error("Mohon isi semua jawaban sebelum mengumpulkan tugas");
			return;
		}

		setIsSubmitting(true);
		setLateError(null);

		try {
			await assignmentService.submitTypedAnswer(assignmentId, {
				answers,
			});
			const storageKey = `assignment_${assignmentId}_answers`;
			sessionStorage.removeItem(storageKey);
			toast.success("Jawaban berhasil dikumpulkan!");
			queryClient.invalidateQueries({
				queryKey: ["mySubmission", assignmentId],
			});
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Terjadi kesalahan saat mengumpulkan jawaban";
			if (errorMessage.includes("Batas waktu pengumpulan tugas sudah lewat")) {
				setLateError("Batas waktu pengumpulan tugas sudah lewat");
			} else {
				toast.error(errorMessage);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const getAnswerForQuestion = (questionId: number) => {
		return (
			answers.find((a) => a.question_id === questionId)?.answer_text || ""
		);
	};
	const answeredCount = answers.filter((a) => a.answer_text.trim()).length;
	const totalCount = assignment?.questions?.length || 0;
	const isTeacher = user?.user_role === "dosen";
	const hasSubmitted = mySubmission?.submitted || false;
	const isGraded = mySubmission?.graded || false;
	const [isAssignmentMenuOpen, setIsAssignmentMenuOpen] = useState(false);
	const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const assignmentMenuRef = useRef<HTMLDivElement>(null);
	const [copiedQuestions, setCopiedQuestions] = useState<Set<number>>(new Set());
	const [copiedAnswers, setCopiedAnswers] = useState<Set<number>>(new Set());
	const [copiedStudentAnswers, setCopiedStudentAnswers] = useState<Set<number>>(new Set());
	const handleEditAssignment = () => {
		setIsAssignmentMenuOpen(false);
		router.push(`/kelas/${classId}/tugas/baru?assignmentId=${assignmentId}`);
	};
	const handleDeleteAssignment = async () => {
		if (!assignment) return;
		setShowDeleteModal(false);
		setIsDeletingAssignment(true);
		setIsAssignmentMenuOpen(false);
		try {
			await assignmentService.deleteAssignment(assignmentId);
			toast.success("Tugas berhasil dihapus!");
			router.push(`/kelas/${classId}`);
		} catch {
			toast.error("Gagal menghapus tugas");
		} finally {
			setIsDeletingAssignment(false);
		}
	};

	const handleOpenDeleteModal = () => {
		setIsAssignmentMenuOpen(false);
		setShowDeleteModal(true);
	};
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				assignmentMenuRef.current &&
				!assignmentMenuRef.current.contains(event.target as Node)
			) {
				setIsAssignmentMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleCopyText = async (text: string, label: string, questionId: number, isAnswer: boolean = false, isStudentAnswer: boolean = false) => {
		try {
			await navigator.clipboard.writeText(text);
			if (isStudentAnswer) {
				setCopiedStudentAnswers(prev => new Set(prev).add(questionId));
				setTimeout(() => {
					setCopiedStudentAnswers(prev => {
						const newSet = new Set(prev);
						newSet.delete(questionId);
						return newSet;
					});
				}, 2000);
			} else if (isAnswer) {
				setCopiedAnswers(prev => new Set(prev).add(questionId));
				setTimeout(() => {
					setCopiedAnswers(prev => {
						const newSet = new Set(prev);
						newSet.delete(questionId);
						return newSet;
					});
				}, 2000);
			} else {
				setCopiedQuestions(prev => new Set(prev).add(questionId));
				setTimeout(() => {
					setCopiedQuestions(prev => {
						const newSet = new Set(prev);
						newSet.delete(questionId);
						return newSet;
					});
				}, 2000);
			}
		} catch (err) {
			toast.error("Gagal menyalin teks");
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-100">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<div className="relative inline-block mb-6">
							<div className="w-20 h-20 rounded-md bg-yellow-400 flex items-center justify-center shadow-xl animate-pulse">
								<Books className="w-10 h-10 text-black" weight="bold" />
							</div>
						</div>
						<LoadingSpinner size="lg" text="Memuat data tugas..." />
					</div>
				</div>
			</div>
		);
	}

	if (error || !assignment) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-100">
				<Navbar />
				<div className="flex-1 flex items-center justify-center p-4">
					<div className="text-center bg-white rounded-md shadow-xl p-8 max-w-md">
						<div className="w-20 h-20 rounded-md bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto mb-6">
							<Books className="w-10 h-10 text-red-600" weight="bold" />
						</div>
						<h2 className="text-2xl font-bold text-gray-800 mb-3">
							Tugas tidak ditemukan
						</h2>
						<p className="text-gray-600 mb-6">
							Tugas yang Anda cari tidak tersedia atau telah dihapus
						</p>
						<Button
							onClick={handleBack}
							className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-md font-bold shadow-lg"
						>
							<ArrowLeft className="w-5 h-5 inline mr-2" weight="bold" />
							Kembali ke Kelas
						</Button>
					</div>
				</div>
			</div>
		);
	}
	if (!isTeacher && assignment.assignment_type === "file_based") {
		return (
			<div className="min-h-screen flex flex-col bg-gray-100">
				<Navbar />
				<div className="flex-1 flex items-center justify-center p-4">
					<div className="text-center bg-white rounded-md shadow-xl p-8 max-w-md">
						<div className="w-20 h-20 rounded-md bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center mx-auto mb-6">
							<Books className="w-10 h-10 text-yellow-600" weight="bold" />
						</div>
						<h2 className="text-2xl font-bold text-gray-800 mb-3">
							Tipe tugas ini belum didukung
						</h2>
						<p className="text-gray-600 mb-6">
							Tugas berbasis file sedang dalam pengembangan. Mohon ditunggu untuk pembaruan selanjutnya.
						</p>
						<Button
							onClick={handleBack}
							className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-md font-bold shadow-lg"
						>
							<ArrowLeft className="w-5 h-5 inline mr-2" weight="bold" />
							Kembali ke Kelas
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<Navbar />
			<Toaster position="top-center" />
			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeleteAssignment}
				title="Hapus Tugas"
				message={`Apakah Anda yakin ingin menghapus tugas "${assignment?.title}"? Tindakan ini tidak dapat dibatalkan.`}
				confirmText="Ya, Hapus Tugas"
				cancelText="Batal"
				isLoading={isDeletingAssignment}
				isDangerous={true}
			/>
			
			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<button
							onClick={handleBack}
							className="group inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 transition-all duration-200"
						>
							<div className="p-2 rounded-md bg-white shadow-sm group-hover:shadow-md group-hover:bg-blue-50 transition-all duration-200">
								<ArrowLeft className="w-5 h-5" weight="bold" />
							</div>
							<span className="font-medium">Kembali ke Kelas</span>
						</button>
						{isTeacher && (
							<button
								onClick={() =>
									router.push(
										`/kelas/${classId}/tugas/${assignmentId}/hasil-penilaian`
									)
								}
								className="group inline-flex items-center gap-3 px-4 py-2 rounded-md bg-green-500 shadow-sm hover:shadow-md hover:bg-gray-400 transition-all duration-200"
							>
								<CheckCircle className="w-5 h-5 text-white" weight="bold" />
								<span className="font-medium text-white">Lihat Semua Hasil Penilaian</span>
							</button>
						)}
						{!isTeacher && isGraded && mySubmission?.submission_id && (
							<button
								onClick={() =>
									router.push(
										`/kelas/${classId}/tugas/${assignmentId}/hasil-penilaian/${mySubmission.submission_id}`
									)
								}
								className="group inline-flex items-center gap-3 px-4 py-2 rounded-md bg-green-500 shadow-sm hover:shadow-md hover:bg-gray-400 transition-all duration-200"
							>
								<CheckCircle className="w-5 h-5 text-white" weight="bold" />
								<span className="font-medium text-white">Lihat Detail Nilai</span>
							</button>
						)}
						{!isTeacher && !hasSubmitted && (
							<Button
								onClick={handleSubmit}
								variant="primary"
								size="md"
								className="bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg flex items-center gap-2 font-semibold px-6"
								disabled={answeredCount === 0 || isSubmitting}
								isLoading={isSubmitting}
							>
								<Play className="w-5 h-5" weight="bold" />
								Kumpulkan ({answeredCount}/{totalCount})
							</Button>
						)}
					</div>
					<div className="bg-yellow-600 rounded-md shadow-xl p-8 mb-6 relative overflow-visible">
						<div className="relative">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-3">
										<div className="w-14 h-14 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
											<Books className="w-7 h-7 text-white" weight="bold" />
										</div>
										<div>
											<h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
												{assignment.title}
											</h1>
											<p className="text-blue-100 text-sm font-medium">
												{assignment.class_name}
											</p>
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									{isTeacher && (
										<div className="relative z-5" ref={assignmentMenuRef}>
											<button
												onClick={() => setIsAssignmentMenuOpen(!isAssignmentMenuOpen)}
												disabled={isDeletingAssignment}
												className="p-3 rounded-md bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-200 disabled:opacity-50 shadow-lg"
											>
												<PencilSimple className="w-5 h-5" weight="bold" />
											</button>
											{isAssignmentMenuOpen && (
												<div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-2xl overflow-hidden">
													<button
														onClick={handleEditAssignment}
														className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
													>
														<Pencil className="w-5 h-5 text-blue-600" weight="bold" />
														<span className="font-medium">Edit Tugas</span>
													</button>
													<button
														onClick={handleOpenDeleteModal}
														disabled={isDeletingAssignment}
														className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 disabled:opacity-50 border-t border-gray-100"
													>
														<Trash className="w-5 h-5" weight="bold" />
														<span className="font-medium">
															{isDeletingAssignment ? "Menghapus..." : "Hapus Tugas"}
														</span>
													</button>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{!isTeacher && hasSubmitted && (
						<div
							className={`${isGraded
									? "bg-blue-500"
									: "bg-green-500"
								} rounded-md shadow-lg p-6 mb-6`}
						>
							<div className="flex items-start gap-4">
								<div className={`mt-5 p-3 rounded-md ${isGraded ? "bg-white/20" : "bg-white/20"} backdrop-blur-sm`}>
									<CheckCircle className="w-8 h-8 text-white" weight="bold" />
								</div>
								<div className="flex items-center justify-between w-full">
									<div>

										<p className="text-white text-lg font-bold mb-1">
											{isGraded ? "Tugas Sudah Dinilai ✓" : "Tugas Terkumpul"}
										</p>
										<p className="text-white/90 text-sm mb-3 underline">
											{isGraded
												? "Jawaban tidak bisa diubah lagi"
												: "Sedang dinilai secara otomatis oleh sistem AI..."}
										</p>
									</div>
									{isGraded && (
										<div className="bg-white/20 rounded-md px-5 py-2 inline-block">
											<p className="text-white text-sm mb-1 font-medium">Nilai Anda:</p>
											<p className="text-white text-3xl font-bold">
												{mySubmission?.total_score?.toFixed(1)}
												<span className="text-xl">/{mySubmission?.max_score}</span>
											</p>
											<p className="text-white/90 text-sm mt-1">
												({mySubmission?.percentage?.toFixed(1)}%)
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{!isTeacher && !hasSubmitted && (
						<>
							{lateError && (
								<div className="mb-6 bg-red-500 rounded-md shadow-lg p-6">
									<div className="flex items-start gap-4">
										<div className="p-3 rounded-md bg-white/20 backdrop-blur-sm">
											<CalendarBlank className="w-6 h-6 text-white" weight="bold" />
										</div>
										<div>
											<p className="text-white text-lg font-bold mb-1">Deadline Terlewat</p>
											<p className="text-white/90 text-sm">{lateError}</p>
										</div>
									</div>
								</div>
							)}
							<div className="bg-white rounded-md shadow-lg p-6 mb-6 border border-gray-100">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h3 className="text-lg font-bold text-gray-800 mb-1">Progress Pengerjaan</h3>
										<p className="text-sm text-gray-600">Jawab semua pertanyaan di bawah ini</p>
									</div>
									<div className="text-right">
										<p className="text-3xl font-bold text-blue-600">{answeredCount}</p>
										<p className="text-sm text-gray-500">dari {totalCount} soal</p>
									</div>
								</div>
								<div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
									<div
										className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
										style={{ width: `${(answeredCount / totalCount) * 100}%` }}
									></div>
								</div>
								<p className="text-xs text-gray-500 mt-2 text-right">
									{Math.round((answeredCount / totalCount) * 100)}% selesai
								</p>
							</div>
						</>
					)}
				</div>
				{assignment.description && (
					<div className="mb-8">
						<div className="bg-white border-l-4 border-blue-500 rounded-md shadow-md p-6">
							<div className="flex items-start gap-4">
								<div className="p-3 rounded-md bg-blue-100">
									<Books className="w-6 h-6 text-blue-600" weight="bold" />
								</div>
								<div className="flex-1">
									<h2 className="text-lg font-bold text-gray-800 mb-3">
										Deskripsi Tugas
									</h2>
									<p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
										{assignment.description}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
				<div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
					{/* Deadline Card */}
					<div className="group bg-white rounded-md shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-red-200">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 rounded-md bg-red-100 group-hover:bg-red-200 transition-colors">
								<CalendarBlank className="w-6 h-6 text-red-600" weight="bold" />
							</div>
							<h3 className="font-bold text-gray-800">Deadline</h3>
						</div>
						<p className="text-gray-700 font-medium">
							{assignment.deadline
								? new Date(assignment.deadline).toLocaleDateString("id-ID", {
									day: "numeric",
									month: "long",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
								: "Tidak ada deadline"}
						</p>
					</div>
					<div className="group bg-white rounded-md shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 rounded-md bg-blue-100 group-hover:bg-blue-200 transition-colors">
								<Books className="w-6 h-6 text-blue-600" weight="bold" />
							</div>
							<h3 className="font-bold text-gray-800">Tipe Tugas</h3>
						</div>
						<p className="text-gray-700 font-medium capitalize">Ketik Manual</p>
					</div>
					<div className="group bg-white rounded-md shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 rounded-md bg-green-100 group-hover:bg-green-200 transition-colors">
								<CheckCircle className="w-6 h-6 text-green-600" weight="bold" />
							</div>
							<h3 className="font-bold text-gray-800">Nilai Maksimal</h3>
						</div>
						<p className="text-3xl font-bold text-green-600">
							{assignment.max_score}
							<span className="text-base text-gray-500 ml-1">poin</span>
						</p>
					</div>
				</div>
				{assignment.questions && assignment.questions.length > 0 ? (
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-3 rounded-md bg-yellow-500 shadow-lg">
								<Books className="w-6 h-6 text-white" weight="bold" />
							</div>
							<h2 className="text-2xl font-bold text-gray-800">
								Soal {isTeacher && "dan Kunci Jawaban"}
							</h2>
						</div>

						<div className="space-y-8">
							{assignment.questions
								.sort((a, b) => a.question_order - b.question_order)
								.map((question, index) => (
									<div key={question.id} className="bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden">
										<div className="bg-white px-6 py-4 border-b border-gray-200">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-md bg-yellow-400 flex items-center justify-center text-white font-bold shadow-md">
														{index + 1}
													</div>
													<div>
														<h3 className="text-lg font-bold text-gray-800">
															Soal {index + 1}
														</h3>
														<p className="text-sm text-gray-600">
															Bobot: {question.points} poin
														</p>
													</div>
												</div>
												<div className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-700 font-semibold text-sm">
													{question.points} pts
												</div>
											</div>
										</div>
										<div className="p-6">
											<div className="bg-blue-50 rounded-md p-6 mb-6 relative">
												<button
													onClick={() => handleCopyText(question.question_text, "Soal", question.id, false)}
													className={`absolute top-3 right-3 p-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg ${copiedQuestions.has(question.id)
															? 'bg-blue-500 text-white'
															: 'bg-blue-500 text-white hover:bg-gray-400'
														}`}
													title={copiedQuestions.has(question.id) ? "Tersalin!" : "Salin soal"}
												>
													{copiedQuestions.has(question.id) ? (
														<Check className="w-4 h-4" weight="bold" />
													) : (
														<Copy className="w-4 h-4" weight="bold" />
													)}
												</button>
												<p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base pr-10">
													{question.question_text}
												</p>
											</div>
											{isTeacher && (
												<div>
													<h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
														<CheckCircle className="w-5 h-5 text-green-600" weight="bold" />
														Kunci Jawaban:
													</h3>
													<div className="bg-green-50 rounded-md p-6 relative">
														<button
															onClick={() => handleCopyText(question.reference_answer, "Kunci jawaban", question.id, true)}
															className={`absolute top-3 right-3 p-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg ${copiedAnswers.has(question.id)
																	? 'bg-green-500 text-white'
																	: 'bg-green-500 text-white hover:bg-gray-400'
																}`}
															title={copiedAnswers.has(question.id) ? "Tersalin!" : "Salin kunci jawaban"}
														>
															{copiedAnswers.has(question.id) ? (
																<Check className="w-4 h-4" weight="bold" />
															) : (
																<Copy className="w-4 h-4" weight="bold" />
															)}
														</button>
														<p className="text-gray-700 leading-relaxed whitespace-pre-wrap pr-10">
															{question.reference_answer}
														</p>
													</div>
												</div>
											)}
											{!isTeacher && (
												<div>
													<h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
														<PencilSimple className="w-5 h-5 text-blue-600" weight="bold" />
														Jawaban Anda:
													</h3>
													<div className="relative">
														{hasSubmitted && (
															<button
																onClick={() => handleCopyText(getAnswerForQuestion(question.id), "Jawaban Anda", question.id, false, true)}
																className={`absolute top-3 right-3 p-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg z-10 ${copiedStudentAnswers.has(question.id)
																		? 'bg-green-500 text-white'
																		: 'bg-green-500 text-white hover:bg-gray-400'
																	}`}
																title={copiedStudentAnswers.has(question.id) ? "Tersalin!" : "Salin jawaban Anda"}
															>
																{copiedStudentAnswers.has(question.id) ? (
																	<Check className="w-4 h-4" weight="bold" />
																) : (
																	<Copy className="w-4 h-4" weight="bold" />
																)}
															</button>
														)}
														<Textarea
															value={getAnswerForQuestion(question.id)}
															onChange={(e) =>
																handleAnswerChange(question.id, e.target.value)
															}
															placeholder={
																hasSubmitted
																	? "Tidak ada jawaban"
																	: `Ketik jawaban untuk Soal ${index + 1} di sini...`
															}
															rows={8}
															className="w-full rounded-md border-2 border-gray-200 focus:border-blue-500 transition-colors"
															disabled={hasSubmitted}
															readOnly={hasSubmitted}
														/>
													</div>

													<div className="flex justify-between items-center mt-3 px-2">
														<span className="text-sm text-gray-500">
															{getAnswerForQuestion(question.id).length} karakter
														</span>
														{isGraded && mySubmission?.answers && (
															<div className="px-3 py-1 rounded-md bg-green-400 text-black border border-yellow-300 shadow-md shadow-yellow-500">
																<span className="text-xs font-bold">
																	Nilai:{" "}
																	{mySubmission.answers
																		.find((a) => a.question_id === question.id)
																		?.final_score?.toFixed(1) || 0}
																	/{question.points}
																</span>
															</div>
														)}
													</div>
													{isGraded &&
														mySubmission?.answers?.find(
															(a) => a.question_id === question.id
														)?.feedback && (
															<div className="mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-md p-4">
																<h4 className="text-sm font-bold text-black mb-2">
																	Feedback dari AI:
																</h4>
																<p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
																	{
																		mySubmission.answers.find(
																			(a) => a.question_id === question.id
																		)?.feedback
																	}
																</p>
															</div>
														)}
												</div>
											)}
										</div>
									</div>
								))}
						</div>
					</div>
				) : (
					<div className="text-center py-12">
						<div className="inline-block p-6 rounded-md bg-white shadow-xl">
							<Books className="w-12 h-12 text-gray-400 mx-auto mb-3" weight="bold" />
							<p className="text-gray-800 font-semibold">
								Belum ada soal untuk tugas ini
							</p>
						</div>
					</div>
				)}

			</main>
		</div>
	);
}