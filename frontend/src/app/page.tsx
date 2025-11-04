"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import GuestRoute from "@/components/GuestRoute";
import GlowingCorner from "@/components/GlowingCorner";

export default function Home() {
	return (
		<GuestRoute>
			<HomeContent />
		</GuestRoute>
	);
}

function HomeContent() {
	return (
		<div className="min-h-screen flex flex-col bg-white relative">
			<GlowingCorner />
			<div className="relative z-10">
				<Navbar />
				<section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 min-h-[calc(100vh-80px)]">
					<div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="text-left"
						>
							<h1 className="text-7xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 tracking-tighter">
								{"GRADE".split("").map((letter, index) => (
									<motion.span
										key={`grade-${index}`}
										initial={{ y: 100, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{
											delay: 0.3 + index * 0.05,
											type: "spring",
											stiffness: 150,
											damping: 25,
										}}
										className="inline-block text-yellow-400 drop-shadow-lg"
									>
										{letter}
									</motion.span>
								))}
								<br />
								{"MIND".split("").map((letter, index) => (
									<motion.span
										key={`mind-${index}`}
										initial={{ y: 100, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{
											delay: 0.6 + index * 0.05,
											type: "spring",
											stiffness: 150,
											damping: 25,
										}}
										className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-gray-900 to-gray-700"
									>
										{letter}
									</motion.span>
								))}
							</h1>
						</motion.div>
						<motion.div
							initial={{ opacity: 1, x: 50 }}
							animate={{ opacity: 1, x: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}
							className="text-left"
						>
							<motion.h2
								initial={{ opacity: 1 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.8 }}
								className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-black"
							>
								Selamat Datang!
							</motion.h2>
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 1 }}
								className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed text-black"
							>
								Mengoreksi esai kini tidak lagi memakan waktu.
								Grade Mind adalah platform bertenaga AI yang
								merevolusi cara Anda menilai tugas-tugas
								mahasiswa. Mengoreksi esai tidak pernah secepat
								ini. Dengan teknologi OCR dan LLM, platform kami
								menilai jawaban tulisan tangan secara otomatis
								dan akurat. Kurangi beban administratif, fokus
								pada pendidikan.
							</motion.p>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1.2 }}
								className="flex flex-row items-start gap-3 sm:gap-4 justify-start"
							>
								<Link
									href="/masuk"
									className="group"
								>
									<div className="flex items-center relative bg-gradient-to-b from-yellow-400/20 to-yellow-500/20 p-px rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
										<Button
											size="lg"
											className="min-w-[120px] sm:min-w-[140px] rounded-[0.7rem] bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold transition-all duration-300 group-hover:-translate-y-0.5 border border-yellow-500/20"
										>
											Masuk
										</Button>
									</div>
								</Link>
								<Link
									href="/daftar"
									className="group"
								>
									<div className="flex items-center relative bg-gradient-to-b from-black/10 to-white/10 p-px rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
										<Button
											size="lg"
											variant="outline"
											className="min-w-[120px] sm:min-w-[140px] rounded-[0.7rem] backdrop-blur-md bg-white/95 hover:bg-white text-gray-900 font-semibold transition-all duration-300 group-hover:-translate-y-0.5 border border-gray-300"
										>
											Daftar
										</Button>
									</div>
								</Link>
							</motion.div>
						</motion.div>
					</div>
				</section>
			</div>
		</div>
	);
}