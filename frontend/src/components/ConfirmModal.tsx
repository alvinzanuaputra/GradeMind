import { X, Warning } from "phosphor-react";
import Button from "./Button";

interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	isLoading?: boolean;
	isDangerous?: boolean;
}

export default function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Ya, Lanjutkan",
	cancelText = "Batal",
	isLoading = false,
	isDangerous = true,
}: ConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<>
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
				onClick={onClose}
			/>

			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div
					className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scale-in"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<div className="flex items-center gap-3">
							<div className={`p-2 rounded-lg ${isDangerous ? 'bg-red-100' : 'bg-yellow-100'}`}>
								<Warning
									className={`w-6 h-6 ${isDangerous ? 'text-red-600' : 'text-yellow-600'}`}
									weight="bold"
								/>
							</div>
							<h3 className="text-xl font-bold text-gray-800">{title}</h3>
						</div>
						<button
							onClick={onClose}
							disabled={isLoading}
							className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
						>
							<X className="w-5 h-5 text-gray-500" weight="bold" />
						</button>
					</div>

					<div className="p-6">
						<p className="text-gray-700 leading-relaxed">{message}</p>
					</div>

					<div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
						<Button
							onClick={onClose}
							disabled={isLoading}
							variant="secondary"
							className="px-6 py-2"
						>
							{cancelText}
						</Button>
						<Button
							onClick={onConfirm}
							disabled={isLoading}
							isLoading={isLoading}
							className={`px-6 py-2 ${
								isDangerous
									? 'bg-red-500 hover:bg-red-600 text-white'
									: 'bg-yellow-400 hover:bg-yellow-500 text-black'
							}`}
						>
							{confirmText}
						</Button>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes scale-in {
					from {
						opacity: 0;
						transform: scale(0.9);
					}
					to {
						opacity: 1;
						transform: scale(1);
					}
				}
				.animate-scale-in {
					animation: scale-in 0.2s ease-out;
				}
			`}</style>
		</>
	);
}