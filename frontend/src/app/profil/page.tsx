"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { userService, profileService } from "@/services";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Image from "next/image";
import { Camera, UserCircle } from "phosphor-react";
import toast, { Toaster } from "react-hot-toast";

export default function ProfilePage() {
	return (
		<ProtectedRoute>
			<ProfileContent />
		</ProtectedRoute>
	);
}
function ProfileContent() {
	const router = useRouter();
	const { user, updateUser } = useAuth();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [profilePicture, setProfilePicture] = useState("");
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		username: "",
		bio: "",
		phone: "",
		institution: "",
		nrp: "",
	});

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [showPasswordSection, setShowPasswordSection] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);

	useEffect(() => {
		if (user) {
			setFormData({
				fullName: user.fullname || "",
				email: user.email || "",
				username: user.username || "",
				bio: user.biografi || "",
				phone: user.notelp || "",
				institution: user.institution || "",
				nrp: user.nrp || "",
			});
			setProfilePicture(user.profile_picture || "");
		}
	}, [user]);

	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast.error("File harus berupa gambar!");
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Ukuran gambar maksimal 5MB!");
				return;
			}

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePicture(reader.result as string);
				toast.success(
					"Foto profil berhasil dipilih! Klik Simpan untuk mengupdate."
				);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setPasswordData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		if (!formData.fullName.trim()) {
			toast.error("Nama lengkap wajib diisi");
			return;
		}

		if (!formData.email.trim()) {
			toast.error("Email wajib diisi");
			return;
		}

		setIsLoading(true);

		try {
			// Prepare update data
			const updateData = {
				fullname: formData.fullName,
				email: formData.email,
				username: formData.username,
				biografi: formData.bio,
				notelp: formData.phone,
				institution: formData.institution,
				nrp: formData.nrp,
				profile_picture: profilePicture,
			};

			// Call API to update profile
			const updatedUser = await userService.updateProfile(updateData);

			// Update user in context
			updateUser(updatedUser);
			toast.success("Profil berhasil diperbarui!");
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Gagal memperbarui profil";

			if (
				errorMessage.includes("token") ||
				errorMessage.includes("401") ||
				errorMessage.includes("unauthorized")
			) {
				toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			} else {
				toast.error(errorMessage);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		if (!passwordData.currentPassword) {
			toast.error("Kata sandi saat ini wajib diisi");
			return;
		}

		if (!passwordData.newPassword) {
			toast.error("Kata sandi baru wajib diisi");
			return;
		}

		if (passwordData.newPassword.length < 8) {
			toast.error("Kata sandi minimal 8 karakter");
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			toast.error("Kata sandi tidak cocok");
			return;
		}

		setIsLoading(true);

		try {
			// Call API to change password
			await profileService.changePassword({
				current_password: passwordData.currentPassword,
				new_password: passwordData.newPassword,
			});

			toast.success("Kata sandi berhasil diubah!");

			// Clear password fields
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			setShowPasswordSection(false);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Gagal mengubah kata sandi. Silahkan coba lagi !";

			toast.error(errorMessage);

			if (
				errorMessage.includes("salah") ||
				errorMessage.includes("incorrect")
			) {
				// Current password is incorrect
			} else if (errorMessage.includes("OAuth")) {
				setShowPasswordSection(false);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		router.push("/dashboard");
	};

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Navbar />
			<Toaster position="top-center" />
			<main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-black mb-2">
						Edit profil
					</h1>
					<p className="text-gray-600">
						Ganti informasi pribadi kamu dan pengaturan
					</p>
				</div>
				<div className="mb-6 border-t border-gray-300 pt-4">
					<h2 className="text-xl font-semibold text-black mb-2">
						Foto Profil
					</h2>

				</div>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<div className="flex items-center gap-4">
							<div
								className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 shadow-lg bg-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
								onClick={() => profilePicture && setShowImageModal(true)}
								title="Klik untuk melihat foto profil"
							>
								{profilePicture ? (
									<Image
										src={profilePicture}
										alt="profil default icon"
										width={80}
										height={80}
										className="w-full h-full object-cover"
										unoptimized
										onError={(e) => {
											// Fallback to default icon if image fails to load
											const target = e.target as HTMLImageElement;
											target.style.display = "none";
											if (target.nextElementSibling) {
												(target.nextElementSibling as HTMLElement).style.display = "flex";
											}
										}}
									/>
								) : null}
								<div
									className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold"
									style={{
										display: profilePicture
											? "none"
											: "flex",
									}}
								>
									<UserCircle
										className="w-16 h-16"
										weight="bold"
									/>
							</div>
						</div>
						<div className="flex flex-col-reverse">
							<>
								<button
									type="button"
									onClick={handleImageClick}
									className="px-4 py-2 bg-transparent border-2 border-yellow-500 rounded-lg text-black hover:bg-yellow-400 transition-colors text-sm font-medium flex items-center gap-2 mt-2"
								>
									<Camera
										className="w-4 h-4"
										weight="bold"
									/>
									Ganti gambar
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleImageChange}
									className="hidden"
								/>
								<p className="text-xs text-gray-800 mt-2">
									JPG, atau PNG. Max size 5MB
								</p>
							</>
						</div>
					</div>
				</div>					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Input
							id="fullName"
							name="fullName"
							type="text"
							label="Nama Lengkap"
							placeholder="Masukkan nama lengkap"
							value={formData.fullName}
							onChange={handleChange}
							error={errors.fullName}
							required
						/>
						<Input
							id="username"
							name="username"
							type="text"
							label="Nama Pengguna"
							placeholder="Masukkan nama pengguna"
							value={formData.username}
							onChange={handleChange}
							error={errors.username}
							disabled
						/>
					</div>
					<Input
						id="email"
						name="email"
						type="email"
						label="Alamat Email"
						placeholder="Masukkan email"
						value={formData.email}
						onChange={handleChange}
						error={errors.email}
						required
					/>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Input
							id="phone"
							name="phone"
							type="tel"
							label="Nomor Telepon"
							placeholder="Masukkan nomor telepon"
							value={formData.phone}
							onChange={handleChange}
							error={errors.phone}
						/>
						<Input
							id="institution"
							name="institution"
							type="text"
							label="Institusi"
							placeholder="Masukkan institusi"
							value={formData.institution}
							onChange={handleChange}
							error={errors.institution}
						/>
					</div>
					{/* NRP field - only show for mahasiswa role */}
					{user?.user_role === "mahasiswa" && (
						<Input
							id="nrp"
							name="nrp"
							type="text"
							label="NRP (Nomor Registrasi Pokok)"
							placeholder="Contoh: 5025201234"
							value={formData.nrp}
							onChange={handleChange}
							error={errors.nrp}
							helperText="NRP adalah nomor identitas mahasiswa ITS (opsional)"
						/>
					)}
					<div>
						<label
							htmlFor="bio"
							className="block text-sm font-medium text-white mb-2"
						>
							Bio
						</label>
						<textarea
							id="bio"
							name="bio"
							rows={4}
							placeholder="Ceritakan tentang diri kamu..."
							value={formData.bio}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-transparent border border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors resize-none"
						/>
						{errors.bio && (
							<p className="mt-2 text-sm text-red-400">
								{errors.bio}
							</p>
						)}
					</div>
					<div className="flex flex-col sm:flex-row gap-4 pt-4">
						<Button
							type="submit"
							variant="primary"
							size="lg"
							isLoading={isLoading}
							disabled={isLoading}
						>
							Simpan Perubahan
						</Button>
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={handleCancel}
							disabled={isLoading}
						>
							Batal
						</Button>
					</div>
				</form>


				{/* Password Section */}
				<div className="mt-6 border-t border-gray-300 pt-4">
						<div className="mb-6">
							<h2 className="text-xl font-semibold text-black mb-2">
								Ubah Kata Sandi
							</h2>
							<p className="text-sm text-gray-600">
								Perbarui kata sandi untuk menjaga keamanan akun
								kamu
							</p>
						</div>
						{!showPasswordSection ? (
							<Button
								type="button"
								variant="outline"
								size="md"
								onClick={() => setShowPasswordSection(true)}
							>
								Ubah Kata Sandi
							</Button>
						) : (
							<form
								onSubmit={handlePasswordSubmit}
								className="space-y-6"
							>
								<Input
									id="currentPassword"
									name="currentPassword"
									type="password"
									label="Kata Sandi Saat Ini"
									placeholder="Masukkan kata sandi saat ini"
									value={passwordData.currentPassword}
									onChange={handlePasswordChange}
									error={errors.currentPassword}
									required
								/>
								<Input
									id="newPassword"
									name="newPassword"
									type="password"
									label="Kata Sandi Baru"
									placeholder="Masukkan kata sandi baru"
									value={passwordData.newPassword}
									onChange={handlePasswordChange}
									error={errors.newPassword}
									helperText="Kata sandi minimal 8 karakter"
									required
								/>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									label="Konfirmasi Kata Sandi Baru"
									placeholder="Konfirmasi kata sandi baru"
									value={passwordData.confirmPassword}
									onChange={handlePasswordChange}
									error={errors.confirmPassword}
									required
								/>
								<div className="flex flex-col sm:flex-row gap-4 pt-4">
									<Button
										type="submit"
										variant="primary"
										size="lg"
										isLoading={isLoading}
										disabled={isLoading}
									>
										Ganti kata sandi
									</Button>
									<Button
										type="button"
										variant="outline"
										size="lg"
										onClick={() => {
											setShowPasswordSection(false);
											setPasswordData({
												currentPassword: "",
												newPassword: "",
												confirmPassword: "",
											});
											setErrors({});
										}}
										disabled={isLoading}
									>
										Batalkan
									</Button>
								</div>
							</form>
						)}
					</div>
				

				{/* Image Viewer Modal */}
				{showImageModal && (
					<div
						className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
						onClick={() => setShowImageModal(false)}
					>
						<div
							className="relative max-w-3xl max-h-[90vh] w-full"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								onClick={() => setShowImageModal(false)}
								className="bg-white absolute -top-8 right-3 text-black hover:text-yellow-500 transition-colors text-sm font-medium px-2 py-1 rounded-lg"
							>
								Tutup ✕
							</button>
							<div className="relative w-full h-full flex items-center justify-center">
								{profilePicture ? (
									<>
										<Image
											src={profilePicture}
											alt="Foto Profil"
											width={800}
											height={800}
											className="max-w-full max-h-[90vh] object-contain rounded-lg"
											unoptimized
											onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
												// Fallback to default icon if image fails to load in modal
												const target = e.target as HTMLImageElement;
												target.style.display = "none";
												if (target.nextElementSibling) {
													(target.nextElementSibling as HTMLElement).style.display = "flex";
												}
											}}
										/>
										<div
											className="absolute inset-0 w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-6xl font-bold"
											style={{ display: "none" }}
										>
											<UserCircle className="w-32 h-32" weight="bold" />
											<span className="absolute bottom-20 left-0 right-0 text-center text-white text-lg font-semibold">Belum ada foto profil</span>
										</div>
									</>
								) : (
									<div className="w-full h-full flex flex-col items-center justify-center">
										<UserCircle className="w-32 h-32 text-yellow-500 mb-4" weight="bold" />
										<span className="text-white text-lg font-semibold">Belum ada foto profil</span>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}