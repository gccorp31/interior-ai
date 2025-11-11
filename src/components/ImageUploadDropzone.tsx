"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabaseClient } from "@/lib/supabaseClient";

type Props = {
  onUploaded?: (url: string) => void;
};

export default function ImageUploadDropzone({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt ?? "jpg"}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("uploads")
        .upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;

      const { data } = supabaseClient.storage.from("uploads").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      setUploadedUrl(publicUrl);
      onUploaded?.(publicUrl);
    } catch (e: any) {
      setError(e?.message ?? "Erreur d'upload");
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  const accept = useMemo(() => ({
    "image/*": [".png", ".jpg", ".jpeg", ".webp"]
  }), []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`group flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragActive
            ? "border-zinc-900 bg-gradient-to-br from-zinc-50 to-zinc-100 shadow-inner dark:border-zinc-400 dark:from-zinc-800 dark:to-zinc-900"
            : "border-zinc-300 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-100/50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        }`}
      >
        <input {...getInputProps()} />
        <div className="mb-4">
          <svg
            className={`mx-auto h-12 w-12 transition-transform ${isDragActive ? "scale-110" : "group-hover:scale-105"}`}
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
        {isDragActive ? (
          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Déposez l'image ici...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              Glissez-déposez une image de votre pièce
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">ou cliquez pour sélectionner</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">PNG, JPG, JPEG, WEBP (max 20MB)</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-700">
            <div className="bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Aperçu
            </div>
            <img src={preview} alt="Aperçu" className="h-48 w-full object-cover" />
          </div>
          {uploadedUrl && (
            <div className="overflow-hidden rounded-lg border border-green-200 shadow-sm dark:border-green-900/50">
              <div className="bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300">
                Uploadé
              </div>
              <img src={uploadedUrl} alt="Uploadé" className="h-48 w-full object-cover" />
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center">
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Upload en cours...</span>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            ❌ {error}
          </div>
        )}
        {uploadedUrl && !uploading && !error && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Image chargée avec succès</span>
          </div>
        )}
      </div>
    </div>
  );
}



