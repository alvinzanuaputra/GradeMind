"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { gradingService, assignmentService } from "@/services";
import { ArrowLeft, Books, CheckCircle, XCircle, Copy, Check } from "phosphor-react";
import type { SubmissionDetailResponse } from "@/types";
import { toast, Toaster } from "react-hot-toast";

export default function DetailPenilaianPage() {
	return (
		<ProtectedRoute>
			<DetailPenilaianContent />
		</ProtectedRoute>
	);
}

function DetailPenilaianContent() {
	const router = useRouter();
	const params = useParams();
	const { user } = useAuth();

	const assignmentId = parseInt(params.tugasId as string);
	const submissionIdParam = params.studentId;
	const submissionId = parseInt(
		Array.isArray(submissionIdParam)
			? submissionIdParam[submissionIdParam.length - 1]
			: submissionIdParam || "Tidak Dinilai"
	);

	const isTeacher = user?.user_role === "dosen";
	const [copiedQuestions, setCopiedQuestions] = useState<Set<number>>(new Set());
	const [copiedAnswers, setCopiedAnswers] = useState<Set<number>>(new Set());

	const {
		data: teacherSubmissionData,
		isLoading: isLoadingTeacher,
		error: teacherError,
	} = useQuery<SubmissionDetailResponse>({
		queryKey: ["submissionDetails", submissionId],
		queryFn: () => gradingService.getSubmissionDetails(submissionId),
		enabled: isTeacher,
	});

	const {
		data: studentSubmissionData,
		isLoading: isLoadingStudent,
		error: studentError,
	} = useQuery({
		queryKey: ["mySubmission", assignmentId],
		queryFn: () => assignmentService.getMySubmission(assignmentId),
		enabled: !isTeacher,
	});

	const isLoading = isTeacher ? isLoadingTeacher : isLoadingStudent;
	const error = isTeacher ? teacherError : studentError;

	const handleBack = () => {
		router.back();
	};

	const handleCopyText = async (text: string, label: string, questionId: number, isAnswer: boolean = false) => {
		try {
			await navigator.clipboard.writeText(text);
			if (isAnswer) {
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

	const gradeDetail = isTeacher
		? teacherSubmissionData
		: studentSubmissionData?.submitted && studentSubmissionData?.graded
			? {
				submission_id: studentSubmissionData.submission_id!,
				student_id: user?.id || 0,
				student_name: user?.fullname || "Student",
				assignment_id: assignmentId,
				assignment_title: "Assignment",
				submission_type: studentSubmissionData.submission_type!,
				submitted_at: studentSubmissionData.submitted_at!,
				graded: true,
				total_score: studentSubmissionData.total_score,
				max_score: studentSubmissionData.max_score,
				percentage: studentSubmissionData.percentage,
				avg_pemahaman: studentSubmissionData.avg_pemahaman,
				avg_kelengkapan: studentSubmissionData.avg_kelengkapan,
				avg_kejelasan: studentSubmissionData.avg_kejelasan,
				avg_analisis: studentSubmissionData.avg_analisis,
				avg_embedding_similarity:
					studentSubmissionData.avg_embedding_similarity,
				graded_at: studentSubmissionData.graded_at,
				question_details:
					studentSubmissionData.answers?.map((ans) => ({
						question_id: ans.question_id,
						question_text: ans.question_text,
						question_points: 0,
						answer_text: ans.answer_text,
						final_score: ans.final_score,
						feedback: ans.feedback,
						rubric_pemahaman: ans.rubric_pemahaman,
						rubric_kelengkapan: ans.rubric_kelengkapan,
						rubric_kejelasan: ans.rubric_kejelasan,
						rubric_analisis: ans.rubric_analisis,
						rubric_rata_rata: ans.rubric_rata_rata,
						embedding_similarity: ans.embedding_similarity,
					})) || [],
			}
			: null;

	if (!isTeacher && gradeDetail && gradeDetail.student_id !== user?.id) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50">
				<Navbar />
				<div className="flex-1 flex items-center justify-center p-4">
					<div className="text-center bg-white rounded-md shadow-xl p-8 max-w-md">
						<div className="w-20 h-20 rounded-md bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto mb-6">
							<Books className="w-10 h-10 text-red-600" weight="bold" />
						</div>
						<h2 className="text-2xl font-bold text-gray-800 mb-3">
							Akses Ditolak
						</h2>
						<p className="text-gray-600 mb-6">
							Anda tidak memiliki akses untuk melihat penilaian ini
						</p>
						<Button
							onClick={handleBack}
							className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-md font-bold shadow-lg"
						>
							<ArrowLeft className="w-5 h-5 inline mr-2" weight="bold" />
							Kembali
						</Button>
					</div>
				</div>
			</div>
		);
	}

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
						<LoadingSpinner size="lg" text="Memuat detail penilaian..." />
					</div>
				</div>
			</div>
		);
	}

	if (error || !gradeDetail || !gradeDetail.graded) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-100">
				<Navbar />
				<div className="flex-1 flex items-center justify-center p-4">
					<div className="text-center bg-white rounded-md shadow-xl p-8 max-w-md">
						<div className="w-20 h-20 rounded-md bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto mb-6">
							<Books className="w-10 h-10 text-red-600" weight="bold" />
						</div>
						<h2 className="text-2xl font-bold text-gray-800 mb-3">
							{!gradeDetail
								? "Detail penilaian tidak ditemukan"
								: "Tugas belum dinilai"}
						</h2>
						<p className="text-gray-600 mb-6">
							{!gradeDetail
								? "Mungkin data belum tersedia atau telah dihapus."
								: "Tugas ini belum dinilai oleh sistem."}
						</p>
						<Button
							onClick={handleBack}
							className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-md font-bold shadow-lg"
						>
							<ArrowLeft className="w-5 h-5 inline mr-2" weight="bold" />
							Kembali
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const isPassed = gradeDetail.percentage && gradeDetail.percentage >= 75;

	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<Navbar />
			<Toaster position="top-center" />

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
							<span className="font-medium">Kembali</span>
						</button>
					</div>
					<div className="bg-yellow-600 rounded-md shadow-xl p-8 mb-6">
						<div className="flex items-center gap-3">
							<div className="w-14 h-14 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
								<Books className="w-7 h-7 text-white" weight="bold" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
									Detail Penilaian
								</h1>
								<p className="text-blue-100 text-sm font-medium">
									{gradeDetail.student_name}
									{gradeDetail.assignment_title &&
										` - ${gradeDetail.assignment_title}`}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className="mb-6">
					<div
						className={`rounded-md shadow-xl p-6 ${isPassed
							? "bg-gradient-to-br from-green-600 to-green-700"
							: "bg-gradient-to-br from-red-600 to-red-700"
							}`}
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								{isPassed ? (
									<CheckCircle
										className="w-12 h-12 text-white"
										weight="bold"
									/>
								) : (
									<XCircle
										className="w-12 h-12 text-white"
										weight="bold"
									/>
								)}
								<div>
									<h3 className="text-2xl font-bold text-white">
										{gradeDetail.total_score?.toFixed(1) ||
											0}{" "}
										/ {gradeDetail.max_score || 0}
									</h3>
									<p className="text-white text-sm">
										{isPassed ? "Lulus" : "Tidak Lulus"} (
										{gradeDetail.percentage?.toFixed(1) ||
											" "}
										%)
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-white text-xs sm:text-sm">
									Dinilai pada
								</p>
								<p className="text-white text-sm sm:text-base font-medium">
									{gradeDetail.graded_at
										? new Date(
											gradeDetail.graded_at
										).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "long",
											year: "numeric",
										})
										: "Tidak Dinilai"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{gradeDetail.avg_pemahaman && (
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-8 h-8 rounded-md bg-yellow-400 flex items-center justify-center shadow-md">
								<span className="text-yellow-900 font-bold text-sm">📊</span>
							</div>
							<h2 className="text-xl font-bold text-gray-800">
								Skor Rubrik
							</h2>
						</div>
						<div className="bg-white rounded-md shadow-lg p-6 border border-gray-100">
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
								<div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-md p-4 border border-blue-200 shadow-md">
									<p className="text-blue-700 text-xs sm:text-sm mb-2 font-medium">
										Pemahaman
									</p>
									{gradeDetail.avg_pemahaman > 0 ? (
										<p className="text-blue-900 text-xl sm:text-2xl font-bold">
											{gradeDetail.avg_pemahaman.toFixed(1)}
										</p>
									) : (
										<div>
											<p className="text-blue-900 text-xl sm:text-2xl font-bold">
												0.0
											</p>
											<p className="text-blue-600 text-xs mt-1">
												Tidak dinilai
											</p>
										</div>
									)}
								</div>
								<div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-md p-4 border border-blue-200 shadow-md">
									<p className="text-blue-700 text-xs sm:text-sm mb-2 font-medium">
										Kelengkapan
									</p>
									{gradeDetail.avg_kelengkapan && gradeDetail.avg_kelengkapan > 0 ? (
										<p className="text-blue-900 text-xl sm:text-2xl font-bold">
											{gradeDetail.avg_kelengkapan.toFixed(1)}
										</p>
									) : (
										<div>
											<p className="text-blue-900 text-xl sm:text-2xl font-bold">
												0.0
											</p>
											<p className="text-blue-600 text-xs mt-1">
												Tidak dinilai
											</p>
										</div>
									)}
								</div>
								<div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-md p-4 border border-blue-200 shadow-md">
									<p className="text-blue-700 text-xs sm:text-sm mb-2 font-medium">
										Kejelasan
									</p>
									{gradeDetail.avg_kejelasan && gradeDetail.avg_kejelasan > 0 ? (
										<p className="text-blue-900 text-xl sm:text-2xl font-bold">
											{gradeDetail.avg_kejelasan.toFixed(1)}
										</p>
									) : (
										<div>
											<p className="text-blue-900 text-xl sm:text-2xl font-bold">
												0.0
											</p>
											<p className="text-blue-600 text-xs mt-1">
												Tidak dinilai
											</p>
										</div>
									)}
								</div>
								<div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-md p-4 border border-blue-200 shadow-md">
									<p className="text-blue-700 text-xs sm:text-sm mb-2 font-medium">
										Analisis
									</p>
									{gradeDetail.avg_analisis && gradeDetail.avg_analisis > 0 ? (
										<p className="text-blue-900 text-xl sm:text-2xl font-bold">
											{gradeDetail.avg_analisis.toFixed(1)}
										</p>
									) : (
										<div>
											<p className="text-blue-900 text-xl sm:text-2xl font-bold">
												0.0
											</p>
											<p className="text-blue-600 text-xs mt-1">
												Tidak dinilai
											</p>
										</div>
									)}
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-md p-4 border border-green-200 shadow-md">
									<p className="text-green-700 text-xs sm:text-sm mb-2 font-medium">
										Similarity Score
									</p>
									{gradeDetail.avg_embedding_similarity && gradeDetail.avg_embedding_similarity > 0 ? (
										<p className="text-green-900 text-xl sm:text-2xl font-bold">
											{(gradeDetail.avg_embedding_similarity * 100).toFixed(1)}%
										</p>
									) : (
										<div>
											<p className="text-green-900 text-xl sm:text-2xl font-bold">
												0.0%
											</p>
											<p className="text-green-600 text-xs mt-1">
												Tidak dinilai
											</p>
										</div>
									)}
								</div>
								<div className="text-center bg-gradient-to-br from-red-50 to-red-100 rounded-md p-4 border border-red-200 shadow-md">
									<p className="text-red-700 text-xs sm:text-sm mb-2 font-medium">
										Rata-rata
									</p>
									{(() => {
										const questionAverages = gradeDetail.question_details
											?.map(q => q.rubric_rata_rata || 0)
											.filter(avg => avg > 0) || [];
										
										const overallAverage = questionAverages.length > 0
											? questionAverages.reduce((sum, val) => sum + val, 0) / questionAverages.length
											: 0;
										
										return overallAverage > 0 ? (
											<p className="text-red-900 text-xl sm:text-2xl font-bold">
												{overallAverage.toFixed(1)}
											</p>
										) : (
											<div>Detail Jawaban per Soal
												<p className="text-red-900 text-xl sm:text-2xl font-bold">
													0.0
												</p>
												<p className="text-red-600 text-xs mt-1">
													Tidak dinilai
												</p>
											</div>
										);
									})()}
								</div>
							</div>
						</div>
					</div>
				)}
				{/* Questions Section */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-3 rounded-md bg-yellow-500 shadow-lg">
							<Books className="w-6 h-6 text-white" weight="bold" />
						</div>
						<h2 className="text-2xl font-bold text-gray-800">
							Detail Jawaban per Soal
						</h2>
					</div>
					<div className="space-y-8">
						{gradeDetail.question_details?.map((qa, index) => (
							<div
								key={qa.question_id}
								className="bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden"
							>
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
													Bobot: {qa.question_points > 0 ? qa.question_points : 0} poin
												</p>
											</div>
										</div>
										<div className="text-right">
											<div className="px-4 py-2 rounded-md bg-yellow-100 border border-yellow-300">
												<span className="text-2xl font-bold text-gray-900">
													{qa.final_score?.toFixed(1) || 0}
												</span>
												<span className="text-gray-600 text-sm ml-1">
													/ {qa.question_points > 0 ? qa.question_points : 0}
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="p-6">
									{qa.question_text && (
										<div className="mb-6">
											<div className="bg-blue-50 rounded-md p-6 relative">
												<button
													onClick={() => handleCopyText(qa.question_text, "Soal", qa.question_id, false)}
													className={`absolute top-3 right-3 p-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg ${copiedQuestions.has(qa.question_id)
															? 'bg-blue-500 text-white'
															: 'bg-blue-500 text-white hover:bg-gray-400'
														}`}
													title={copiedQuestions.has(qa.question_id) ? "Tersalin!" : "Salin soal"}
												>
													{copiedQuestions.has(qa.question_id) ? (
														<Check className="w-4 h-4" weight="bold" />
													) : (
														<Copy className="w-4 h-4" weight="bold" />
													)}
												</button>
												<p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base pr-10">
													{qa.question_text}
												</p>
											</div>
										</div>
									)}

									<div className="mb-6">
										<h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
											<CheckCircle className="w-5 h-5 text-green-600" weight="bold" />
											Jawaban {isTeacher ? "Mahasiswa" : "Anda"}:
										</h3>
										<div className="bg-green-50 rounded-md p-6 relative">
											<button
												onClick={() => handleCopyText(qa.answer_text, "Jawaban", qa.question_id, true)}
												className={`absolute top-3 right-3 p-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg ${copiedAnswers.has(qa.question_id)
														? 'bg-green-500 text-white'
														: 'bg-green-500 text-white hover:bg-gray-400'
													}`}
												title={copiedAnswers.has(qa.question_id) ? "Tersalin!" : "Salin jawaban"}
											>
												{copiedAnswers.has(qa.question_id) ? (
													<Check className="w-4 h-4" weight="bold" />
												) : (
													<Copy className="w-4 h-4" weight="bold" />
												)}
											</button>
											<p className="text-gray-700 leading-relaxed whitespace-pre-wrap pr-10">
												{qa.answer_text}
											</p>
										</div>
									</div>

									{/* Rubric Scores */}
									{qa.rubric_pemahaman !== undefined && (
										<div className="mb-6">
											<h4 className="text-sm font-semibold text-gray-900 mb-3">
												Skor Rubrik:
											</h4>
											{/* 4 Main Rubrics */}
											<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
												<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center border border-blue-200 shadow-sm">
													<p className="text-xs text-blue-700 mb-1 font-medium">
														Pemahaman
													</p>
													{qa.rubric_pemahaman > 0 ? (
														<p className="text-blue-900 font-bold text-lg">
															{qa.rubric_pemahaman.toFixed(1)}
														</p>
													) : (
														<div>
															<p className="text-blue-900 font-bold text-lg">
																0.0
															</p>
															<p className="text-blue-600 text-xs mt-1">
																Tidak dinilai
															</p>
														</div>
													)}
												</div>
												<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center border border-blue-200 shadow-sm">
													<p className="text-xs text-blue-700 mb-1 font-medium">
														Kelengkapan
													</p>
													{qa.rubric_kelengkapan && qa.rubric_kelengkapan > 0 ? (
														<p className="text-blue-900 font-bold text-lg">
															{qa.rubric_kelengkapan.toFixed(1)}
														</p>
													) : (
														<div>
															<p className="text-blue-900 font-bold text-lg">
																0.0
															</p>
															<p className="text-blue-600 text-xs mt-1">
																Tidak dinilai
															</p>
														</div>
													)}
												</div>
												<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center border border-blue-200 shadow-sm">
													<p className="text-xs text-blue-700 mb-1 font-medium">
														Kejelasan
													</p>
													{qa.rubric_kejelasan && qa.rubric_kejelasan > 0 ? (
														<p className="text-blue-900 font-bold text-lg">
															{qa.rubric_kejelasan.toFixed(1)}
														</p>
													) : (
														<div>
															<p className="text-blue-900 font-bold text-lg">
																0.0
															</p>
															<p className="text-blue-600 text-xs mt-1">
																Tidak dinilai
															</p>
														</div>
													)}
												</div>
												<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center border border-blue-200 shadow-sm">
													<p className="text-xs text-blue-700 mb-1 font-medium">
														Analisis
													</p>
													{qa.rubric_analisis && qa.rubric_analisis > 0 ? (
														<p className="text-blue-900 font-bold text-lg">
															{qa.rubric_analisis.toFixed(1)}
														</p>
													) : (
														<div>
															<p className="text-blue-900 font-bold text-lg">
																0.0
															</p>
															<p className="text-blue-600 text-xs mt-1">
																Tidak dinilai
															</p>
														</div>
													)}
												</div>
											</div>

											{/* Similarity and Average */}
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
												<div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center border border-green-200 shadow-sm">
													<p className="text-xs text-green-700 mb-1 font-medium">
														Similarity Score
													</p>
													{qa.embedding_similarity && qa.embedding_similarity > 0 ? (
														<p className="text-green-900 font-bold text-lg">
															{(qa.embedding_similarity * 100).toFixed(1)}%
														</p>
													) : (
														<div>
															<p className="text-green-900 font-bold text-lg">
																0.0%
															</p>
															<p className="text-green-600 text-xs mt-1">
																Tidak dinilai
															</p>
														</div>
													)}
												</div>
												<div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg text-center border border-red-200 shadow-sm">
													<p className="text-xs text-red-700 mb-1 font-medium">
														Rata-rata
													</p>
													{qa.rubric_rata_rata && qa.rubric_rata_rata > 0 ? (
														<p className="text-red-900 font-bold text-lg">
															{qa.rubric_rata_rata.toFixed(1)}
														</p>
													) : (
														<div>
															<p className="text-red-900 font-bold text-lg">
																0.0
															</p>
															<p className="text-red-600 text-xs mt-1">
																Tidak dinilai
															</p>
														</div>
													)}
												</div>
											</div>
										</div>
									)}

									{/* Feedback */}
									{qa.feedback && (
										<div className="mt-6">
											<h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
												<span className="text-yellow-600">💡</span>
												Feedback dari AI:
											</h4>
											<div className="bg-yellow-50 border-2 border-yellow-400 rounded-md p-4">
												<p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
													{qa.feedback}
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}