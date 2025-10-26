"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { authService, classService } from "@/services";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  MagnifyingGlass,
  Plus,
  DotsThreeVertical,
  Users,
  Calendar,
  Books,
  X,
  Pencil,
  Trash,
} from "phosphor-react";


const CLASS_THEMES = [
  { image: "/images/dashboard/1.png", color: "from-blue-600 to-blue-800" },
  { image: "/images/dashboard/2.png", color: "from-yellow-600 to-yellow-800" },
  { image: "/images/dashboard/3.png", color: "from-red-600 to-red-800" },
  { image: "/images/dashboard/4.png", color: "from-green-700 to-green-900" },
  { image: "/images/dashboard/5.png", color: "from-gray-700 to-gray-900" },
  { image: "/images/dashboard/6.png", color: "from-orange-600 to-orange-800" },
  { image: "/images/dashboard/7.png", color: "from-purple-600 to-purple-800" },
  { image: "/images/dashboard/8.png", color: "from-green-600 to-green-800" },
  { image: "/images/dashboard/9.png", color: "from-brown-700 to-brown-900" },
  { image: "/images/dashboard/10.png", color: "from-teal-600 to-teal-800" },
  { image: "/images/dashboard/11.png", color: "from-red-700 to-red-900" },
  { image: "/images/dashboard/12.png", color: "from-teal-700 to-teal-900" },
  { image: "/images/dashboard/13.png", color: "from-brown-600 to-brown-800" },
  { image: "/images/dashboard/14.png", color: "from-yellow-600 to-yellow-800" },
  { image: "/images/dashboard/15.png", color: "from-blue-700 to-blue-900" },
];

function DashboardWithOAuth() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  useEffect(() => {
    const token = searchParams.get("token");

    if (token && !isAuthenticated && !isProcessingOAuth) {
      setIsProcessingOAuth(true);

      const handleOAuthLogin = async () => {
        try {
          localStorage.setItem("token", token);
          const userData = await authService.getCurrentUser();

          if (userData) {
            login(userData, token, true);
            toast.success(`Selamat datang, ${userData.fullname}!`, {
              duration: 2000,
            });

            setTimeout(() => {
              window.location.href = "/images/dashboard";
            }, 2000);
          }
        } catch {
          toast.error("Gagal login dengan OAuth");
          setIsProcessingOAuth(false);
          router.push("/masuk");
        }
      };

      handleOAuthLogin();
    }
  }, [searchParams, login, router, isAuthenticated, isProcessingOAuth]);

  if (isProcessingOAuth) {
    return <LoadingSpinner fullScreen text="Memproses login..." />;
  }

  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

export default function dashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen text="Memuat..." />}>
      <DashboardWithOAuth />
    </Suspense>
  );
}

function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [joinClassError, setJoinClassError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: classes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const result = await classService.getAllClasses();
      return result;
    },
    enabled: isAuthenticated,
    retry: 1,
  });

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      setJoinClassError("Kode kelas tidak boleh kosong");
      return;
    }

    setIsJoining(true);
    try {
      const response = await classService.joinClass({
        class_code: classCode.trim(),
      });
      toast.success(response.message || "Berhasil bergabung dengan kelas!");
      setIsJoinModalOpen(false);
      setClassCode("");
      setJoinClassError(null);
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setJoinClassError(
        error?.response?.data?.detail || error?.message || "Gagal bergabung dengan kelas"
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteClass = async (classId: number, className: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus kelas "${className}"? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    setIsDeletingId(classId);
    setOpenDropdownId(null);

    try {
      await classService.deleteClass(classId);
      toast.success("Kelas berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || error?.message || "Gagal menghapus kelas");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleEditClass = (classId: number) => {
    setOpenDropdownId(null);
    router.push(`/kelas/${classId}/edit`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdownId !== null) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdownId]);

  useEffect(() => {
    if (error) {
      toast.error("Gagal memuat kelas");
    }
  }, [error]);

  const filteredClasses =
    classes?.filter(
      (cls) =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const getClassTheme = (index: number) => {
    return CLASS_THEMES[index % CLASS_THEMES.length];
  };
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Memuat kelas..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Kelas Saya
            </h1>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white rounded-3xl border-2 border-gray-300 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
            />
            <MagnifyingGlass
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              weight="bold"
            />
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <p>
            Anda sekarang masuk sebagai{' '}
            <span className="font-semibold text-yellow-500">
              {user?.user_role === 'dosen' ? 'dosen' : user?.user_role === 'mahasiswa' ? 'mahasiswa' : 'Gagal memuat role'}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {user?.user_role === "dosen" && (
            <Link href="/kelas/baru">
              <div className="relative h-48 sm:h-52 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] bg-slate-200 border-2 border-dashed border-gray-700 hover:border-yellow-600 flex items-center justify-center group">
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full bg-gray-500 group-hover:bg-gray-400 flex items-center justify-center transition-colors">
                    <Plus
                      className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 group-hover:text-yellow-400"
                      weight="bold"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-black font-medium">
                    Buat Kelas Baru
                  </p>
                </div>
              </div>
            </Link>
          )}

          {user?.user_role === "mahasiswa" && (
            <div
              onClick={() => setIsJoinModalOpen(true)}
              className="relative h-48 sm:h-52 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] bg-slate-200 border-2 border-dashed border-gray-700 hover:border-yellow-600 flex items-center justify-center group"
            >
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full bg-gray-500 group-hover:bg-gray-400 flex items-center justify-center transition-colors">
                  <Plus
                    className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 group-hover:text-yellow-400"
                    weight="bold"
                  />
                </div>
                <p className="text-sm sm:text-base text-black font-medium">
                  Gabung Kelas
                </p>
              </div>
            </div>
          )}

          {filteredClasses.map((cls, index) => {
            const isTeacher =
              user?.user_role === "dosen" && cls.teacher_id === user.id;
            const theme = getClassTheme(index);

            return (
              <div key={cls.id} className="relative">
                <Link href={`/kelas/${cls.id}`}>
                  <div
                    className={`relative h-48 sm:h-52 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] shadow-lg cursor-pointer bg-gradient-to-br ${theme.color}`}
                  >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                      <Image
                        priority
                        src={theme.image}
                        alt={cls.name}
                        fill
                        className="object-cover opacity-60"
                        sizes="(max-width: 500px) 70vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    <div className="relative z-10 p-4 sm:p-5 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-auto">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Books
                            className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                            weight="fill"
                          />
                        </div>
                        {isTeacher && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenDropdownId(
                                  openDropdownId === cls.id ? null : cls.id
                                );
                              }}
                              className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors backdrop-blur-sm"
                            >
                              <DotsThreeVertical
                                className="w-5 h-5"
                                weight="bold"
                              />
                            </button>
                            {openDropdownId === cls.id && (
                              <div
                                className="absolute right-0 mt-2 w-48 bg-[#1e1f22] rounded-lg shadow-lg border border-gray-700 z-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditClass(cls.id);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors rounded-t-lg"
                                >
                                  <Pencil className="w-4 h-4" weight="bold" />
                                  <span>Edit Kelas</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteClass(cls.id, cls.name);
                                  }}
                                  disabled={isDeletingId === cls.id}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition-colors rounded-b-lg disabled:opacity-50"
                                >
                                  <Trash className="w-4 h-4" weight="bold" />
                                  <span>
                                    {isDeletingId === cls.id
                                      ? "Menghapus..."
                                      : "Hapus Kelas"}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-auto">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 line-clamp-2">
                          {cls.name}
                        </h3>
                        <p className="text-sm text-white/90 mb-2 line-clamp-1">
                          {cls.teacher_name}
                        </p>
                        <div className="flex items-center gap-3 text-white/80 text-xs sm:text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" weight="bold" />
                            <span>
                              {new Date(cls.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/60" />
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" weight="bold" />
                            <span>{cls.participant_count} Peserta</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        {filteredClasses.length === 0 && !isLoading && (
          <div className="text-center py-12 sm:py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gray-200 flex items-center justify-center">
                <Books
                  className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                  weight="bold"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Kelas
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
                {searchQuery
                  ? "Tidak ada kelas yang cocok dengan pencarian"
                  : user?.user_role === "dosen"
                  ? "Buat kelas baru atau bergabung dengan kelas yang ada"
                  : "Bergabung dengan kelas yang ada"}
              </p>
            </div>
          </div>
        )}
      </main>
      {/* Join Class Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => {
                setIsJoinModalOpen(false);
                setClassCode("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" weight="bold" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gabung Kelas
            </h2>
            <p className="text-gray-600 mb-6">
              Masukkan kode kelas untuk bergabung
            </p>

            <div className="mb-6">
              <label
                htmlFor="classCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kode Kelas
              </label>
              <input
                id="classCode"
                type="text"
                value={classCode}
                onChange={(e) => {
                  setClassCode(e.target.value);
                  setJoinClassError(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isJoining) {
                    handleJoinClass();
                  }
                }}
                placeholder="Masukkan kode kelas"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                disabled={isJoining}
              />
              {joinClassError && (
                <div className="mt-2 text-sm text-red-600 rounded border border-red-500 px-2 py-1 bg-red-500/20">{joinClassError}</div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsJoinModalOpen(false);
                  setClassCode("");
                  setJoinClassError(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                disabled={isJoining}
              >
                Batal
              </button>
              <button
                onClick={handleJoinClass}
                disabled={isJoining || !classCode.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? "Bergabung..." : "Gabung"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}