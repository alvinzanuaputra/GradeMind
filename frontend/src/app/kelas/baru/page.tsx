"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, Books } from "phosphor-react";
import { classService } from "@/services";

export default function NewClassPage() {
	return (
		<ProtectedRoute>
			<NewClassContent />
		</ProtectedRoute>
	);
}

function NewClassContent() {
	const router = useRouter();
	const { user } = useAuth();
	const [className, setClassName] = useState("");
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (user && user.user_role !== "dosen") {
			toast.error("Hanya dosen yang dapat membuat kelas");
			router.push("/dashboard");
		}
	}, [user, router]);

	const handleBack = () => {
		router.push("/dashboard");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!className.trim()) {
			toast.error("Nama kelas harus diisi");
			return;
		}

		setIsSubmitting(true);

		try {
			await classService.createClass({
				name: className,
				description: description,
			});

			toast.success("Kelas berhasil dibuat!");
			router.push("/dashboard");
		} catch (error) {
			toast.error("Gagal membuat kelas. Silakan coba lagi.");
			console.error("Error creating class:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (user && user.user_role !== "dosen") {
		return (
			<div className="min-h-screen flex flex-col bg-white">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-black mb-2">
							Akses Ditolak
						</h2>
						<p className="text-gray-400 mb-4">
							Hanya dosen yang dapat membuat kelas
						</p>
						<Button onClick={() => router.push("/dashboard")}>
							Kembali ke Dashboard
						</Button>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Navbar />

			<main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex items-center gap-3 sm:gap-4 mb-6">
						<button
							onClick={handleBack}
							className="text-black hover:text-gray-300 transition-colors"
						>
							<ArrowLeft
								className="w-5 h-5 sm:w-6 sm:h-6"
								weight="bold"
							/>
						</button>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/10 flex items-center justify-center">
								<Books
									className="w-5 h-5 sm:w-6 sm:h-6 text-black"
									weight="bold"
								/>
							</div>
							<h1 className="text-2xl sm:text-3xl font-bold text-black">
								Buat Kelas Baru
							</h1>
						</div>
					</div>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Nama Kelas Section */}
					<div>
						<h2 className="text-lg sm:text-xl font-semibold text-black mb-4">
							Nama Kelas
						</h2>
						<input
							type="text"
							value={className}
							onChange={(e) => setClassName(e.target.value)}
							placeholder="Masukkan nama kelas"
							className="bg-white w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-black placeholder-black focus:outline-none focus:border-yellow-500 transition-colors"
							disabled={isSubmitting}
						/>
					</div>
					<div>
						<h2 className="text-lg sm:text-xl font-semibold text-black mb-4">
							Deskripsi
						</h2>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Masukkan deskripsi kelas"
							rows={6}
							className="bg-white w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-black placeholder-black focus:outline-none focus:border-yellow-500 transition-colors resize-none"
							disabled={isSubmitting}
						/>
						<p className="text-sm text-yellow-600 underline mt-2">
							Deskripsi ini akan membantu mahasiswa memahami
							tentang kelas Anda
						</p>
					</div>
					<div className="flex justify-center pt-4">
						<Button
							type="submit"
							variant="primary"
							size="lg"
							className="min-w-[200px]"
							disabled={isSubmitting || !className.trim()}
						>
							{isSubmitting ? "Membuat..." : "Buat Kelas"}
						</Button>
					</div>
				</form>
			</main>
		</div>
	);
}
