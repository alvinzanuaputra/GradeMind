"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import ConfirmModal from "@/components/ConfirmModal";
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
	const { data: statistics } = useAssignmentStatistics(assignmentId);
	const { data: grades, isLoading: isLoadingGrades } =
		useAssignmentGrades(assignmentId);
	const autoGradeAll = useAutoGradeAllSubmissions();
	const [showAutoGradeModal, setShowAutoGradeModal] = useState(false);
	const [isGrading, setIsGrading] = useState(false);
	useEffect(() => {
		const gradingKey = `grading_${assignmentId}`;
		const isGradingStored = sessionStorage.getItem(gradingKey);
		if (isGradingStored === 'true') {
			setIsGrading(true);
			toast.loading("Proses penilaian masih berlangsung...", {
				id: 'grading-progress',
				duration: Infinity,
			});
		}
	}, [assignmentId]);

	useEffect(() => {
		const gradingKey = `grading_${assignmentId}`;
		if (!autoGradeAll.isPending && isGrading) {
			const timer = setTimeout(() => {
				sessionStorage.removeItem(gradingKey);
				setIsGrading(false);
				toast.dismiss('grading-progress');
				toast.success("Proses penilaian selesai!");
			}, 2000);
			
			return () => clearTimeout(timer);
		}
	}, [autoGradeAll.isPending, isGrading, assignmentId]);

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
		setShowAutoGradeModal(false);
		const gradingKey = `grading_${assignmentId}`;
		try {
			sessionStorage.setItem(gradingKey, 'true');
			setIsGrading(true);
			
			toast.loading("Memulai proses penilaian otomatis...", {
				id: 'grading-progress',
				duration: Infinity,
			});
			
			await autoGradeAll.mutateAsync(assignmentId);
			sessionStorage.removeItem(gradingKey);
			setIsGrading(false);
			toast.dismiss('grading-progress');
		} catch (error) {
			console.error("Error auto-grading:", error);
			sessionStorage.removeItem(gradingKey);
			setIsGrading(false);
			toast.dismiss('grading-progress');
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
			const validSubmissions = submissionDetails.filter(s => s !== null);
			
			if (validSubmissions.length === 0) {
				toast.dismiss(loadingToast);
				toast.error("Tidak ada data detail submission yang bisa diambil");
				return;
			}

			console.log("Valid submissions:", validSubmissions.length);
			let maxQuestions = 0;
			validSubmissions.forEach((submission) => {
				if (submission && submission.question_details) {
					maxQuestions = Math.max(maxQuestions, submission.question_details.length);
				}
			});
			const headerInfo = [
				["Nama Kelas", assignmentData.class_name || "N/A"],
				["Nama Tugas", assignmentData.title],
				["KKM", statistics.minimal_score],
				[],
			];
			const columnHeaders = [
				"NRP",
				"Nama Lengkap",
				"Username",
				"Nilai Total",
			];
			for (let i = 1; i <= maxQuestions; i++) {
				columnHeaders.push(`Jawaban Soal ${i}`);
				columnHeaders.push(`Skor Soal ${i}`);
				columnHeaders.push(`Rata-rata Rubrik Soal ${i}`);
			}
			const dataRows = validSubmissions.map((submission) => {
				if (!submission) return [];
				
				const row: (string | number)[] = [
					submission.student_nrp || "-",
					submission.student_name || "-",
					submission.student_username || "-",
					submission.total_score || 0,
				];
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

			const allData = [
				...headerInfo,
				columnHeaders,
				...dataRows,
			];

			const wb = XLSX.utils.book_new();
			const ws = XLSX.utils.aoa_to_sheet(allData);
			const colWidths = [
				{ wch: 15 }, 
				{ wch: 25 },
				{ wch: 15 }, 
				{ wch: 12 },
			];

			for (let i = 0; i < maxQuestions; i++) {
				colWidths.push({ wch: 50 }); 
				colWidths.push({ wch: 12 });
				colWidths.push({ wch: 18 });
			}
			ws['!cols'] = colWidths;
			XLSX.utils.book_append_sheet(wb, ws, "Hasil Penilaian");
			const now = new Date();
			const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
			const className = (assignmentData.class_name || "Kelas").replace(/[^a-zA-Z0-9]/g, '_');
			const assignmentTitle = assignmentData.title.replace(/[^a-zA-Z0-9]/g, '_');
			const fileName = `${className}_${assignmentTitle}_${dateStr}.xlsx`;
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

	if (user && user.user_role !== "dosen") {
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
							Hanya dosen yang dapat melihat hasil penilaian
						</p>
						<Button
							onClick={() =>
								router.push(`/kelas/${classId}/tugas`)
							}
							className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-md font-bold shadow-lg"
						>
							<ArrowLeft className="w-5 h-5 inline mr-2" weight="bold" />
							Kembali ke Daftar Tugas
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (isLoadingAssignment || isLoadingGrades) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<LoadingSpinner size="lg" text="Memuat data penilaian..." />
				</div>
			</div>
		);
	}

	if (!assignmentData || !statistics || !grades) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50">
				<Navbar />
				<div className="flex-1 flex items-center justify-center p-4">
					<div className="text-center bg-white rounded-md shadow-xl p-8 max-w-md">
						<div className="w-20 h-20 rounded-md bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto mb-6">
							<Books className="w-10 h-10 text-red-600" weight="bold" />
						</div>
						<h2 className="text-2xl font-bold text-gray-800 mb-3">
							Data tidak ditemukan
						</h2>
						<p className="text-gray-600 mb-6">
							Data penilaian tidak tersedia atau belum ada
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

	const totalStudents = statistics.total_students;
	const totalSubmissions = statistics.total_submissions;
	const gradedStudents = statistics.graded_submissions;
	const passedStudents = statistics.passed_students;
	const failedStudents = statistics.failed_students;
	const passPercentage = Math.round(statistics.pass_percentage);
	const minimalScore = statistics.minimal_score;

	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<Navbar />
			<Toaster position="top-center" />
			<ConfirmModal
				isOpen={showAutoGradeModal}
				onClose={() => setShowAutoGradeModal(false)}
				onConfirm={handleAutoGradeAll}
				title="Nilai Ulang Jawaban"
				message="Apakah Anda yakin ingin menilai ulang? Proses ini akan menggunakan AI untuk menilai semua jawaban yang belum dinilai Atau nilai nya '0'"
				confirmText="Ya, Nilai Ulang"
				cancelText="Batal"
				isLoading={autoGradeAll.isPending}
				isDangerous={false}
			/>

			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{isGrading && (
					<div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-md">
						<div className="flex items-center gap-3">
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
							<div>
								<p className="text-yellow-800 font-bold">Proses Penilaian Sedang Berlangsung</p>
								<p className="text-yellow-600 text-sm">Anda dapat meninggalkan halaman ini. Status akan tetap tersimpan.</p>
							</div>
						</div>
					</div>
				)}
				
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
						<div className="flex items-center gap-2">
							<button
								onClick={() => setShowAutoGradeModal(true)}
								disabled={autoGradeAll.isPending || isGrading}
								className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-md font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Play className="w-4 h-4" weight="bold" />
								{(autoGradeAll.isPending || isGrading) ? "Sedang Menilai ..." : "Nilai Ulang"}
							</button>
							
							<button
								onClick={handleExportExcel}
								disabled={!grades || grades.length === 0}
								className="bg-white hover:bg-gray-100 text-yellow-900 px-4 py-2 rounded-md font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<DownloadSimple className="w-4 h-4" weight="bold" />
								Ekspor Excel
							</button>
						</div>
					</div>

					<div className="bg-yellow-600 rounded-md shadow-xl p-8 mb-6 relative overflow-visible">
						<div className="relative">
							<div className="flex items-center gap-3">
								<div className="w-14 h-14 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
									<Books className="w-7 h-7 text-white" weight="bold" />
								</div>
								<div>
									<h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
										Hasil Penilaian
									</h1>
									<p className="text-blue-100 text-sm font-medium">
										{assignmentData.title}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="mb-6">
					<div className="flex items-center gap-2 mb-4">
						<div className="w-8 h-8 rounded-md bg-yellow-400 flex items-center justify-center shadow-md">
							<span className="text-yellow-900 font-bold text-sm">📊</span>
						</div>
						<h2 className="text-xl font-bold text-gray-800">
							Statistik
						</h2>
					</div>

					<div className="bg-white rounded-md shadow-lg p-6 mb-4 border border-gray-100">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-gray-800 text-lg font-bold">
									Pengumpulan Tugas
								</h3>
								<p className="text-gray-600 text-sm mt-1">
									{totalSubmissions} dari {totalStudents}{" "}
									mahasiswa sudah mengumpulkan
								</p>
							</div>
							<div className="text-right">
								<div className="text-3xl font-bold text-gray-800">
									{totalSubmissions}/{totalStudents}
								</div>
								<p className="text-gray-600 text-sm">
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
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-8 h-8 rounded-md bg-yellow-400 flex items-center justify-center shadow-md">
								<span className="text-yellow-900 font-bold text-sm">📋</span>
							</div>
							<h2 className="text-xl font-bold text-gray-800">
								Daftar Nilai
							</h2>
						</div>
						<div className="bg-white rounded-md shadow-lg p-6 border border-gray-100">
							{grades.length > 0 ? (
								<div className="space-y-3">
									{grades.map((grade) => {
										const isPassed =
											grade.total_score >= minimalScore;
										return (
											<div
												key={grade.id}
												className="bg-gray-50 rounded-md shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-gray-200 hover:shadow-lg transition-shadow"
											>
												<div className="flex-1 min-w-0 w-full sm:w-auto">
													<p className="text-base text-gray-800 font-bold truncate">
														{grade.student_name}
													</p>
													<p className="text-xs text-gray-600">
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

												<div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
													<div
														className={`px-4 py-2 rounded-md font-bold text-white text-base min-w-[80px] text-center shadow-md ${isPassed
																? "bg-green-500"
																: "bg-red-500"
															}`}
													>
														{grade.total_score?.toFixed(
															1
														) || 0}
													</div>
													<button
														onClick={() =>
															handleDetail(grade.submission_id)
														}
														className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-md font-bold shadow-md hover:shadow-lg transition-all min-w-[80px] text-sm"
													>
														Detail
													</button>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-12">
									<p className="text-gray-600">
										Belum ada penilaian
									</p>
								</div>
							)}
						</div>
					</div>
					<div className="bg-white rounded-md shadow-lg p-8 border border-gray-100">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<div>
								<h3 className="text-base text-gray-800 font-bold text-center mb-6">
									Kelulusan
								</h3>
								<div className="flex items-end justify-center gap-12 h-64">
									<div className="flex flex-col items-center">
										<div
											className="w-24 bg-green-500 rounded-t-md relative shadow-lg"
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
											<div className="absolute -top-8 left-1/2 -translate-x-1/2 text-base text-gray-800 font-bold">
												{passedStudents}
											</div>
										</div>
										<div className="mt-3 text-base text-gray-800 font-bold">
											Lulus
										</div>
									</div>
									<div className="flex flex-col items-center">
										<div
											className="w-24 bg-red-500 rounded-t-md relative shadow-lg"
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
											<div className="absolute -top-8 left-1/2 -translate-x-1/2 text-base text-gray-800 font-bold">
												{failedStudents}
											</div>
										</div>
										<div className="mt-3 text-base text-gray-800 font-bold">
											Tidak Lulus
										</div>
									</div>
								</div>
							</div>
							<div>
								<h3 className="text-base text-gray-800 font-bold text-center mb-6">
									Persentase Kelulusan
								</h3>
								<div className="flex items-center justify-center h-64">
									<div className="relative w-48 h-48">
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
											<span className="text-4xl font-bold text-gray-800">
												{passPercentage}%
											</span>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-center gap-8 mt-6">
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 bg-green-500 rounded-md shadow-sm"></div>
										<span className="text-gray-800 text-sm font-semibold">
											Lulus
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 bg-red-500 rounded-md shadow-sm"></div>
										<span className="text-gray-800 text-sm font-semibold">
											Tidak Lulus
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="mt-6 pt-6 border-t border-gray-200">
							<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
								<div className="text-center">
									<p className="text-gray-600 text-sm mb-1 font-semibold">
										Total Submisi
									</p>
									<p className="text-gray-800 text-2xl font-bold">
										{totalSubmissions}
									</p>
								</div>
								<div className="text-center">
									<p className="text-gray-600 text-sm mb-1 font-semibold">
										Dinilai
									</p>
									<p className="text-gray-800 text-2xl font-bold">
										{gradedStudents}
									</p>
								</div>
								<div className="text-center">
									<p className="text-gray-600 text-sm mb-1 font-semibold">
										Nilai Minimal
									</p>
									<p className="text-gray-800 text-2xl font-bold">
										{minimalScore}
									</p>
								</div>
								<div className="text-center">
									<p className="text-gray-600 text-sm mb-1 font-semibold">
										Rata-rata
									</p>
									<p className="text-gray-800 text-2xl font-bold">
										{statistics.average_score?.toFixed(1) ||
											"0"}
									</p>
								</div>
								<div className="text-center">
									<p className="text-gray-600 text-sm mb-1 font-semibold">
										Tertinggi
									</p>
									<p className="text-gray-800 text-2xl font-bold">
										{statistics.highest_score?.toFixed(1) ||
											"0"}
									</p>
								</div>
								<div className="text-center">
									<p className="text-gray-600 text-sm mb-1 font-semibold">
										Skor Maksimal
									</p>
									<p className="text-gray-800 text-2xl font-bold">
										{assignmentData?.max_score || "0"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				{grades.length > 0 && (
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-8 h-8 rounded-md bg-yellow-400 flex items-center justify-center shadow-md">
								<span className="text-yellow-900 font-bold text-sm">📈</span>
							</div>
							<h2 className="text-xl font-bold text-gray-800">
								Distribusi Nilai
							</h2>
						</div>
						<div className="bg-white rounded-md shadow-lg p-8 border border-gray-100">
							<div className="flex items-end justify-center gap-4 sm:gap-6 h-64 sm:h-80">
								{(() => {
									const maxScore = assignmentData?.max_score || 100;
									const ranges: Array<{ min: number; max: number; count: number }> = [];
									for (let i = 0; i <= maxScore; i += 5) {
										ranges.push({ min: i, max: Math.min(i + 5, maxScore), count: 0 });
									}
									grades.forEach((grade) => {
										const score = grade.total_score;
										const rangeIndex = Math.floor(score / 5);
										if (ranges[rangeIndex]) {
											ranges[rangeIndex].count++;
										}
									});
									const maxCount = Math.max(...ranges.map(r => r.count), 1);
									const relevantRanges = ranges.filter((r, idx) => {
										if (r.count > 0) return true;
										if (idx > 0 && ranges[idx - 1].count > 0) return true;
										if (idx < ranges.length - 1 && ranges[idx + 1].count > 0) return true;
										return false;
									});
									const displayRanges = relevantRanges.length > 15 
										? ranges.filter(r => r.min % 10 === 0 || r.count > 0)
										: relevantRanges;

									return displayRanges.map((range, index) => (
										<div key={index} className="flex flex-col items-center flex-1 min-w-0">
											<div
												className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md relative hover:from-blue-600 hover:to-blue-500 transition-all shadow-lg"
												style={{
													height: range.count > 0 ? `${(range.count / maxCount) * 250}px` : '4px',
													minHeight: '4px',
													maxHeight: '250px',
												}}
											>
												{range.count > 0 && (
													<div className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm text-gray-800 font-bold whitespace-nowrap">
														{range.count}
													</div>
												)}
											</div>
											<div className="mt-2 text-xs text-gray-800 font-semibold text-center whitespace-nowrap">
												{range.min}-{range.max}
											</div>
										</div>
									));
								})()}
							</div>
							<div className="mt-4 text-center text-sm text-gray-600 font-semibold">
								Rentang Nilai (Per 5 Poin)
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}