"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { motion, useScroll, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function AboutPage() {
	const [activeSection, setActiveSection] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { scrollYProgress } = useScroll();
	const smoothProgress = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001
	});

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

	useEffect(() => {
		let preventScroll = false;

		const scrollToSection = (sectionIndex: number) => {
			const windowHeight = window.innerHeight;
			const targetScroll = sectionIndex * windowHeight;
			
			preventScroll = true;
			setIsAnimating(true);
			setActiveSection(sectionIndex);
			
			window.scrollTo({
				top: targetScroll,
				behavior: 'smooth'
			});
			setTimeout(() => {
				preventScroll = false;
				setIsAnimating(false);
			}, 1100);
		};

		const handleWheel = (e: WheelEvent) => {
			const target = e.target as HTMLElement;
			const teamContainer = document.querySelector('.team-scroll-container') as HTMLElement;
			
			if (teamContainer && teamContainer.contains(target)) {
				const isAtTop = teamContainer.scrollTop === 0;
				const isAtBottom = Math.abs(teamContainer.scrollHeight - teamContainer.scrollTop - teamContainer.clientHeight) < 1;
				
				if (e.deltaY > 0 && !isAtBottom) {
					e.stopPropagation();
					return;
				}
				if (e.deltaY < 0 && !isAtTop) {
					e.stopPropagation();
					return;
				}
			}

			if (preventScroll || isAnimating) {
				e.preventDefault();
				return;
			}

			e.preventDefault();
			
			const scrollPosition = window.scrollY;
			const windowHeight = window.innerHeight;
			const currentSection = Math.round(scrollPosition / windowHeight);
			if (e.deltaY > 0) {
				if (currentSection < 3) {
					scrollToSection(currentSection + 1);
				}
			} else {
				if (currentSection > 0) {
					scrollToSection(currentSection - 1);
				}
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (preventScroll || isAnimating) return;

			const scrollPosition = window.scrollY;
			const windowHeight = window.innerHeight;
			const currentSection = Math.round(scrollPosition / windowHeight);

			if (e.key === 'ArrowDown' || e.key === 'PageDown') {
				e.preventDefault();
				if (currentSection < 3) {
					scrollToSection(currentSection + 1);
				}
			} else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
				e.preventDefault();
				if (currentSection > 0) {
					scrollToSection(currentSection - 1);
				}
			}
		};
		const handleScroll = () => {
			if (!isAnimating) {
				const scrollPosition = window.scrollY;
				const windowHeight = window.innerHeight;
				const currentSection = Math.round(scrollPosition / windowHeight);
				setActiveSection(currentSection);
			}
		};
		const handleTeamContainerWheel = (e: Event) => {
			e.stopPropagation();
		};

		window.addEventListener('wheel', handleWheel, { passive: false });
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('scroll', handleScroll, { passive: true });
		const teamContainer = document.querySelector('.team-scroll-container');
		if (teamContainer) {
			teamContainer.addEventListener('wheel', handleTeamContainerWheel as EventListener, { passive: true });
		}

		return () => {
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('scroll', handleScroll);
			if (teamContainer) {
				teamContainer.removeEventListener('wheel', handleTeamContainerWheel as EventListener);
			}
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, [isAnimating]);

	return (
		<>
			<Navbar />
			<motion.div
				className="fixed top-0 left-0 right-0 h-1 bg-yellow-500 origin-left z-50"
				style={{ scaleX: smoothProgress }}
			/>

			<main className="bg-gray-50">
				<motion.section 
					className="min-h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-64 snap-start snap-always"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: false, amount: 0.3 }}
					transition={{ duration: 0.8 }}
					onAnimationComplete={() => {
						if (activeSection === 0) {
							setTimeout(() => setIsAnimating(false), 100);
						}
					}}
				>
					<div className="container mx-auto">
						<motion.h2 
							className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-center text-gray-900"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: false, amount: 0.5 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<span className="text-yellow-500">TENTANG</span> KAMI
						</motion.h2>
						<div className="max-w-4xl mx-auto text-center space-y-6">
							<motion.p 
								className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false, amount: 0.5 }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
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
							</motion.p>
							<motion.p 
								className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false, amount: 0.5 }}
								transition={{ duration: 0.6, delay: 0.6 }}
							>
								<span className="text-yellow-600 font-bold">
									GRADE MIND
								</span>{" "}
								adalah platform AI powered yang merevolusi cara
								penilaian esai. Kami bukan sekedar alat koreksi,
								melainkan asisten pintar yang dapat{" "}
								<span className="text-yellow-600 font-semibold">
									menghemat waktu
								</span>{" "}
								Anda, memasukkan akurasi, dan meningkatkan
								transparansi dalam proses penilaian.
							</motion.p>
						</div>
					</div>
				</motion.section>
				<motion.section 
					className="min-h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-44 bg-white snap-start snap-always"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: false, amount: 0.3 }}
					transition={{ duration: 0.8 }}
					onAnimationComplete={() => {
						if (activeSection === 1) {
							setTimeout(() => setIsAnimating(false), 100);
						}
					}}
				>
					<div className="container mx-auto">
						<motion.h2 
							className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-center text-gray-900"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: false, amount: 0.5 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<span className="text-yellow-500">BAGAIMANA KAMI</span>{" "}
							BEKERJA?
						</motion.h2>
						<div className="max-w-4xl mx-auto text-base sm:text-lg lg:text-xl text-gray-700">
							<motion.p 
								className="mb-8 text-center leading-relaxed"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false, amount: 0.5 }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
								Dengan menggabungkan{" "}
								<span className="text-yellow-600 font-bold">
									empat pilar teknologi AI canggih
								</span>
								, GRADE MIND memberikan solusi penilaian yang
								komprehensif:
							</motion.p>
							<div className="space-y-6">
								<motion.div
									className="p-6 rounded-xl bg-gray-50 hover:bg-yellow-50 transition-colors"
									initial={{ opacity: 0, x: -50 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: false, amount: 0.5 }}
									transition={{ duration: 0.6, delay: 0.5 }}
								>
									<span className="text-yellow-600 font-bold text-lg">
										1. Pengenalan Tulisan Tangan dengan AI
									</span>
									<p className="mt-2">
										Kami mengubah hasil pindaian (scan) tulisan
										tangan mahasiswa menjadi teks digital yang dapat
										diolah, menghilangkan hambatan membaca tulisan
										yang sulit.
									</p>
								</motion.div>
								<motion.div
									className="p-6 rounded-xl bg-gray-50 hover:bg-yellow-50 transition-colors"
									initial={{ opacity: 0, x: -50 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: false, amount: 0.5 }}
									transition={{ duration: 0.6, delay: 0.7 }}
								>
									<span className="text-yellow-600 font-bold text-lg">
										2. Penilaian Otomatis
									</span>
									<p className="mt-2">
										Menggunakan model bahasa besar (LLM), sistem
										kami membandingkan jawaban mahasiswa dengan
										kunci jawaban dan memberikan skor yang objektif
										dan konsisten.
									</p>
								</motion.div>
							</div>
						</div>
					</div>
				</motion.section>
				<motion.section 
					className="min-h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-64 bg-gray-50 snap-start snap-always"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: false, amount: 0.3 }}
					transition={{ duration: 0.8 }}
					onAnimationComplete={() => {
						if (activeSection === 2) {
							setTimeout(() => setIsAnimating(false), 100);
						}
					}}
				>
					<div className="container mx-auto">
						<motion.h2 
							className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-center text-gray-900"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: false, amount: 0.5 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<span className="text-yellow-500">MISI</span> KAMI
						</motion.h2>
						<div className="max-w-4xl mx-auto text-center">
							<motion.p 
								className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed"
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: false, amount: 0.5 }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
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
									GRADE MIND
								</span>
								, penilaian esai menjadi lebih cepat, transparan,
								dan dapat diandalkan.
							</motion.p>
						</div>
					</div>
				</motion.section>
				<motion.section 
					className="min-h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-12 pb-12 bg-white snap-start"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: false, amount: 0.1 }}
					transition={{ duration: 0.8 }}
					onAnimationComplete={() => {
						if (activeSection === 3) {
							setTimeout(() => setIsAnimating(false), 100);
						}
					}}
				>
					<div className="container mx-auto team-scroll-container">
						<motion.h2 
							className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-center text-gray-900"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: false, amount: 0.5 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<span className="text-yellow-500">TEMUI TIM</span> KAMI
						</motion.h2>
						<div className="max-w-6xl mx-auto">
							<motion.p 
								className="text-center text-base sm:text-lg lg:text-xl text-gray-700 mb-12 leading-relaxed"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false, amount: 0.5 }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
								Kami adalah sekelompok individu bersemangat yang
								ahli dalam pengembangan desain, dan AI. Kami bersatu
								untuk mewujudkan visi GRADE MIND, sebuah solusi
								penilaian esai yang revolusioner.
							</motion.p>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
								{teamMembers.map((member, index) => (
									<motion.div
										key={index}
										className={`rounded-2xl p-6 flex flex-col items-center text-center transition-all hover:shadow-xl bg-white ${
											member.highlight === "yellow"
												? "border-2 border-yellow-400"
												: "border-2 border-gray-300"
										}`}
										initial={{ opacity: 0, y: 50 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: false, amount: 0.3 }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
										whileHover={{ y: -10 }}
									>
										<div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden flex items-center justify-center relative">
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
										<h3 className="font-bold text-gray-900 mb-1 text-base">
											{member.name}
										</h3>
										{member.role && (
											<p
												className={`text-xs mb-4 font-semibold ${
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
									</motion.div>
								))}
							</div>
						</div>
					</div>
				</motion.section>
			</main>
		</>
	);
}