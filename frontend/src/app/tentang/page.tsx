"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function AboutPage() {
	const teamMembers = [
		{
			name: "Choirul Anam",
			role: "ARTIFICIAL INTELLIGENCE",
			image: "/images/team/anam.jpg",
			instagram: "https://instagram.com/__anamm15",
			linkedin: "https://www.linkedin.com/in/choirulanm15",
			highlight: "yellow",
		},
		{
			name: "Alvin Zanua Putra",
			role: "FRONTEND & BACKEND",
			image: "/images/team/alvin.jpg",
			instagram: "https://instagram.com/alvinzanuaputra",
			linkedin: "https://www.linkedin.com/in/alvinzanuaputra",
			highlight: "yellow",
		},
		{
			name: "Muh. Buyung Saloka",
			role: "ARTIFICIAL INTELLIGENCE",
			image: "/images/team/buyung.jpg",
			instagram: "https://instagram.com/mbsaloka",
			linkedin: "https://www.linkedin.com/in/buyung-saloka/",
			highlight: "yellow",
		},
		{
			name: "Pramuditya Faiz Ardiansyah",
			role: "BACKEND",
			image: "/images/team/faiz.jpg",
			instagram: "https://instagram.com/pfaizar_",
			linkedin: "https://www.linkedin.com/in/pfaizar",
			highlight: "yellow",
		},
		{
			name: "Muhammad Azhar Aziz",
			role: "UI DESIGNER",
			image: "/images/team/azhar.jpg",
			instagram: "https://instagram.com/muhammmad_azhar_",
			linkedin: "https://www.linkedin.com/in/azharaa",
			highlight: "yellow",
		},
		{
			name: "Christoforus Indra Bagus Pratama",
			role: "UX DESIGNER",
			image: "/images/team/christo.jpg",
			instagram: "https://instagram.com/cchristo_",
			linkedin: "https://www.linkedin.com/in/christoforus-indra-a82a65288",
			highlight: "yellow",
		},
		{
			name: "Nadin Nabil Hafizh Ayyasy",
			role: "ARTIFICIAL INTELLIGENCE",
			image: "/images/team/hafizh.jpg",
			instagram: "https://instagram.com/nabpizh",
			linkedin: "https://www.linkedin.com/in/hafizh-ayyasy-161b54288",
			highlight: "yellow",
		},
		{
			name: "Rachmat Ramadhan",
			role: "ARTIFICIAL INTELLIGENCE",
			image: "/images/team/rachmat.jpg",
			instagram: "https://instagram.com/rachmatramadhan_",
			linkedin: "https://www.linkedin.com/in/rachmat-ramadhan-4641b2289",
			highlight: "yellow",
		},
	];
	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<section className="mb-16 sm:mb-20">
					<h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
						<span className="text-yellow-500">TENTANG</span> KAMI
					</h2>
					<div className="max-w-4xl mx-auto text-center space-y-4">
						<p className="text-sm sm:text-base lg:text-lg text-gray-600">
							Penilaian esai{" "}
							<span className="text-yellow-600 font-semibold">adalah</span>{" "}
							bagian penting dari proses pendidikan, tapi sering
							kali menjadi beban berat bagi guru.{" "}
							<span className="text-yellow-600 font-semibold">Membaca</span> dan{" "}
							<span className="text-yellow-600 font-semibold">menilai</span>{" "}
							esai yang beragam, memastikan objektivitas, dan
							mendeteksi plagiat bisa sangat memakan waktu. Kami
							memahami tantangan ini dan hadir untuk
							mewujudkannya.
						</p>
						<p className="text-sm sm:text-base lg:text-lg text-gray-600">
							<span className="text-yellow-600 font-bold">
								ESSAY GRADER
							</span>{" "}
							adalah platform AI powered yang merevolusi cara
							penilaian esai. Kami bukan sekedar alat koreksi,
							melainkan asisten pintar yang dapat{" "}
							<span className="text-yellow-600 font-semibold">
								menghemat waktu
							</span>{" "}
							Anda, memasukkan akurasi, dan meningkatkan
							transparansi dalam proses penilaian.
						</p>
					</div>
				</section>
				<section className="mb-16 sm:mb-20">
					<h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
						<span className="text-yellow-500">BAGAIMANA KAMI</span>{" "}
						BEKERJA?
					</h2>
					<div className="max-w-4xl mx-auto text-sm sm:text-base lg:text-lg text-gray-700">
						<p className="mb-6">
							Dengan menggabungkan{" "}
							<span className="text-yellow-600 font-bold">
								empat pilar teknologi AI canggih
							</span>
							, Essay Grader memberikan solusi penilaian yang
							komprehensif:
						</p>
						<div className="space-y-4">
							<div>
								<span className="text-yellow-600 font-bold">
									1. Pengenalan Tulisan Tangan dengan AI
								</span>{" "}
								: Kami mengubah hasil pindaian (scan) tulisan
								tangan mahasiswa menjadi teks digital yang dapat
								diolah, menghilangkan hambatan membaca tulisan
								yang sulit.
							</div>
							<div>
								<span className="text-yellow-600 font-bold">
									2. Penilaian Otomatis
								</span>{" "}
								: Menggunakan model bahasa besar (LLM), sistem
								kami membandingkan jawaban mahasiswa dengan
								kunci jawaban dan memberikan skor yang objektif
								dan konsisten.
							</div>
						</div>
					</div>
				</section>
				<section className="mb-16 sm:mb-20">
					<h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
						<span className="text-yellow-500">MISI</span> KAMI
					</h2>
					<div className="max-w-4xl mx-auto text-center">
						<p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-4">
							Misi kami adalah{" "}
							<span className="text-yellow-600 font-bold">
								memberdayakan pendidik dengan alat yang efektif
								dan efisien
							</span>
							. Kami ingin mengurangi beban administratif,
							memantik diskusi lebih produktif dengan mahasiswa,
							dan mengembangkan kurikulum yang lebih canggih.
							Dengan{" "}
							<span className="text-yellow-600 font-bold">
								ESSAY GRADER
							</span>
							, penilaian esai menjadi lebih cepat, transparan,
							dan dapat diandalkan.
						</p>
					</div>
				</section>

				{/* Temui Tim Kami Section */}
				<section>
					<h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center text-gray-900">
						<span className="text-yellow-500">TEMUI TIM</span> KAMI
					</h2>
					<div className="max-w-6xl mx-auto">
						<p className="text-center text-sm sm:text-base lg:text-lg text-gray-700 mb-8 sm:mb-12">
							Kami adalah sekelompok individu bersemangat yang
							ahli dalam pengembangan desain, dan AI. Kami bersatu
							untuk mewujudkan visi Essay Grader, sebuah solusi
							penilaian esai yang revolusioner.
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
							{teamMembers.map((member, index) => (
								<div
									key={index}
									className={`rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-lg bg-white ${
										member.highlight === "yellow"
											? "border-2 border-yellow-400"
											: "border-2 border-gray-300"
									}`}
								>
									<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 mb-3 sm:mb-4 overflow-hidden flex items-center justify-center relative">
										<Image
											src={member.image}
											alt={member.name}
											width={96}
											height={96}
											className="w-full h-full object-cover"
											onError={(e) => {
												const target =
													e.target as HTMLImageElement;
												target.style.display = "none";
											}}
										/>
									</div>
									<h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
										{member.name}
									</h3>
									{member.role && (
										<p
											className={`text-xs mb-3 sm:mb-4 font-semibold ${
												member.highlight === "yellow"
													? "text-yellow-600"
													: "text-gray-600"
											}`}
										>
											{member.role}
										</p>
									)}
									<div className="flex gap-3 mt-auto">
										<a
											href={member.instagram}
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-500 hover:text-yellow-500 transition-colors"
										>
											<FaInstagram className="w-5 h-5" />
										</a>
										<a
											href={member.linkedin}
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-500 hover:text-yellow-500 transition-colors"
										>
											<FaLinkedinIn className="w-5 h-5" />
										</a>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
