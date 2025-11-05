"use client";

import { useEffect, useState, useRef } from "react";

export default function GlowingCorner() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
	const [isVisible, setIsVisible] = useState(false);
	const [ballSize, setBallSize] = useState(480);
	const [blurAmount, setBlurAmount] = useState(0);
	const [gradient, setGradient] = useState(
		"radial-gradient(circle, rgba(250, 204, 21, 0.8) 0%, rgba(250, 204, 21, 0.6) 20%, rgba(250, 204, 21, 0.3) 40%, transparent 70%)"
	);
	const animationFrameId = useRef<number | undefined>(undefined);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setTargetPosition({ x: e.clientX, y: e.clientY });
			if (!isVisible) setIsVisible(true);
			const masukButton = document.querySelector(
				'a[href="/masuk"]'
			) as HTMLElement;
			const daftarButton = document.querySelector(
				'a[href="/daftar"]'
			) as HTMLElement;

			let minDistance = Infinity;
			if (masukButton) {
				const rect = masukButton.getBoundingClientRect();
				const buttonCenterX = rect.left + rect.width / 2;
				const buttonCenterY = rect.top + rect.height / 2;

				const distance = Math.sqrt(
					Math.pow(e.clientX - buttonCenterX, 2) +
						Math.pow(e.clientY - buttonCenterY, 2)
				);

				minDistance = Math.min(minDistance, distance);
			}
			if (daftarButton) {
				const rect = daftarButton.getBoundingClientRect();
				const buttonCenterX = rect.left + rect.width / 2;
				const buttonCenterY = rect.top + rect.height / 2;

				const distance = Math.sqrt(
					Math.pow(e.clientX - buttonCenterX, 2) +
						Math.pow(e.clientY - buttonCenterY, 2)
				);

				minDistance = Math.min(minDistance, distance);
			}
			if (minDistance < 70) {
				setBallSize(1080);
				setBlurAmount(30);
				setGradient(
					"radial-gradient(circle, rgba(250, 204, 21, 0.4) 0%, rgba(250, 204, 21, 0.2) 25%, rgba(250, 204, 21, 0.1) 60%, transparent 50%)"
				);
			} else {
				setBallSize(80);
				setBlurAmount(10);
				setGradient(
					"radial-gradient(circle, rgba(250, 204, 21, 0.8) 0%, rgba(250, 204, 21, 0.6) 20%, rgba(250, 204, 21, 0.3) 40%, transparent 70%)"
				);
			}
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [isVisible]);

	useEffect(() => {
		const lerp = (start: number, end: number, factor: number) => {
			return start + (end - start) * factor;
		};

		const animate = () => {
			setMousePosition((prev) => ({
				x: lerp(prev.x, targetPosition.x, 0.08),
				y: lerp(prev.y, targetPosition.y, 0.08),
			}));
			animationFrameId.current = requestAnimationFrame(animate);
		};

		animationFrameId.current = requestAnimationFrame(animate);

		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, [targetPosition]);

	return (
		<>
			<div
				className="fixed inset-0 pointer-events-none z-[5]"
				style={{
					overflow: "hidden",
				}}
			>
				<div
					className="absolute transition-all duration-1000 ease-out"
					style={{
						left: `${mousePosition.x}px`,
						top: `${mousePosition.y}px`,
						transform: "translate(-50%, -50%)",
						width: `${ballSize}px`,
						height: `${ballSize}px`,
						background: gradient,
						opacity: isVisible ? 1 : 0,
						pointerEvents: "none",
						filter: `blur(${blurAmount}px)`,
						willChange: "transform, width, height, filter",
						transitionProperty: "opacity, width, height, filter",
					}}
				/>
			</div>
		</>
	);
}