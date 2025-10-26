interface AlertProps {
  type: "error" | "success" | "info";
  message: string;
}

const alertStyles = {
  error:
    "bg-red-50 border-red-300 text-red-800 shadow-sm",
  success:
    "bg-green-50 border-green-300 text-green-800 shadow-sm",
  info: "bg-blue-50 border-blue-300 text-blue-800 shadow-sm",
};

export default function Alert({ type, message }: AlertProps) {
  if (!message) return null;

  return (
    <div className={`border-l-4 px-4 py-3 rounded-r-lg text-sm font-medium ${alertStyles[type]}`}>
      {message}
    </div>
  );
}
