"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import Image from "next/image";

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  preview: string | null;
}

export default function UploadBox({ onFileSelect, preview }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    onFileSelect(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200
        ${dragging
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
        }
        ${preview ? "p-2" : "p-8"}
        flex flex-col items-center justify-center min-h-[180px]
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {preview ? (
        <div className="relative w-full rounded-xl overflow-hidden" style={{ minHeight: 160 }}>
          <Image
            src={preview}
            alt="Uploaded slide preview"
            fill
            className="object-contain rounded-xl"
            unoptimized
          />
          <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 hover:opacity-100 transition-opacity">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs text-white">
              Click to replace
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Upload icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-300">
            Drop your slide or screenshot here
          </p>
          <p className="mt-1 text-xs text-slate-500">
            PNG, JPEG, or WebP — click to browse
          </p>
        </>
      )}
    </div>
  );
}
