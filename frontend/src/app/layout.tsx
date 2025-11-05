 import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ReactQueryProvider } from "@/lib/react-query";
import Footer from "@/components/Footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Grade Mind - AI-Powered Essay Grading",
	description:
		"Get instant, AI-powered feedback on your essays with Grade Mind",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head />
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
			>
				<ReactQueryProvider>
					<AuthProvider>{children}</AuthProvider>
				</ReactQueryProvider>
				<Footer />
			</body>
		</html>
	);
}