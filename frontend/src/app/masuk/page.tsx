"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services";
import AuthLayout from "@/components/AuthLayout";
import GuestRoute from "@/components/GuestRoute";
import Button from "@/components/Button";
import PasswordInput from "@/components/PasswordInput";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
	return (
		<GuestRoute>
			<LoginContent />
		</GuestRoute>
	);
}

function LoginContent() {
	const searchParams = useSearchParams();
	const { login } = useAuth();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [errors, setErrors] = useState<{ email?: string; password?: string }>(
		{}
	);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const token = searchParams.get("token");
		if (token) {
			toast.success("Login berhasil!");
			localStorage.setItem("token", token);
			setTimeout(() => {
				window.location.href = "/dashboard";
			}, 1000);
		}
	}, [searchParams]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		if (errors[name as keyof typeof errors]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	const validateForm = () => {
		const newErrors: { email?: string; password?: string } = {};

		if (!formData.email) {
			newErrors.email = "Nama Pengguna/Email wajib diisi";
		}

		if (!formData.password) {
			newErrors.password = "Password wajib diisi";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password minimal 8 karakter";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			const response = await authService.login({
				email: formData.email,
				password: formData.password,
			});

			login(response.user, response.access_token, formData.rememberMe);

			toast.success("Login berhasil!", {
				duration: 1000,
				style: {
					background: "#10B981",
					color: "#fff",
				},
			});

			setTimeout(() => {
				window.location.href = "/dashboard";
			}, 1500);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Login gagal";
			toast.error(errorMessage, {
				duration: 3000,
				style: {
					background: "#EF4444",
					color: "#fff",
				},
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout>
			<Toaster position="top-center" />
			<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
				<div>
					<label
						htmlFor="email"
						className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
					>
						Nama Pengguna/Email
					</label>
					<input
						id="email"
						name="email"
						type="text"
						placeholder="Tulis nama pengguna atau email Anda"
						value={formData.email}
						onChange={handleChange}
						className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-full text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 hover:border-gray-400 transition-all"
						required
					/>
					{errors.email && (
						<p className="mt-2 text-xs sm:text-sm text-red-600">
							{errors.email}
						</p>
					)}
				</div>

				<PasswordInput
					id="password"
					name="password"
					label="Kata Sandi"
					value={formData.password}
					placeholder="Masukkkan Kata Sandi Anda"
					onChange={handleChange}
					error={errors.password}
				/>

				<Button
					type="submit"
					variant="primary"
					size="lg"
					fullWidth
					isLoading={isLoading}
				>
					Login
				</Button>

				<div className="text-center">
					<span className="text-xs sm:text-sm text-gray-600">
						Belum punya akun?{" "}
					</span>
					<Link
						href="/daftar"
						className="text-xs sm:text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
					>
						Daftar di sini
					</Link>
				</div>
			</form>
		</AuthLayout>
	);
}