"use client";

import { useState } from "react";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/your-cloud-name/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "your-upload-preset";

export default function AvatarUploader({ currentAvatar, onUpload }) {
  const [preview, setPreview] = useState(currentAvatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setLoading(true);

    const canUploadToCloudinary = CLOUDINARY_UPLOAD_PRESET !== "your-upload-preset" && !CLOUDINARY_UPLOAD_URL.includes("your-cloud-name");

    try {
      if (canUploadToCloudinary) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Cloudinary upload failed.");
        }

        const image = await response.json();
        onUpload(image.secure_url);
        setPreview(image.secure_url);
      } else {
        const objectUrl = URL.createObjectURL(file);
        onUpload(objectUrl);
        setPreview(objectUrl);
      }
    } catch (uploadError) {
      setError("Unable to upload avatar. Check your Cloudinary settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
      <div className="flex items-center gap-4">
        <img src={preview} alt="avatar preview" className="h-16 w-16 rounded-full object-cover ring-2 ring-orange-400/20" />
        <div>
          <p className="text-sm font-semibold text-white">Creator avatar</p>
          <p className="text-sm text-slate-400">Upload or change your guild profile image.</p>
        </div>
      </div>
      <label className="inline-flex cursor-pointer items-center justify-center rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
        {loading ? "Uploading..." : "Upload Avatar"}
        <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
      </label>
      <p className="text-xs text-slate-500">
        Uses Cloudinary storage when configured. Replace the upload URL and preset in `AvatarUploader.js` with your Cloudinary values.
      </p>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
