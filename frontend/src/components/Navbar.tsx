"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
	SignOut,
	UserCircle,
	List,
	X,
	PencilSimple,
} from "phosphor-react";

const NavLink: React.FC<{
	href: string;
	isActive: boolean;
	onClick?: () => void;
	children: React.ReactNode;
}> = ({ href, isActive, onClick, children }) => (
	<Link
		href={href}
		className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "text-yellow-500" : "text-gray-600 hover:text-gray-900"
			}`}
		onClick={onClick}
	>
		{children}
	</Link>
);

const Navbar: React.FC = () => {
	const pathname = usePathname();
	const { isAuthenticated, logout, user } = useAuth();

	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const [showMobileMenu, setShowMobileMenu] = useState(false);

	const profileMenuRef = useRef<HTMLDivElement>(null);
	const mobileMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				profileMenuRef.current &&
				!profileMenuRef.current.contains(event.target as Node)
			) {
				setShowProfileMenu(false);
			}
			if (
				mobileMenuRef.current &&
				!mobileMenuRef.current.contains(event.target as Node)
			) {
				setShowMobileMenu(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		logout();
		window.location.href = "/";
	};

	const isActive = (path: string) => pathname === path;
	const homeUrl = isAuthenticated ? "/dashboard" : "/";

	return (
		<nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<Link href="/" className="flex items-center space-x-2">
						<div className="text-xl sm:text-2xl font-bold">
							<span className="text-yellow-500">GRADE</span>
							<span className="text-gray-900"> MIND</span>
						</div>
					</Link>
					<div className="hidden md:flex items-center space-x-4">
						<NavLink href={homeUrl} isActive={isActive(homeUrl)}>
							Beranda
						</NavLink>
						<NavLink href="/tentang" isActive={isActive("/tentang")}>
							Tentang
						</NavLink>
						<div className="relative" ref={profileMenuRef}>
							<button
								onClick={() =>
									setShowProfileMenu(!showProfileMenu)
								}
								className="w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-gray-600 hover:border-yellow-400 overflow-hidden bg-yellow-400 shadow-lg"
								aria-label="Profile"
							>
								{isAuthenticated && user?.profile_picture ? (
									<Image
										src={user.profile_picture}
										alt="profil default icon"
										width={40}
										height={40}
										className="w-full h-full object-cover"
										unoptimized
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.onerror = null;
											target.src = '';
											target.style.display = 'none';
											const parent = target.parentElement;
											if (parent && !parent.querySelector('.fallback-profile-icon')) {
												const icon = document.createElement('div');
												icon.className = 'fallback-profile-icon';
												icon.innerHTML = '<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>';
												parent.appendChild(icon.firstChild as Node);
											}
										}}
									/>
								) : (
									<UserCircle
										className="w-6 h-6 text-white"
										weight="bold"
									/>
								)}
							</button>
							{showProfileMenu && (
								<div className="absolute right-0 mt-2 w-86 bg-white rounded-md shadow-lg border border-gray-700 py-2 z-50">
									{isAuthenticated ? (
										<>
											<div className="px-4 py-3 border-b border-gray-700">
												<div className="flex items-center space-x-3">
													<div className="w-18 h-18 rounded-full overflow-hidden border-2 border-yellow-400 shadow-lg flex-shrink-0 bg-gradient-to-br from-yellow-400 to-yellow-600">
														{user?.profile_picture ? (
															<Image
																src={user.profile_picture}
																alt="profil default icon"
																width={48}
																height={48}
																className="w-full h-full object-cover"
																unoptimized
																onError={(e) => {
																	const target = e.target as HTMLImageElement;
																	target.onerror = null;
																	target.src = '';
																	target.style.display = 'none';
																	const parent = target.parentElement;
																	if (parent && !parent.querySelector('.fallback-profile-icon')) {
																		const icon = document.createElement('div');
																		icon.className = 'fallback-profile-icon';
																		icon.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>';
																		parent.appendChild(icon.firstChild as Node);
																	}
																}}
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center">
																<UserCircle
																	className="w-8 h-8 text-white"
																	weight="bold"
																/>
															</div>
														)}
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-lg font-semibold text-black truncate">
															{user?.fullname ||
																user?.username ||
																"Username"}
														</p>
														<p className="text-sm text-gray-800 truncate">
															{user?.email ||
																"user@gmail.com"}
														</p>
														<p className="text-xs text-dark mt-1 font-semibold">
															anda masuk sebagai {" "}<span className="font-semibold text-yellow-500">
																{user?.user_role === 'dosen' ? 'dosen' : user?.user_role === 'mahasiswa' ? 'mahasiswa' : 'Error'}
															</span>
														</p>
													</div>
												</div>
											</div>
											<div className="px-2 py-2">
												<Link
													href="/profil"
													className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-yellow-400 rounded-md transition-colors"
													onClick={() =>
														setShowProfileMenu(
															false
														)
													}
												>
													<div className="flex items-center gap-2">
														<PencilSimple
															className="w-4 h-4"
															weight="bold"
														/>
														Lihat Profil
													</div>
												</Link>
												<button
													onClick={() => {
														handleLogout();
														setShowProfileMenu(
															false
														);
													}}
													className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500 rounded-md transition-colors hover:text-black cursor-pointer"
												>
													<div className="flex items-center gap-2">
														<SignOut
															className="w-4 h-4"
															weight="bold"
														/>
														Keluar
													</div>
												</button>
											</div>
										</>
									) : (
										<>
											<div className="px-4 py-3 border-b border-gray-700">
												<p className="text-sm text-black text-left">
													Belum masuk
												</p>
												<p className="text-xs text-gray-900 text-left mt-1">
													Silakan masuk untuk
													mengakses essai grading otomatis sebagai
													mahasiswa atau dosen.
												</p>
											</div>
											<div className="px-4 py-2">
												<Link
													href="/masuk"
													className="block w-full text-center px-4 py-2 text-sm text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-md transition-colors font-medium"
													onClick={() =>
														setShowProfileMenu(
															false
														)
													}
												>
													Masuk
												</Link>
											</div>
										</>
									)}
								</div>
							)}
						</div>
					</div>
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setShowMobileMenu(!showMobileMenu)}
							className="w-10 h-10 rounded-full flex items-center justify-center transition-colors border bg-gray-100 border-black hover:bg-gray-200"
							aria-label="Toggle menu"
						>
							{showMobileMenu ? (
								<X
									className="w-6 h-6 text-dark"
									weight="bold"
								/>
							) : (
								<List
									className="w-6 h-6 text-dark"
									weight="bold"
								/>
							)}
						</button>
					</div>
				</div>
				{showMobileMenu && (
					<div
						ref={mobileMenuRef}
						className="md:hidden absolute top-16 left-0 right-0 bg-slate-100 shadow-xl z-40 animate-slideDown"
					>
						<div className="px-4 py-4 space-y-1">
							<Link
								href={homeUrl}
								className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive(homeUrl)
									? "text-yellow-400 underline"
									: "text-dark hover:text-gray-500"
									}`}
								onClick={() => setShowMobileMenu(false)}
							>
								<span className="ml-3">Beranda</span>
							</Link>
							<Link
								href="/tentang"
								className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive("/tentang")
									? "text-yellow-400 underline"
									: "text-dark hover:text-gray-500 "
									}`}
								onClick={() => setShowMobileMenu(false)}
							>
								<span className="ml-3">Tentang</span>
							</Link>

							{isAuthenticated ? (
								<div className="pt-3 mt-3 border-t border-gray-700">
									<div className="px-4 py-3  rounded-lg mb-2">
										<div className="flex items-center space-x-3">
											<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 shadow-lg flex-shrink-0 bg-gradient-to-br from-yellow-400 to-yellow-600">
												{user?.profile_picture ? (
													<Image
														src={user.profile_picture}
														alt="profil default icon"
														width={80}
														height={80}
														className="w-full h-full object-cover"
														unoptimized
														onError={(e) => {
															const target = e.target as HTMLImageElement;
															target.onerror = null;
															target.src = '';
															target.style.display = 'none';
															const parent = target.parentElement;
															if (parent && !parent.querySelector('.fallback-profile-icon')) {
																const icon = document.createElement('div');
																icon.className = 'fallback-profile-icon';
																icon.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>';
																parent.appendChild(icon.firstChild as Node);
															}
														}}
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
														{user?.fullname
															?.charAt(0)
															.toUpperCase() ||
															user?.username
																?.charAt(0)
																.toUpperCase() ||
															"U"}
													</div>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-lg font-semibold text-black truncate">
													{user?.fullname ||
														user?.username ||
														"Username"}{" "}
													(<span className="font-semibold text-yellow-500 ">
														{user?.user_role === 'dosen' ? 'dosen' : user?.user_role === 'mahasiswa' ? 'mahasiswa' : 'Error'}
													</span>)
												</p>
												<p className="text-md text-gray-600 truncate">
													{user?.email ||
														"user@gmail.com"}
												</p>
											</div>
										</div>
									</div>
									<Link
										href="/profil"
										className="flex items-center px-4 py-3 text-base text-black hover:bg-yellow-500 rounded-lg transition-all"
										onClick={() => setShowMobileMenu(false)}
									>
										<PencilSimple
											className="w-5 h-5 text-black"
											weight="bold"
										/>
										<span className="ml-3">
											Lihat Profil
										</span>
									</Link>
									<button
										onClick={() => {
											handleLogout();
											setShowMobileMenu(false);
										}}
										className="flex items-center w-full px-4 py-3 text-base text-red-500 hover:bg-red-500 hover:text-black rounded-lg transition-all"
									>
										<SignOut
											className="w-5 h-5"
											weight="bold"
										/>
										<span className="ml-3">Keluar</span>
									</button>
								</div>
							) : (
								<div className="pt-2">
									<Link
										href="/masuk"
										className="flex items-center justify-center px-4 py-3 text-base font-semibold text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-all shadow-md"
										onClick={() => setShowMobileMenu(false)}
									>
										<span className="ml-2">
											Masuk Sekarang
										</span>
									</Link>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
