interface StatusBadgeProps {
  status: "healthy" | "error" | "unknown";
  isActive: boolean;
}

export default function StatusBadge({ status, isActive }: StatusBadgeProps) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Paused
      </span>
    );
  }

  const statusConfig = {
    healthy: {
      bg: "bg-green-100",
      text: "text-green-800",
      dot: "bg-green-400",
      label: "Healthy",
    },
    error: {
      bg: "bg-red-100",
      text: "text-red-800",
      dot: "bg-red-400",
      label: "Error",
    },
    unknown: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      dot: "bg-yellow-400",
      label: "Unknown",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} mr-1.5`} />
      {config.label}
    </span>
  );
}
