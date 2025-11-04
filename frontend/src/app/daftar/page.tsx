"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services";
import { checkPasswordStrength } from "@/lib/validation";
import AuthLayout from "@/components/AuthLayout";
import Button from "@/components/Button";
import PasswordInput from "@/components/PasswordInput";
import toast, { Toaster } from "react-hot-toast";
import GuestRoute from "@/components/GuestRoute";

export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterContent />
    </GuestRoute>
  );
}

function RegisterContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    notelp: "",
    institution: "",
    biografi: "",
    nrp: "",
    user_role: "mahasiswa",
    acceptTerms: false,
  });

  type UserRole = "mahasiswa" | "dosen";
  const [errors, setErrors] = useState<{
    fullname?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    user_role?: string;
    acceptTerms?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = formData.password
    ? checkPasswordStrength(formData.password)
    : null;
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: name === "user_role" ? (value as UserRole) : newValue,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Nama lengkap wajib diisi";
    }
    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username hanya boleh berisi huruf, angka, dan underscore";
    }
    if (!formData.user_role) {
      newErrors.user_role = "Role wajib dipilih";
    }
    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Anda harus menyetujui syarat dan ketentuan";
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
      await authService.register({
        fullname: formData.fullname,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        notelp: formData.notelp || undefined,
        institution: formData.institution || undefined,
        biografi: formData.biografi || undefined,
        nrp: formData.nrp || undefined,
        user_role: formData.user_role as UserRole,
      });

      toast.success("Registrasi berhasil!", {
        duration: 3000,
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });

      // Redirect to login page
      setTimeout(() => {
        router.push("/masuk");
      }, 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Registrasi gagal";
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
      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5p-6 sm:p-8 rounded-2xl"
      >
        <div>
          <label
            htmlFor="user_role"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
          >
            Daftar Sebagai
          </label>
          <select
            id="user_role"
            name="user_role"
            value={formData.user_role}
            onChange={handleChange}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-full text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 hover:border-gray-400 transition-all"
            required
          >
            <option value="mahasiswa" className="bg-white text-gray-900">Mahasiswa</option>
            <option value="dosen" className="bg-white text-gray-900">Dosen</option>
          </select>
          {errors.user_role && (
            <p className="mt-2 text-xs sm:text-sm text-red-600">
              {errors.user_role}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="fullname"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
          >
            Nama Lengkap
          </label>
          <input
            id="fullname"
            name="fullname"
            type="text"
            placeholder="Nama lengkap Anda"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-full text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 hover:border-gray-400 transition-all"
            required
          />
          {errors.fullname && (
            <p className="mt-2 text-xs sm:text-sm text-red-600">
              {errors.fullname}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Tulis alamat email Anda"
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

        <div>
          <label
            htmlFor="username"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
          >
            Nama Pengguna
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Tulis nama pengguna Anda"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-full text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 hover:border-gray-400 transition-all"
            required
          />
          {errors.username && (
            <p className="mt-2 text-xs sm:text-sm text-red-600">
              {errors.username}
            </p>
          )}
        </div>

        {formData.user_role === "mahasiswa" && (
          <div>
            <label
              htmlFor="nrp"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
            >
              NRP (Opsional)
            </label>
            <input
              id="nrp"
              name="nrp"
              type="text"
              placeholder="Contoh: 5025201234"
              value={formData.nrp}
              onChange={handleChange}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-full text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 hover:border-gray-400 transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">
              NRP adalah nomor identitas mahasiswa ITS
            </p>
          </div>
        )}

        <PasswordInput
          id="password"
          name="password"
          label="Kata Sandi"
          value={formData.password}
          placeholder="minimal 8 karakter"
          onChange={handleChange}
          error={errors.password}
          showStrength={true}
          strength={passwordStrength}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Konfirmasi Kata Sandi"
          value={formData.confirmPassword}
          placeholder="konfirmasi kata sandi"
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <div className="flex items-start">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="mt-1 mr-2 accent-yellow-500 w-4 h-4"
          />
          <label
            htmlFor="acceptTerms"
            className="text-xs sm:text-sm text-gray-600"
          >
            Saya menyetujui{" "}
            <Link
              href="#"
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              syarat dan ketentuan
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs sm:text-sm text-red-600">
            {errors.acceptTerms}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Daftar
        </Button>

        <div className="text-center">
          <span className="text-xs sm:text-sm text-gray-600">
            Sudah punya akun?{" "}
          </span>
          <Link
            href="/masuk"
            className="text-xs sm:text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
          >
            Login di sini
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}