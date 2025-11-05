"use client";

import React, { FC } from "react";
import Link from "next/link";
import Image from "next/image";

const Footer: FC = () => {
	const year = new Date().getFullYear();

	return (
		<footer className="text-gray-600 px-10 border-t-2 border-gray-300 bg-gray-50">
			<div className="container mx-auto py-10">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div>
						<div className="flex items-center space-x-1 sm:space-x-2 group mb-4">
						<div className="flex items-center text-base sm:text-lg md:text-xl lg:text-xl font-extrabold">
							<Image
								src="/images/logo/grade-mind-logo.png"
								alt="Logo GradeMind"
								width={32}
								height={32}
								className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-7 lg:h-7 inline-block mr-1 sm:mr-2"
								unoptimized
							/>
							<span className="text-yellow-400 group-hover:animate-pulse">GRADE</span>
							<span className="text-gray-900"> MIND</span>
						</div>
					</div>
						<p className="text-sm leading-relaxed">
							GradeMind merupakan hasil inovasi mahasiswa{" "}
							<a
								href="https://www.its.ac.id/informatika/"
								target="__blank"
								rel="noopener noreferrer"
								className="text-yellow-600 hover:text-yellow-700 font-medium"
							>
								Teknik Informatika ITS
							</a>{" "}
							dalam pengembangan sistem{" "}
							<span className="font-semibold">penilaian otomatis esai</span>{" "}
							berbasis kecerdasan buatan. Proyek ini bertujuan membantu dosen
							dan mahasiswa dalam proses evaluasi akademik yang efisien dan
							objektif.
						</p>
					</div>
					<div>
						<h3 className="text-md font-semibold mb-4 text-black">
							Tautan Resmi
						</h3>
						<ul className="text-sm space-y-2">
							<li>
								<a
									href="https://www.its.ac.id/"
									target="__blank"
									rel="noopener noreferrer"
									className="hover:text-yellow-600"
								>
									Situs Resmi ITS
								</a>
							</li>
							<li>
								<a
									href="https://www.its.ac.id/informatika/"
									target="__blank"
									rel="noopener noreferrer"
									className="hover:text-yellow-600"
								>
									Departemen Informatika ITS
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-md font-semibold mb-4 text-black">
							Proyek GradeMind
						</h3>
						<ul className="text-sm space-y-2">
							<li>
								<Link href="https://www.its.ac.id/informatika/id/profil-dwi-sunaryono/" className="hover:text-yellow-600">
									Pembimbing
								</Link>
							</li>
							<li>
								<Link href="/tentang" className="hover:text-yellow-600">
									Tim Pengembang
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-md font-semibold mb-4 text-black">Kontak</h3>
						<ul className="text-sm space-y-2">
							<li>
								Email:{" "}
								<a
									href="mailto:informatika@its.ac.id"
									className="hover:text-yellow-600"
								>
									informatika@its.ac.id
								</a>
							</li>
							<li>Alamat: Jl. Raya ITS, Sukolilo, Surabaya 60111</li>
							<li>
								<a
									href="https://maps.app.goo.gl/js1gSzGFmqg4Bobt5"
									target="__blank"
									rel="noopener noreferrer"
									className="hover:text-yellow-600"
								>
									Lihat Lokasi
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t-2 py-4 border-gray-300">
				<div className="flex justify-between">
					<ul className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
						<li>
							<Link href="/" className="hover:text-yellow-600">
								Kebijakan Privasi
							</Link>
						</li>
						<li>
							<Link href="/" className="hover:text-yellow-600">
								Ketentuan Layanan
							</Link>
						</li>
						<li>
							<Link href="/" className="hover:text-yellow-600">
								Aksesibilitas
							</Link>
						</li>
					</ul>
				</div>
				<p className="text-xs md:text-sm font-semibold flex items-center md:justify-end text-gray-700">
					© {year} GradeMind — Teknik Informatika ITS.
				</p>
			</div>
		</footer>
	);
};

export default Footer;