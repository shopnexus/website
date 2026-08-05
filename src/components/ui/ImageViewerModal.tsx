"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

export default function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  altText = "Hình ảnh",
}: ImageViewerModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = imageUrl;
    link.target = "_blank";
    link.download = imageUrl.split("/").pop()?.split("?")[0] || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 transition-opacity"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <button
          onClick={handleDownload}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/20 text-white hover:bg-surface/40 transition-colors backdrop-blur-sm"
          title="Tải xuống"
        >
          <span className="material-symbols-outlined">download</span>
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/20 text-white hover:bg-surface/40 transition-colors backdrop-blur-sm"
          title="Đóng"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Image Container */}
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <Image
          src={imageUrl}
          alt={altText}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    </div>,
    document.body
  );
}
