"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { monitorsAPI } from "@/lib/api";
import { Monitor } from "@/types";

interface DeleteButtonProps {
  monitor: Monitor;
  onDeleted?: () => void;
}

export default function DeleteButton({ monitor, onDeleted }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await monitorsAPI.delete(monitor.id);
      setShowConfirm(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete monitor:", error);
      alert("Failed to delete monitor");
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800"
    >
      Delete
    </button>
  );
}
