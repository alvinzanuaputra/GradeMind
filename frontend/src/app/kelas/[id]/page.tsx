"use client";

import { useState, useRef, useEffect } from "react";

import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { useClassDetail } from "@/hooks/useClasses";
import {
	useClassAssignments,
	useDeleteAssignment,
} from "@/hooks/useAssignments";
import { classService } from "@/services";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Eye,
  UserPlus,
  DotsThreeVertical,
  Plus,
  CalendarBlank,
  Trash,
  PencilSimple,
  Pencil,
} from "phosphor-react";
export default function ClassDetailPage() {
	return (
		<ProtectedRoute>
			<ClassDetailContent />
		</ProtectedRoute>
	);
}

function ClassDetailContent() {

	// Array of colors for assignments (ordered, can be expanded)
	const assignmentColors = [
		"bg-gradient-to-br from-yellow-600 to-yellow-700",
		"bg-gradient-to-br from-blue-700 to-blue-800",
		"bg-gradient-to-br from-green-600 to-green-700",
		"bg-gradient-to-br from-pink-600 to-pink-700",
		"bg-gradient-to-br from-purple-600 to-purple-700",
		"bg-gradient-to-br from-orange-600 to-orange-700",
		"bg-gradient-to-br from-teal-600 to-teal-700",
		"bg-gradient-to-br from-indigo-600 to-indigo-700",
		"bg-gradient-to-br from-red-600 to-red-700",
		"bg-gradient-to-br from-cyan-600 to-cyan-700",
		"bg-gradient-to-br from-lime-600 to-lime-700",
		"bg-gradient-to-br from-amber-600 to-amber-700",
		"bg-gradient-to-br from-fuchsia-600 to-fuchsia-700",
		"bg-gradient-to-br from-rose-600 to-rose-700",
		"bg-gradient-to-br from-sky-600 to-sky-700",
	];

	const getAssignmentColor = (index: number) => {
		return assignmentColors[index % assignmentColors.length];
	};


	const router = useRouter();
	const params = useParams();
	const classId = parseInt(params.id as string);
	const { user } = useAuth();

	const { data: classData, isLoading: isLoadingClass } =
		useClassDetail(classId);
	const { data: assignments, isLoading: isLoadingAssignments } =
		useClassAssignments(classId);
	const deleteAssignment = useDeleteAssignment();

	const [openMenuId, setOpenMenuId] = useState<number | null>(null);
	const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
	const [isDeletingClass, setIsDeletingClass] = useState(false);
	const [showDeleteClassModal, setShowDeleteClassModal] = useState(false);
	const [showDeleteAssignmentModal, setShowDeleteAssignmentModal] = useState(false);
	const [selectedAssignment, setSelectedAssignment] = useState<{ id: number; title: string } | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const classMenuRef = useRef<HTMLDivElement>(null);

	const isTeacher = user?.id === classData?.teacher_id;

	const handleBack = () => {
		router.push("/dashboard");
	};

	const handleEditClass = () => {
		setIsClassMenuOpen(false);
		router.push(`/kelas/${classId}/edit`);
	};

	const handleDeleteClass = async () => {
		if (!classData) return;
		setShowDeleteClassModal(false);
		setIsDeletingClass(true);
		setIsClassMenuOpen(false);

		try {
			await classService.deleteClass(classId);
			toast.success("Kelas berhasil dihapus!");
			router.push("/dashboard");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error("Error deleting class:", error);
			toast.error(
				error.response?.data?.detail || "Gagal menghapus kelas"
			);
			setIsDeletingClass(false);
		}
	};

	const handleOpenDeleteClassModal = () => {
		setIsClassMenuOpen(false);
		setShowDeleteClassModal(true);
	};




	const handleDeleteAssignment = async () => {
		if (!selectedAssignment) return;
		
		setShowDeleteAssignmentModal(false);
		try {
			await deleteAssignment.mutateAsync(selectedAssignment.id);
			setOpenMenuId(null);
			setSelectedAssignment(null);
		} catch (error) {
			console.error("Error deleting assignment:", error);
		}
	};

	const handleOpenDeleteAssignmentModal = (assignmentId: number, assignmentTitle: string) => {
		setSelectedAssignment({ id: assignmentId, title: assignmentTitle });
		setShowDeleteAssignmentModal(true);
		setOpenMenuId(null);
	};

	const handleEditAssignment = (assignmentId: number) => {
		router.push(
			`/kelas/${classId}/tugas/baru?assignmentId=${assignmentId}`
		);
		setOpenMenuId(null);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setOpenMenuId(null);
			}
			if (
				classMenuRef.current &&
				!classMenuRef.current.contains(event.target as Node)
			) {
				setIsClassMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (isLoadingClass || isLoadingAssignments) {
		return (
			<div className="min-h-screen flex flex-col bg-white">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<LoadingSpinner size="lg" text="Memuat data kelas..." />
				</div>
			</div>
		);
	}

	if (!classData) {
		return (
			<div className="min-h-screen flex flex-col bg-white">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-dark mb-2">
							Kelas tidak ditemukan
						</h2>
						<Button onClick={handleBack}>Kembali ke Beranda</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Navbar />
			<Toaster position="top-center" />
			<ConfirmModal
				isOpen={showDeleteClassModal}
				onClose={() => setShowDeleteClassModal(false)}
				onConfirm={handleDeleteClass}
				title="Hapus Kelas"
				message={`Apakah Anda yakin ingin menghapus kelas "${classData?.name}"? Semua data tugas dan peserta akan hilang. Tindakan ini tidak dapat dibatalkan.`}
				confirmText="Ya, Hapus Kelas"
				cancelText="Batal"
				isLoading={isDeletingClass}
				isDangerous={true}
			/>
			<ConfirmModal
				isOpen={showDeleteAssignmentModal}
				onClose={() => {
					setShowDeleteAssignmentModal(false);
					setSelectedAssignment(null);
				}}
				onConfirm={handleDeleteAssignment}
				title="Hapus Tugas"
				message={`Apakah Anda yakin ingin menghapus tugas "${selectedAssignment?.title}"? Tindakan ini tidak dapat dibatalkan.`}
				confirmText="Ya, Hapus Tugas"
				cancelText="Batal"
				isLoading={deleteAssignment.isPending}
				isDangerous={true}
			/>

			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				<div className="mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
						<div className="flex items-center gap-3 sm:gap-4 flex-1">
							<button
								onClick={handleBack}
								className="text-dark hover:text-gray-300 transition-colors"
							>
								<ArrowLeft
									className="w-5 h-5 sm:w-6 sm:h-6"
									weight="bold"
								/>
							</button>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<h1 className="text-2xl sm:text-3xl font-bold text-dark">
										{classData.name}
									</h1>
									{isTeacher && (
										<div className="relative" ref={classMenuRef}>
											<button
												onClick={() =>
													setIsClassMenuOpen(!isClassMenuOpen)
												}
												disabled={isDeletingClass}
												className="text-yellow-500 hover:text-yellow-400 bg-black hover:bg-gray-700 rounded-full p-1.5 transition-colors disabled:opacity-50"
											>
												<PencilSimple
													className="w-5 h-5"
													weight="bold"
												/>
											</button>
											{isClassMenuOpen && (
												<div className="absolute left-0 top-full mt-2 w-48 bg-white border-2 border-gray-200 rounded-md shadow-2xl z-50 overflow-hidden">
													<button
														onClick={handleEditClass}
														className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
													>
														<Pencil
															className="w-5 h-5 text-blue-600"
															weight="bold"
														/>
														<span className="font-medium">Edit Kelas</span>
													</button>
													<button
														onClick={handleOpenDeleteClassModal}
														disabled={isDeletingClass}
														className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 disabled:opacity-50 border-t border-gray-100"
													>
														<Trash
															className="w-5 h-5"
															weight="bold"
														/>
														<span className="font-medium">
															{isDeletingClass
																? "Menghapus..."
																: "Hapus Kelas"}
														</span>
													</button>
												</div>
											)}
										</div>
									)}
								</div>
								<p className="text-sm text-gray-700 mt-1">
									{classData.teacher_name}
								</p>
							</div>
						</div>

						{isTeacher && (
							<div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
								<Button
									onClick={() =>
										router.push(`/kelas/${classId}/peserta`)
									}
									size="sm"
									className="flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm !bg-gray-700 hover:bg-gray-500 !text-dark"
								>
									<Eye
										className="w-4 h-4 sm:w-5 sm:h-5 !text-dark"
										weight="bold"
									/>
									<span className="hidden sm:inline">
										Lihat Peserta
									</span>
									<span className="sm:hidden">Peserta</span>
								</Button>
								<Button
									onClick={() =>
										router.push(
											`/kelas/${classId}/undang-peserta`
										)
									}
									variant="primary"
									size="sm"
									className="flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
								>
									<UserPlus
										className="w-4 h-4 sm:w-5 sm:h-5"
										weight="bold"
									/>
									<span className="hidden sm:inline">
										Undang Peserta
									</span>
									<span className="sm:hidden">Undang</span>
								</Button>
							</div>
						)}
					</div>

					<div className="border-2 border-gray-100 p-6 rounded-md shadow-lg bg-white">
						<p className="text-gray-800 font-bold text-sm">Deskripsi :</p>
						{classData.description && (
							<p className="text-gray-600 text-sm sm:text-base">
								{classData.description}
							</p>
						)}
					</div>
				</div>

				<div className="mb-6">
					<h2 className="text-lg sm:text-xl font-semibold text-dark mb-4">
						Semua Daftar Penilaian
					</h2>
					<div className="space-y-3 sm:space-y-4">
						{assignments && assignments.length > 0 ? (
							<>
								{assignments.map((assignment, index) => {
									const cardColor = getAssignmentColor(index);
									const isMenuOpen = openMenuId !== null;
									const isThisMenuOpen = openMenuId === assignment.id;
									return (
										<div
											key={assignment.id}
											className={
												`${cardColor} rounded-md p-3 sm:p-4 flex items-center justify-between transition-all shadow-xl hover:shadow-2xl cursor-pointer relative` +
												(!isMenuOpen || isThisMenuOpen ? 'hover:scale-[1.01]' : 'pointer-events-none opacity-80')
											}
											style={isThisMenuOpen ? {zIndex: 60} : {}}
											onClick={() =>
												router.push(
													`/kelas/${classId}/tugas/${assignment.id}`
												)
											}
										>
											<div className="flex items-center gap-3 sm:gap-4">
												<CalendarBlank
													className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 drop-shadow mr-2"
													weight="bold"
												/>
												<div className="flex flex-col gap-1">
													<h3 className="text-base sm:text-lg font-bold text-white drop-shadow">
														{assignment.title}
													</h3>
													<p className="text-xs sm:text-sm text-white/90 drop-shadow">
														{assignment.deadline
															? `Deadline: ${new Date(
																assignment.deadline
															).toLocaleDateString(
																"id-ID",
																{
																	day: "numeric",
																	month: "long",
																	year: "numeric",
																}
															)}`
															: "Tidak ada deadline"}
													</p>
												</div>
											</div>

											{isTeacher && (
												<div className="relative">
													<button
														onClick={(e) => {
															e.stopPropagation();
															setOpenMenuId(
																openMenuId ===
																	assignment.id
																	? null
																	: assignment.id
															);
														}}
														className="!text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-colors"
													>
														<DotsThreeVertical
															className="w-5 h-5"
															weight="bold"
														/>
													</button>
													{isThisMenuOpen && (
														<div
															ref={menuRef}
															className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-gray-200 rounded-md shadow-2xl z-[70] overflow-hidden"
															onClick={(e) =>
																e.stopPropagation()
															}
														>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handleEditAssignment(
																		assignment.id
																	);
																}}
																className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
															>
																<PencilSimple
																	className="w-5 h-5 text-blue-600"
																	weight="bold"
																/>
																<span className="font-medium">
																	Edit Tugas
																</span>
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handleOpenDeleteAssignmentModal(
																		assignment.id,
																		assignment.title
																	);
																}}
																className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-gray-100"
															>
																<Trash
																	className="w-5 h-5"
																	weight="bold"
																/>
																<span className="font-medium">
																	Hapus Tugas
																</span>
															</button>
														</div>
													)}
												</div>
											)}
										</div>
									);
								})}
							</>
						) : (
							<div className="text-center py-8 text-black">
								Belum ada tugas untuk kelas ini
							</div>
						)}
						{isTeacher && (
							<button
								onClick={() =>
									router.push(`/kelas/${classId}/tugas/baru`)
								}
								className="w-full border-2 border-dashed border-gray-300 hover:border-yellow-400 bg-white rounded-md p-4 sm:p-6 flex items-center justify-center gap-2 sm:gap-3 transition-all hover:bg-gray-50 group hover:scale-[1.02] shadow-lg hover:shadow-xl"
							>
								<Plus
									className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 group-hover:text-yellow-400"
									weight="bold"
								/>
								<span className="text-sm sm:text-base text-black font-bold">
									Tambah Penilaian Baru
								</span>
							</button>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}