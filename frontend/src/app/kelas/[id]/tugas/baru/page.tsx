"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import {
	useCreateAssignment,
	useUpdateAssignment,
	useAssignmentDetail,
} from "@/hooks/useAssignments";
import toast, { Toaster } from "react-hot-toast";
import {
	ArrowLeft,
	Books,
	CalendarBlank,
	Clock,
	Plus,
	Trash,
} from "phosphor-react";

interface QuestionData {
	id?: number;
	question_text: string;
	reference_answer: string;
	points: number;
}

export default function NewAssignmentPage() {
	return (
		<ProtectedRoute>
			<NewAssignmentContent />
		</ProtectedRoute>
	);
}

function NewAssignmentContent() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const classId = parseInt(params.id as string);
	const assignmentIdParam = searchParams.get("assignmentId");
	const assignmentId = assignmentIdParam ? parseInt(assignmentIdParam) : null;
	const { user } = useAuth();

	const isEditMode = !!assignmentId;

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [questions, setQuestions] = useState<QuestionData[]>([
		{ question_text: "", reference_answer: "", points: 10 },
	]);
	const [deadline, setDeadline] = useState("");
	const [deadlineTime, setDeadlineTime] = useState("");
	const [maxScore, setMaxScore] = useState("");
	const [minimalScore, setMinimalScore] = useState("75");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const createAssignment = useCreateAssignment();
	const updateAssignment = useUpdateAssignment();
	const { data: assignmentData, isLoading: isLoadingAssignment } =
		useAssignmentDetail(assignmentId || 0);

	useEffect(() => {
		if (user && user.user_role !== "dosen") {
			toast.error("Hanya dosen yang dapat membuat atau mengedit tugas");
			router.push(`/kelas/${classId}`);
		}
	}, [user, router, classId]);

	useEffect(() => {
		if (isEditMode && assignmentData) {
			if (
				assignmentData.submission_count &&
				assignmentData.submission_count > 0
			) {
				toast.error(
					`Tidak dapat mengedit tugas. Sudah ada ${assignmentData.submission_count} mahasiswa yang mengumpulkan.`
				);
				router.push(`/kelas/${classId}/tugas/${assignmentId}`);
				return;
			}

			setTitle(assignmentData.title);
			setDescription(assignmentData.description || "");

			if (
				assignmentData.questions &&
				Array.isArray(assignmentData.questions)
			) {
				const loadedQuestions = assignmentData.questions.map(
					(q: {
						id: number;
						question_text: string;
						reference_answer: string;
						points: number;
					}) => ({
						id: q.id,
						question_text: q.question_text || "",
						reference_answer: q.reference_answer || "",
						points: q.points || 10,
					})
				);
				setQuestions(
					loadedQuestions.length > 0
						? loadedQuestions
						: [
							{
								question_text: "",
								reference_answer: "",
								points: 10,
							},
						]
				);
			}

			setMaxScore(assignmentData.max_score?.toString() || "");
			setMinimalScore(assignmentData.minimal_score?.toString() || "75");

			if (assignmentData.deadline) {
				const deadlineDate = new Date(assignmentData.deadline);
				setDeadline(deadlineDate.toISOString().split("T")[0]);
				setDeadlineTime(
					deadlineDate.toTimeString().split(" ")[0].substring(0, 5)
				);
			}
		}
	}, [isEditMode, assignmentData, router, classId, assignmentId]);

	useEffect(() => {
		const total = questions.reduce((sum, q) => sum + (q.points || 0), 0);
		setMaxScore(total.toString());
	}, [questions]);

	const handleBack = () => {
		router.push(`/kelas/${classId}`);
	};

	const handleAddQuestion = () => {
		setQuestions([
			...questions,
			{ question_text: "", reference_answer: "", points: 10 },
		]);
	};

	const handleRemoveQuestion = (index: number) => {
		if (questions.length === 1) {
			toast.error("Minimal harus ada 1 soal");
			return;
		}
		const newQuestions = questions.filter((_, i) => i !== index);
		setQuestions(newQuestions);
	};

	const handleQuestionChange = (
		index: number,
		field: keyof QuestionData,
		value: string | number
	) => {
		const newQuestions = [...questions];
		newQuestions[index] = { ...newQuestions[index], [field]: value };
		setQuestions(newQuestions);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) {
			return;
		}

		if (!title.trim()) {
			toast.error("Judul tugas harus diisi");
			return;
		}

		const hasEmptyQuestions = questions.some(
			(q) => !q.question_text.trim() || !q.reference_answer.trim()
		);
		if (hasEmptyQuestions) {
			toast.error("Semua soal dan kunci jawaban harus diisi");
			return;
		}

		if (questions.length === 0) {
			toast.error("Minimal harus ada 1 soal");
			return;
		}

		let deadlineValue: string | undefined = undefined;
		if (deadline) {
			if (deadlineTime) {
				deadlineValue = `${deadline}T${deadlineTime}:00`;
			} else {
				deadlineValue = `${deadline}T23:59:59`;
			}
		}

		const formattedQuestions = questions.map((q, index) => ({
			id: q.id,
			question_text: q.question_text,
			reference_answer: q.reference_answer,
			points: q.points,
			question_order: index + 1,
		}));

		setIsSubmitting(true);

		try {
			if (isEditMode && assignmentId) {
				await updateAssignment.mutateAsync({
					assignmentId,
					data: {
						title,
						description: description || undefined,
						questions: formattedQuestions,
						deadline: deadlineValue,
						max_score: parseInt(maxScore) || undefined,
						minimal_score: parseInt(minimalScore) || 75,
					},
				});
				toast.dismiss();
				toast.success("Tugas berhasil diperbarui!", {
					id: 'assignment-success',
					duration: 2000,
				});
				setTimeout(() => {
					router.push(`/kelas/${classId}`);
				}, 1500);
			} else {
				await createAssignment.mutateAsync({
					kelas_id: classId,
					title,
					description: description || undefined,
					questions: formattedQuestions,
					deadline: deadlineValue,
					max_score: parseInt(maxScore) || undefined,
					minimal_score: parseInt(minimalScore) || 75,
				});
				toast.dismiss();
				toast.success("Tugas berhasil dibuat!", {
					id: 'assignment-success',
					duration: 2000,
				});
				setTimeout(() => {
					router.push(`/kelas/${classId}`);
				}, 1000);
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			setIsSubmitting(false);
			console.error("Error saving assignment:", error);

			if (
				error?.response?.data?.detail &&
				error.response.data.detail.includes("submission")
			) {
				toast.error(error.response.data.detail);
				router.push(`/kelas/${classId}/tugas/${assignmentId}`);
			} else {
				toast.error(
					isEditMode
						? "Gagal memperbarui tugas"
						: "Gagal membuat tugas"
				);
			}
		}
	};

	if (user && user.user_role !== "dosen") {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center bg-white rounded-md shadow-xl p-8 max-w-md">
						<h2 className="text-xl font-bold text-gray-800 mb-2">
							Akses Ditolak
						</h2>
						<p className="text-gray-600 mb-4">
							Hanya dosen yang dapat membuat atau mengedit tugas
						</p>
						<Button
							onClick={() => router.push(`/kelas/${classId}`)}
						>
							Kembali ke Kelas
						</Button>
					</div>
				</div>
			</div>
		);
	} if (isEditMode && isLoadingAssignment) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<LoadingSpinner size="lg" text="Memuat data tugas..." />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<Navbar />
			<Toaster position="top-center" />
			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<button
						onClick={handleBack}
						className="group inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 transition-all duration-200 mb-6"
					>
						<div className="p-2 rounded-md bg-white shadow-sm group-hover:shadow-md group-hover:bg-blue-50 transition-all duration-200">
							<ArrowLeft className="w-5 h-5" weight="bold" />
						</div>
						<span className="font-medium">Kembali</span>
					</button>

					<div className="bg-yellow-600 rounded-md shadow-xl p-8 mb-6">
						<div className="flex items-center gap-3">
							<div className="w-14 h-14 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
								<Books className="w-7 h-7 text-white" weight="bold" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-4xl font-bold text-white">
									{isEditMode ? "Edit Tugas" : "Buat Tugas Baru"}
								</h1>
							</div>
						</div>
					</div>
				</div>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-yellow-500 text-base sm:text-lg font-semibold mb-3">
							Judul Tugas
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Masukkan judul tugas"
							className="w-full px-4 py-3 bg-gray-50 rounded-md border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors shadow-lg"
							required
						/>
					</div>
					<div>
						<label className="block text-yell text-base sm:text-lg font-semibold mb-3">
							Deskripsi (Opsional)
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Masukkan deskripsi tugas"
							rows={4}
							className="w-full px-4 py-3 bg-gray-50 rounded-md border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors shadow-lg"
						/>
					</div>
					<div>
						<div className="flex items-center gap-3 mb-6">
							<div className="p-3 rounded-md bg-yellow-500 shadow-lg">
								<Books className="w-6 h-6 text-white" weight="bold" />
							</div>
							<h2 className="text-2xl font-bold text-gray-800">
								Soal dan Kunci Jawaban
							</h2>
						</div>
						<div className="bg-white rounded-md shadow-lg border border-gray-100 p-4 sm:p-6">
							{questions.map((question, index) => (
								<div key={index} className="mb-6 last:mb-0">
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-md bg-yellow-400 flex items-center justify-center text-white font-bold shadow-md">
												{index + 1}
											</div>
											<h3 className="text-lg font-bold text-gray-800">
												Soal {index + 1}
											</h3>
										</div>
										{questions.length > 1 && (
											<button
												type="button"
												onClick={() =>
													handleRemoveQuestion(index)
												}
												className="bg-red-500 hover:bg-red-600 text-white transition-colors p-2 rounded-md shadow-md"
												title="Hapus soal"
											>
												<Trash
													className="w-5 h-5"
													weight="bold"
												/>
											</button>
										)}
									</div>
									<div className="space-y-4">
										<div>
											<label className="block text-base font-bold text-gray-800 mb-3">
												Pertanyaan
											</label>
											<div className="bg-blue-50 rounded-md p-4">
												<textarea
													value={question.question_text}
													onChange={(e) =>
														handleQuestionChange(
															index,
															"question_text",
															e.target.value
														)
													}
													placeholder="Masukkan pertanyaan"
													rows={3}
													className="w-full bg-white px-4 py-3 border-2 border-gray-200 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
													required
												/>
											</div>
										</div>
										<div>
											<label className="block text-base font-bold text-gray-800 mb-3">
												Kunci Jawaban
											</label>
											<div className="bg-green-50 rounded-md p-4">
												<textarea
													value={
														question.reference_answer
													}
													onChange={(e) =>
														handleQuestionChange(
															index,
															"reference_answer",
															e.target.value
														)
													}
													placeholder="Masukkan kunci jawaban"
													rows={4}
													className="w-full bg-white px-4 py-3 border-2 border-gray-200 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
													required
												/>
											</div>
										</div>
										<div>
											<label className="block text-base font-bold text-gray-800 mb-3">
												Poin
											</label>
											<input
												type="number"
												value={question.points}
												onChange={(e) =>
													handleQuestionChange(
														index,
														"points",
														parseInt(
															e.target.value
														) || " "
													) 
												}
												onWheel={(e) => e.currentTarget.blur()}
												min="0"
												max="1000"
												className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-md text-gray-800 focus:outline-none focus:border-yellow-500 transition-colors shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
												required
											/>
										</div>
									</div>
									{index < questions.length - 1 && (
										<div className="border-t-2 border-gray-100 mt-6"></div>
									)}
								</div>
							))}
							<div className="mt-6 pt-6 border-t-2 border-gray-100">
								<button
									type="button"
									onClick={handleAddQuestion}
									className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-md font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
								>
									<Plus className="w-5 h-5" weight="bold" />
									Tambah Soal
								</button>
							</div>
						</div>
						<p className="text-sm text-gray-600 mt-3">
							Setiap soal akan dinilai secara otomatis berdasarkan
							kunci jawaban yang Anda berikan.
						</p>
					</div>

					<div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
						<h3 className="text-lg font-bold text-gray-800 mb-4">Deadline (Opsional)</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="relative">
								<CalendarBlank
									className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
									weight="bold"
								/>
								<input
									type="date"
									value={deadline}
									onChange={(e) =>
										setDeadline(e.target.value)
									}
									className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-md text-gray-800 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
								/>
							</div>
							<div className="relative">
								<Clock
									className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
									weight="bold"
								/>
								<input
									type="time"
									value={deadlineTime}
									onChange={(e) =>
										setDeadlineTime(e.target.value)
									}
									className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-md text-gray-800 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
								/>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
						<label className="block text-gray-800 text-lg font-bold mb-4">
							Skor Maksimal
						</label>
						<div className="bg-yellow-50 rounded-md p-6 border-2 border-yellow-200">
							<div className="flex items-center justify-between">
								<span className="text-gray-700 font-semibold">
									Total Poin dari Semua Soal:
								</span>
								<span className="text-3xl font-bold text-yellow-600">
									{maxScore || 0}
								</span>
							</div>
						</div>
						<p className="text-sm text-gray-600 mt-3">
							Skor maksimal dihitung otomatis dari jumlah poin
							semua soal.
						</p>
					</div>
					<div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
						<label className="block text-gray-800 text-lg font-bold mb-4">
							Nilai Minimal Kelulusan
						</label>
						<input
							type="number"
							value={minimalScore}
							onChange={(e) => setMinimalScore(e.target.value)}
							min="0"
							max={maxScore || "100"}
							placeholder="75"
							className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors shadow-sm"
							required
						/>
						<p className="text-sm text-gray-600 mt-3">
							Mahasiswa yang mendapat nilai di atas atau sama
							dengan nilai minimal ini akan dinyatakan lulus.
						</p>
					</div>
					<div className="flex justify-center gap-4 pt-4">
						<button
							type="button"
							onClick={handleBack}
							className="min-w-[150px] px-6 py-3 bg-white hover:bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-md font-bold shadow-lg hover:shadow-xl transition-all"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={
								isSubmitting ||
								createAssignment.isPending ||
								updateAssignment.isPending
							}
							className="min-w-[150px] px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-md font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ||
								createAssignment.isPending ||
								updateAssignment.isPending
								? "Menyimpan..."
								: isEditMode
									? "Perbarui Tugas"
									: "Buat Tugas"}
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}
