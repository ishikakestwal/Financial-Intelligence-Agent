"use client";

import { useState } from "react";
import { uploadCSV } from "@/lib/api";

export function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await uploadCSV(file);
      setMessage(`Successfully uploaded ${res.inserted} transactions.`);
      setFile(null);
      // Reset file input if needed
      const fileInput = document.getElementById("csv-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="glass rounded-2xl max-w-xl mx-auto p-6 mt-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-300 shadow-glow grid place-items-center text-lg">
            ⇧
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Upload Transactions</h2>
            <p className="text-sm text-slate-400">Upload a CSV file containing raw transaction data.</p>
          </div>
        </div>

        <div className="mt-6 border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/[0.02]">
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium text-slate-200"
          >
            Select CSV File
          </label>
          {file && (
            <div className="mt-4 text-sm text-emerald-300 font-mono">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
            {message}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              !file || isUploading
                ? "bg-white/5 text-slate-500 cursor-not-allowed"
                : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-glow"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
