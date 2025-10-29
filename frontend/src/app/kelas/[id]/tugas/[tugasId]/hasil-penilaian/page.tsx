"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useAssignmentDetail } from "@/hooks/useAssignments";
import {
	useAssignmentStatistics,
	useAssignmentGrades,
	useAutoGradeAllSubmissions,
} from "@/hooks/useGrading";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Books, Play, DownloadSimple } from "phosphor-react";
import * as XLSX from "xlsx";
import { gradingService } from "@/services";
// import { DotsThreeVertical } from "phosphor-react";

export default function HasilPenilaianPage() {
	return (
		<ProtectedRoute>
			<HasilPenilaianContent />
		</ProtectedRoute>
	);
}

function HasilPenilaianContent() {
	const router = useRouter();
	const params = useParams();
	const classId = parseInt(params.id as string);
	const assignmentId = parseInt(params.tugasId as string);
	const { user } = useAuth();

	const { data: assignmentData, isLoading: isLoadingAssignment } =
		useAssignmentDetail(assignmentId);
	const { data: statistics, isLoading: isLoadingStatistics } =
		useAssignmentStatistics(assignmentId);
	const { data: grades, isLoading: isLoadingGrades } =
		useAssignmentGrades(assignmentId);
	const autoGradeAll = useAutoGradeAllSubmissions();

	useEffect(() => {
		if (user && user.user_role !== "dosen") {
			toast.error("Hanya dosen yang dapat melihat hasil penilaian");
			router.push(`/kelas/${classId}`);
		}
	}, [user, router, classId]);

	const handleBack = () => {
		router.push(`/kelas/${classId}`);
	};

	const handleDetail = (gradeId: number) => {
		router.push(
			`/kelas/${classId}/tugas/${assignmentId}/hasil-penilaian/${gradeId}`
		);
	};

	const handleAutoGradeAll = async () => {
		if (
			window.confirm(
				"Apakah Anda yakin ingin menilai semua jawaban secara otomatis?"
			)
		) {
			try {
				await autoGradeAll.mutateAsync(assignmentId);
			} catch (error) {
				console.error("Error auto-grading:", error);
			}
		}
	};

	const handleExportExcel = async () => {
		if (!grades || grades.length === 0) {
			toast.error("Tidak ada data untuk diekspor");
			return;
		}

		if (!assignmentData || !statistics) {
			toast.error("Data tugas tidak lengkap");
			return;
		}

		const loadingToast = toast.loading("Mempersiapkan data export...");

		try {
			console.log("Starting export with grades:", grades.length);
			
			// Fetch detail untuk setiap submission untuk mendapatkan jawaban
			const submissionDetails = await Promise.all(
				grades.map(async (grade) => {
					try {
						const detail = await gradingService.getSubmissionDetails(grade.submission_id);
						return detail;
					} catch (error) {
						console.error(`Failed to fetch submission ${grade.submission_id}:`, error);
						return null;
					}
				})
			);

			// Filter out null values
			const validSubmissions = submissionDetails.filter(s => s !== null);
			
			if (validSubmissions.length === 0) {
				toast.dismiss(loadingToast);
				toast.error("Tidak ada data detail submission yang bisa diambil");
				return;
			}

			console.log("Valid submissions:", validSubmissions.length);

			// Find max number of questions
			let maxQuestions = 0;
			validSubmissions.forEach((submission) => {
				if (submission && submission.question_details) {
					maxQuestions = Math.max(maxQuestions, submission.question_details.length);
				}
			});

			// Prepare header info (get class name from URL or assignmentData)
			const headerInfo = [
				["Nama Kelas", assignmentData.class_name || "N/A"],
				["Nama Tugas", assignmentData.title],
				["KKM", statistics.minimal_score],
				[], // Empty row
			];

			// Prepare column headers
			const columnHeaders = [
				"NRP",
				"Nama Lengkap",
				"Username",
				"Nilai Total",
			];

			// Add question columns dynamically (Jawaban + Skor + Rata-rata)
			for (let i = 1; i <= maxQuestions; i++) {
				columnHeaders.push(`Jawaban Soal ${i}`);
				columnHeaders.push(`Skor Soal ${i}`);
				columnHeaders.push(`Rata-rata Rubrik Soal ${i}`);
			}

			// Prepare data rows
			const dataRows = validSubmissions.map((submission) => {
				if (!submission) return [];
				
				const row: (string | number)[] = [
					submission.student_nrp || "-",
					submission.student_name || "-",
					submission.student_username || "-",
					submission.total_score || 0,
				];

				// Add answers, scores, and avg rubric for each question
				if (submission.question_details) {
					for (let i = 0; i < maxQuestions; i++) {
						const qa = submission.question_details[i];
						if (qa) {
							row.push(qa.answer_text || "-");
							row.push(qa.final_score || 0);
							row.push(qa.rubric_rata_rata || 0);
						} else {
							row.push("-");
							row.push(0);
							row.push(0);
						}
					}
				}

				return row;
			});

			// Combine all data
			const allData = [
				...headerInfo,
				columnHeaders,
				...dataRows,
			];

			// Create workbook and worksheet
			const wb = XLSX.utils.book_new();
			const ws = XLSX.utils.aoa_to_sheet(allData);

			// Set column widths
			const colWidths = [
				{ wch: 15 },  // NRP
				{ wch: 25 },  // Nama Lengkap
				{ wch: 15 },  // Username
				{ wch: 12 },  // Nilai Total
			];

			// Add width for question columns (Jawaban + Skor + Rata-rata)
			for (let i = 0; i < maxQuestions; i++) {
				colWidths.push({ wch: 50 }); // Jawaban (wide)
				colWidths.push({ wch: 12 }); // Skor
				colWidths.push({ wch: 18 }); // Rata-rata Rubrik
			}

			ws['!cols'] = colWidths;

			// Add worksheet to workbook
			XLSX.utils.book_append_sheet(wb, ws, "Hasil Penilaian");

			// Generate filename with format: NAMAKELAS_TIPE-TUGAS_TANGGAL.xlsx
			const now = new Date();
			const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
			const className = (assignmentData.class_name || "Kelas").replace(/[^a-zA-Z0-9]/g, '_');
			const assignmentTitle = assignmentData.title.replace(/[^a-zA-Z0-9]/g, '_');
			const fileName = `${className}_${assignmentTitle}_${dateStr}.xlsx`;

			// Save file
			XLSX.writeFile(wb, fileName);
			
			toast.dismiss(loadingToast);
			toast.success("Data berhasil diekspor ke Excel");
		} catch (error) {
			console.error("Error exporting to Excel:", error);
			toast.dismiss(loadingToast);
			const errorMessage = error instanceof Error ? error.message : "Gagal mengekspor data ke Excel";
			toast.error(errorMessage);
		}
	};

	// Show access denied message for non-teachers
	if (user && user.user_role !== "dosen") {
		return (
			<div className="min-h-screen flex flex-col bg-white">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-black mb-2">
							Akses Ditolak
						</h2>
						<p className="text-black mb-4">
							Hanya dosen yang dapat melihat hasil penilaian
						</p>
						<Button
							onClick={() =>
								router.push(`/kelas/${classId}/tugas`)
							}
						>
							Kembali ke Daftar Tugas
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (isLoadingAssignment || isLoadingStatistics || isLoadingGrades) {
		return (
			<div className="min-h-screen flex flex-col bg-white">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<LoadingSpinner size="lg" text="Memuat data penilaian..." />
				</div>
			</div>
		);
	}

	if (!assignmentData || !statistics || !grades) {
		return (
			<div className="min-h-screen flex flex-col bg-white">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-black mb-2">
							Data tidak ditemukan
						</h2>
						<Button onClick={handleBack}>Kembali</Button>
					</div>
				</div>
			</div>
		);
	}

	const totalStudents = statistics.total_students;
	const totalSubmissions = statistics.total_submissions;
	const gradedStudents = statistics.graded_submissions;
	const passedStudents = statistics.passed_students;
	const failedStudents = statistics.failed_students;
	const passPercentage = Math.round(statistics.pass_percentage);
	const minimalScore = statistics.minimal_score;

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Navbar />
			<Toaster position="top-center" />

			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex items-center justify-between mb-4 sm:mb-6">
						<div className="flex items-center gap-3 sm:gap-4">
							<button
								onClick={handleBack}
								className="text-black hover:text-gray-300 transition-colors"
							>
								<ArrowLeft
									className="w-5 h-5 sm:w-6 sm:h-6"
									weight="bold"
								/>
							</button>
							<div className="flex items-center gap-2 sm:gap-3">
								<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white flex items-center justify-center">
									<Books
										className="w-5 h-5 sm:w-6 sm:h-6 text-black"
										weight="bold"
									/>
								</div>
								<div>
									<h1 className="text-2xl sm:text-3xl font-bold text-black">
										Hasil Penilaian
									</h1>
									<p className="text-sm text-black mt-1">
										{assignmentData.title}
									</p>
								</div>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={handleAutoGradeAll}
								variant="primary"
								size="sm"
								className="flex items-center gap-2"
								disabled={autoGradeAll.isPending}
							>
								<Play className="w-4 h-4" weight="bold" />
								{autoGradeAll.isPending
									? "Menilai..."
									: "Nilai Semua"}
							</Button>
							
							<Button
								onClick={handleExportExcel}
								variant="secondary"
								size="sm"
								className="flex items-center gap-2"
								disabled={!grades || grades.length === 0}
							>
								<DownloadSimple className="w-4 h-4" weight="bold" />
								Ekspor Excel
							</Button>
						</div>
					</div>
				</div>

				{/* Statistik Section */}
				<div className="mb-6 sm:mb-8">
					<h2 className="text-lg sm:text-xl font-semibold text-black mb-4">
						Statistik
					</h2>

					{/* Submission Count Header */}
					<div className="bg-white border border-gray-700 rounded-xl p-4 mb-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-black text-lg font-semibold">
									Pengumpulan Tugas
								</h3>
								<p className="text-black text-sm mt-1">
									{totalSubmissions} dari {totalStudents}{" "}
									mahasiswa sudah mengumpulkan
								</p>
							</div>
							<div className="text-right">
								<div className="text-3xl font-bold text-black">
									{totalSubmissions}/{totalStudents}
								</div>
								<p className="text-black text-sm">
									(
									{totalStudents > 0
										? Math.round(
											(totalSubmissions /
												totalStudents) *
											100
										)
										: 0}
									%)
								</p>
							</div>
						</div>
					</div>
					<div className="mb-6 sm:mb-8">
						<h2 className="text-lg sm:text-xl font-semibold text-black mb-4">
							Daftar Nilai
						</h2>
						<div className="bg-white border border-gray-700 rounded-xl p-4 sm:p-6">
							{grades.length > 0 ? (
								<div className="space-y-2 sm:space-y-3">
									{grades.map((grade) => {
										const isPassed =
											grade.total_score >= minimalScore;
										return (
											<div
												key={grade.id}
												className="bg-white rounded-lg border shadow-md p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
											>
												<div className="flex-1 min-w-0 w-full sm:w-auto">
													<p className="text-sm sm:text-base text-black font-medium truncate">
														{grade.student_name}
													</p>
													<p className="text-xs text-black">
														{new Date(
															grade.graded_at
														).toLocaleDateString(
															"id-ID",
															{
																day: "numeric",
																month: "long",
																year: "numeric",
															}
														)}
													</p>
												</div>

												{/* Score Badge and Actions */}
												<div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
													{/* Score Badge */}
													<div
														className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-black text-sm sm:text-base min-w-[60px] sm:min-w-[80px] text-center ${isPassed
																? "bg-green-500"
																: "bg-red-500"
															}`}
													>
														{grade.total_score?.toFixed(
															1
														) || 0}
													</div>
													<Button
														onClick={() =>
															handleDetail(grade.submission_id)
														}
														variant="outline"
														size="sm"
														className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black min-w-[70px] sm:min-w-[80px] text-xs sm:text-sm"
													>
														Detail
													</Button>

													{/* Menu Button */}
													{/* <button
													onClick={() =>
														console.log(
															"Menu",
															grade.id
														)
													}
													className="text-black hover:text-black transition-colors p-1 sm:p-2"
												>
													<DotsThreeVertical
														className="w-4 h-4 sm:w-5 sm:h-5"
														weight="bold"
													/>
												</button> */}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-12">
									<p className="text-black">
										Belum ada penilaian
									</p>
								</div>
							)}
						</div>
					</div>
					<div className="bg-white border border-gray-700 rounded-xl p-4 sm:p-6 lg:p-8">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
							{/* Bar Chart - Kelulusan */}
							<div>
								<h3 className="text-sm sm:text-base text-black font-semibold text-center mb-4 sm:mb-6">
									Kelulusan
								</h3>
								<div className="flex items-end justify-center gap-8 sm:gap-12 h-48 sm:h-64">
									{/* Lulus Bar */}
									<div className="flex flex-col items-center">
										<div
											className="w-16 sm:w-24 bg-green-500 rounded-t-lg relative"
											style={{
												height:
													gradedStudents > 0
														? `${(passedStudents /
															gradedStudents) *
														100 *
														1.8
														}px`
														: "0px",
												maxHeight: "180px",
											}}
										>
											<div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 text-sm sm:text-base text-black font-semibold">
												{passedStudents}
											</div>
										</div>
										<div className="mt-2 sm:mt-3 text-xs sm:text-base text-black font-medium">
											Lulus
										</div>
									</div>
									<div className="flex flex-col items-center">
										<div
											className="w-16 sm:w-24 bg-red-500 rounded-t-lg relative"
											style={{
												height:
													gradedStudents > 0
														? `${(failedStudents /
															gradedStudents) *
														100 *
														1.8
														}px`
														: "0px",
												maxHeight: "180px",
											}}
										>
											<div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 text-sm sm:text-base text-black font-semibold">
												{failedStudents}
											</div>
										</div>
										<div className="mt-2 sm:mt-3 text-xs sm:text-base text-black font-medium">
											Tidak Lulus
										</div>
									</div>
								</div>
							</div>
							<div>
								<h3 className="text-sm sm:text-base text-black font-semibold text-center mb-4 sm:mb-6">
									Persentase Kelulusan
								</h3>
								<div className="flex items-center justify-center h-48 sm:h-64">
									<div className="relative w-36 h-36 sm:w-48 sm:h-48">
										<svg
											className="w-full h-full -rotate-90"
											viewBox="0 0 100 100"
										>
											<circle
												cx="50"
												cy="50"
												r="40"
												fill="none"
												stroke="#f44336"
												strokeWidth="12"
											/>
											<circle
												cx="50"
												cy="50"
												r="40"
												fill="none"
												stroke="#22c55e"
												strokeWidth="12"
												strokeDasharray={`${passPercentage * 2.51
													} ${251 - passPercentage * 2.51
													}`}
												strokeLinecap="round"
											/>
										</svg>
										<div className="absolute inset-0 flex items-center justify-center">
											<span className="text-3xl sm:text-4xl font-bold text-black">
												{passPercentage}%
											</span>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-center gap-6 sm:gap-8 mt-4 sm:mt-6">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
										<span className="text-black text-xs sm:text-sm">
											Lulus
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded"></div>
										<span className="text-black text-xs sm:text-sm">
											Tidak Lulus
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="mt-6 pt-6 border-t border-gray-700">
							<div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
								<div className="text-center">
									<p className="text-black text-xs sm:text-sm mb-1">
										Total Submisi
									</p>
									<p className="text-black text-xl sm:text-2xl font-bold">
										{totalSubmissions}
									</p>
								</div>
								<div className="text-center">
									<p className="text-black text-xs sm:text-sm mb-1">
										Dinilai
									</p>
									<p className="text-black text-xl sm:text-2xl font-bold">
										{gradedStudents}
									</p>
								</div>
								<div className="text-center">
									<p className="text-black text-xs sm:text-sm mb-1">
										Nilai Minimal
									</p>
									<p className="text-black text-xl sm:text-2xl font-bold">
										{minimalScore}
									</p>
								</div>
								<div className="text-center">
									<p className="text-black text-xs sm:text-sm mb-1">
										Rata-rata
									</p>
									<p className="text-black text-xl sm:text-2xl font-bold">
										{statistics.average_score?.toFixed(1) ||
											"0"}
									</p>
								</div>
								<div className="text-center">
									<p className="text-black text-xs sm:text-sm mb-1">
										Tertinggi
									</p>
									<p className="text-black text-xl sm:text-2xl font-bold">
										{statistics.highest_score?.toFixed(1) ||
											"0"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Histogram Distribusi Nilai */}
				{grades.length > 0 && (
					<div className="mb-6 sm:mb-8">
						<h2 className="text-lg sm:text-xl font-semibold text-black mb-4">
							Distribusi Nilai
						</h2>
						<div className="bg-white border border-gray-700 rounded-xl p-4 sm:p-6 lg:p-8">
							<div className="flex items-end justify-center gap-4 sm:gap-6 h-64 sm:h-80">
								{(() => {
									// Create score ranges (0-5, 5-10, ..., 95-100)
									const ranges: Array<{ min: number; max: number; count: number }> = [];
									for (let i = 0; i <= 100; i += 5) {
										ranges.push({ min: i, max: i + 5, count: 0 });
									}

									// Count scores in each range
									grades.forEach((grade) => {
										const score = grade.total_score;
										const rangeIndex = Math.floor(score / 5);
										if (ranges[rangeIndex]) {
											ranges[rangeIndex].count++;
										}
									});

									// Find max count for scaling
									const maxCount = Math.max(...ranges.map(r => r.count), 1);

									// Only show ranges that have data or are near data
									const relevantRanges = ranges.filter((r, idx) => {
										if (r.count > 0) return true;
										// Show adjacent ranges for context
										if (idx > 0 && ranges[idx - 1].count > 0) return true;
										if (idx < ranges.length - 1 && ranges[idx + 1].count > 0) return true;
										return false;
									});

									// Limit to show specific ranges if too many
									const displayRanges = relevantRanges.length > 15 
										? ranges.filter(r => r.min % 10 === 0 || r.count > 0)
										: relevantRanges;

									return displayRanges.map((range, index) => (
										<div key={index} className="flex flex-col items-center flex-1 min-w-0">
											<div
												className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative hover:from-blue-600 hover:to-blue-500 transition-colors"
												style={{
													height: range.count > 0 ? `${(range.count / maxCount) * 250}px` : '4px',
													minHeight: '4px',
													maxHeight: '250px',
												}}
											>
												{range.count > 0 && (
													<div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-black font-semibold whitespace-nowrap">
														{range.count}
													</div>
												)}
											</div>
											<div className="mt-2 text-xs text-black font-medium text-center whitespace-nowrap">
												{range.min}-{range.max}
											</div>
										</div>
									));
								})()}
							</div>
							<div className="mt-4 text-center text-sm text-gray-600">
								Rentang Nilai (Per 5 Poin)
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
