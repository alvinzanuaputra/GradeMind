"use client";

import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import { useClassDetail, useRemoveParticipant } from "@/hooks/useClasses";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Books, Trash, User } from "phosphor-react";
import { Toaster } from "react-hot-toast";

export default function PesertaPage() {
	return (
		<ProtectedRoute>
			<PesertaContent />
		</ProtectedRoute>
	);
}

function PesertaContent() {
	const router = useRouter();
	const params = useParams();
	const classId = parseInt(params.id as string);
	const { user } = useAuth();

	const { data: classData, isLoading } = useClassDetail(classId);
	const removeParticipant = useRemoveParticipant();

	const handleBack = () => {
		router.push(`/kelas/${classId}`);
	};

	const handleRemoveParticipant = async (
		userId: number,
		userName: string
	) => {
		if (
			window.confirm(
				`Apakah Anda yakin ingin menghapus ${userName} dari kelas ini?`
			)
		) {
			try {
				await removeParticipant.mutateAsync({ classId, userId });
			} catch (error) {
				console.error("Error removing participant:", error);
			}
		}
	};

	const isTeacher = user?.id === classData?.teacher_id;

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col bg-white">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<LoadingSpinner size="lg" text="Memuat data peserta..." />
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
						<Button onClick={() => router.push("/kelas")}>
							Kembali ke Kelas
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const participants = classData.participants || [];

	// Array of gradient color classes
	const GRADIENTS = [
		'from-blue-500 to-blue-700',
		'from-yellow-500 to-yellow-700',
		'from-green-500 to-green-700',
		'from-purple-500 to-purple-700',
		'from-pink-500 to-pink-700',
		'from-orange-500 to-orange-700',
		'from-teal-500 to-teal-700',
		'from-red-500 to-red-700',
		'from-indigo-500 to-indigo-700',
		'from-emerald-500 to-emerald-700',
		'from-fuchsia-500 to-fuchsia-700',
		'from-cyan-500 to-cyan-700',
		'from-lime-500 to-lime-700',
		'from-amber-500 to-amber-700',
		'from-sky-500 to-sky-700',
	];

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Navbar />
			<Toaster position="top-center" />
			<main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				<div className="mb-6 sm:mb-8">
					<div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
						<button
							onClick={handleBack}
							className="text-dark hover:text-gray-300 transition-colors"
						>
							<ArrowLeft
								className="w-5 h-5 sm:w-6 sm:h-6"
								weight="bold"
							/>
						</button>
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/10 flex items-center justify-center">
								<Books
									className="w-5 h-5 sm:w-6 sm:h-6 text-dark"
									weight="bold"
								/>
							</div>
							<div>
								<h1 className="text-2xl sm:text-3xl font-bold text-dark">
									{classData.name}
								</h1>
								<p className="text-sm text-gray-800 mt-1">
									{classData.teacher_name}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div>
					<h2 className="text-lg sm:text-xl font-semibold text-dark mb-4">
						Daftar Semua Peserta ({participants.length})
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{participants.map((participant, idx) => {
							const gradient = GRADIENTS[idx % GRADIENTS.length];
							return (
								<div
									key={participant.id}
									className={`rounded-2xl shadow-lg border border-black bg-gradient-to-br ${gradient} px-3 py-2 flex items-center gap-4 transition-all hover:scale-[1.02]`}
								>
									<div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center border border-black shadow bg-white">
										{participant.profile_picture ? (
											<>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={participant.profile_picture}
													alt="Foto Profil"
													className="w-full h-full object-cover"
													width={56}
													height={56}
													onError={(e) => {
														const target = e.target as HTMLImageElement;
														target.style.display = 'none';
														const parent = target.parentElement;
														if (parent && !parent.querySelector('.fallback-icon')) {
															const iconWrapper = document.createElement('div');
															iconWrapper.className = 'fallback-icon flex items-center justify-center w-full h-full';
															iconWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256" class="text-gray-600"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path></svg>`;
															parent.appendChild(iconWrapper);
														}
													}}
												/>
											</>
										) : (
											<User
												className="w-7 h-7 text-gray-600"
												weight="bold"
											/>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-base font-semibold text-white truncate drop-shadow">
											{participant.fullname}
										</p>
										<p className="text-xs text-white/80 truncate">
											{participant.email}
										</p>
									</div>
									{isTeacher &&
										participant.user_id !== classData.teacher_id && (
											<button
												onClick={() =>
													handleRemoveParticipant(
														participant.user_id,
														participant.fullname
													)
												}
												className="text-red-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-red-400/20"
												title="Hapus peserta"
											>
												<Trash
													className="w-5 h-5"
													weight="bold"
												/>
											</button>
										)}
								</div>
							);
						})}
					</div>
					{participants.length === 0 && (
						<div className="text-center py-12 sm:py-20">
							<div className="max-w-md mx-auto">
								<div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
									<Books
										className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
										weight="bold"
									/>
								</div>
								<h3 className="text-lg sm:text-xl font-semibold text-dark mb-2">
									Belum Ada Peserta
								</h3>
								<p className="text-sm sm:text-base text-gray-400">
									Undang peserta untuk bergabung ke kelas ini
								</p>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
