"use client";

import {
  deleteListingImage,
  uploadListingImage,
} from "@/app/actions/seller.actions";
import { Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:8000";


const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_IMAGES = 4;

interface ImageUploaderProps {
  listingId: number;
  /** Current image relative paths, e.g. "seller_products/<uuid>/file.png". */
  images: string[];
}

export function ImageUploader({ listingId, images }: ImageUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState<string[]>(images);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const srcFor = (relPath: string) =>
    `${API_BASE.replace(/\/$/, "")}/uploads/${relPath}`;
  const nameOf = (relPath: string) => relPath.split("/").pop() || relPath;

  const handleFile = async (file: File) => {
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError("Allowed types: PNG, JPG, JPEG, WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File must be 2MB or smaller.");
      return;
    }
    if (current.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images per listing.`);
      return;
    }

    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadListingImage(listingId, fd);
    setBusy(false);

    if (res.success && res.imagePath) {
      setCurrent((prev) => [...prev, res.imagePath!]);
    } else {
      setError(res.message);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (relPath: string) => {
    if (!confirm("Delete this image?")) return;
    setBusy(true);
    const res = await deleteListingImage(listingId, nameOf(relPath));
    setBusy(false);
    if (res.success) {
      setCurrent((prev) => prev.filter((p) => p !== relPath));
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Images ({current.length}/{MAX_IMAGES})
        </h2>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {current.map((relPath) => (
          <div
            key={relPath}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={srcFor(relPath)}
              alt=""
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(relPath)}
              disabled={busy}
              aria-label="Delete image"
              className="absolute top-1 right-1 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
            >
              <Delete fontSize="small" />
            </button>
          </div>
        ))}

        {current.length < MAX_IMAGES && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-indigo-400 transition-colors">
            <span className="text-2xl">+</span>
            <span className="text-xs mt-1">{busy ? "Uploading…" : "Add image"}</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-gray-500">
        PNG/JPG/JPEG/WEBP, up to 2MB each, max {MAX_IMAGES} images. Uploaded one
        at a time.
      </p>
    </div>
  );
}
