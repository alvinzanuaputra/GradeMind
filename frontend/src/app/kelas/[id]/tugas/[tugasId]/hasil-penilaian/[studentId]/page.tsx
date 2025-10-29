"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { gradingService, assignmentService } from "@/services";
import { ArrowLeft, Books, CheckCircle, XCircle } from "phosphor-react";
import type { SubmissionDetailResponse } from "@/types";

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

	// Security check for students: verify they're viewing their own submission
	if (!isTeacher && gradeDetail && gradeDetail.student_id !== user?.id) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							Akses Ditolak
						</h2>
						<p className="text-gray-600 mb-4">
							Anda tidak memiliki akses untuk melihat penilaian
							ini.
						</p>
						<Button onClick={handleBack}>Kembali</Button>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<LoadingSpinner
						size="lg"
						text="Memuat detail penilaian..."
					/>
				</div>
			</div>
		);
	}

	if (error || !gradeDetail || !gradeDetail.graded) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							{!gradeDetail
								? "Detail penilaian tidak ditemukan"
								: "Tugas belum dinilai"}
						</h2>
						<p className="text-gray-600 mb-4">
							{!gradeDetail
								? "Mungkin data belum tersedia atau telah dihapus."
								: "Tugas ini belum dinilai oleh sistem."}
						</p>
						<Button onClick={handleBack}>Kembali</Button>
					</div>
				</div>
			</div>
		);
	}

	const isPassed = gradeDetail.percentage && gradeDetail.percentage >= 75;

	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<Navbar />

			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
						<button
							onClick={handleBack}
							className="text-gray-600 hover:text-gray-900 transition-colors"
						>
							<ArrowLeft
								className="w-5 h-5 sm:w-6 sm:h-6"
								weight="bold"
							/>
						</button>
						<div className="flex items-center gap-2 sm:gap-3 flex-1">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-50 flex items-center justify-center">
								<Books
									className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
									weight="bold"
								/>
							</div>
							<div className="flex-1">
								<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
									Detail Penilaian
								</h1>
								<p className="text-sm text-gray-600 mt-1">
									{gradeDetail.student_name}
									{gradeDetail.assignment_title &&
										` - ${gradeDetail.assignment_title}`}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Score Summary Card */}
				<div className="mb-6 sm:mb-8">
					<div
						className={`rounded-xl p-6 ${isPassed
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
											0}
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
										: "N/A"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Rubric Scores */}
				{gradeDetail.avg_pemahaman && (
					<div className="mb-6 sm:mb-8">
						<h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
							Skor Rubrik
						</h2>
						<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
							{/* Baris 1: 4 Rubrik Utama */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
								<div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
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
								<div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
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
								<div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
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
								<div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
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

							{/* Baris 2: Similarity (hijau) dan Rata-rata (merah) */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
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
								<div className="text-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
									<p className="text-red-700 text-xs sm:text-sm mb-2 font-medium">
										Rata-rata
									</p>
									{(() => {
										// Hitung rata-rata dari rubric_rata_rata semua soal
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
											<div>
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

				{/* Question Answers Detail */}
				<div className="mb-6 sm:mb-8">
					<h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
						Detail Jawaban per Soal
					</h2>
					<div className="space-y-4">
						{gradeDetail.question_details?.map((qa, index) => (
							<div
								key={qa.question_id}
								className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm"
							>
								<div className="flex items-start justify-between mb-4">
									<h3 className="text-lg font-semibold text-gray-900">
										Soal {index + 1}
										{qa.question_points > 0 &&
											` (${qa.question_points} poin)`}
									</h3>
									<div className="text-right">
										<span className="text-2xl font-bold text-gray-900">
											{qa.final_score?.toFixed(1) || 0}
										</span>
										<span className="text-gray-600 text-sm ml-1">
											{qa.question_points > 0
												? `/ ${qa.question_points}`
												: "poin"}
										</span>
									</div>
								</div>

								{/* Question Text */}
								{qa.question_text && (
									<div className="mb-4">
										<h4 className="text-sm font-semibold text-gray-900 mb-2">
											Soal:
										</h4>
										<p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
											{qa.question_text}
										</p>
									</div>
								)}

								{/* Answer Text */}
								<div className="mb-4">
									<h4 className="text-sm font-semibold text-gray-900 mb-2">
										Jawaban:
									</h4>
									<p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
										{qa.answer_text}
									</p>
								</div>

								{/* Rubric Scores for this question */}
								{qa.rubric_pemahaman !== undefined && (
									<div className="mb-4">
										<h4 className="text-sm font-semibold text-gray-900 mb-3">
											Skor Rubrik:
										</h4>
										{/* Baris 1: 4 Rubrik Utama */}
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

										{/* Baris 2: Similarity (hijau) dan Rata-rata (merah) */}
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

								{/* Feedback for this question */}
								{qa.feedback && (
									<div>
										<h4 className="text-sm font-semibold text-gray-900 mb-2">
											Feedback:
										</h4>
										<p className="text-gray-700 leading-relaxed bg-blue-50 border border-blue-200 p-3 rounded-lg">
											{qa.feedback}
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-center gap-4">
					<Button onClick={handleBack} variant="outline" size="lg">
						Kembali
					</Button>
				</div>
			</main>
		</div>
	);
}