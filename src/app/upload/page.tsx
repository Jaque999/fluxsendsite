"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle2, Lock, Timer, X, Shield, ChevronDown } from "lucide-react";
import Link from "next/link";

type FileItem = {
  id: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
};

export default function UploadPage() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState("");
  const [encryptClientSide, setEncryptClientSide] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState<number | null>(60);
  const [link, setLink] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [overlayDrag, setOverlayDrag] = useState(false);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2,8)}`,
      file: f,
      progress: 0,
      status: "queued" as const,
    }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const startUpload = useCallback(async () => {
    if (items.length === 0) return;
    // Initialize upload session
    const initRes = await fetch("/api/upload/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: items.map((i) => ({ name: i.file.name, size: i.file.size, type: i.file.type })),
        clientEncrypted: encryptClientSide,
        expiry: expiryMinutes === null ? null : expiryMinutes * 60,
        maxDownloads: null,
      }),
    });
    const initData = await initRes.json();

    // Upload each file to server
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const presigned = initData.presignedUrls[idx];
      if (!presigned?.url) continue;
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: "uploading", progress: 0 } : it)));
      try {
        const fd = new FormData();
        fd.append("file", item.file);
        const uploadRes = await fetch(presigned.url, { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error("Upload failed");
        setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: "done", progress: 100 } : it)));
      } catch {
        setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: "error" } : it)));
      }
    }

    // finalize upload
    try {
      const res = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId: initData.uploadId,
          token: initData.token,
          filesMeta: items.map((i, idx) => ({ name: i.file.name, size: i.file.size, type: i.file.type, storageKey: initData.presignedUrls[idx]?.storageKey })),
          clientEncrypted: encryptClientSide,
          expiresAt: initData.expiresAt ?? null,
          maxDownloads: null,
          passwordProtected: Boolean(password),
        }),
      });
      const data = await res.json();
      setLink(data?.publicLink ?? null);
    } catch {
      // ignore
    }
  }, [items, password, expiryMinutes, encryptClientSide]);

  const hasQueued = useMemo(() => items.length > 0, [items.length]);

  // Global drag overlay for easier dropping
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      if (Array.from(e.dataTransfer.types).includes("Files")) {
        e.preventDefault();
        setOverlayDrag(true);
      }
    };
    const onDrop = (e: DragEvent) => {
      if (e.dataTransfer) {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }
      setOverlayDrag(false);
    };
    const onDragLeave = () => setOverlayDrag(false);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragleave", onDragLeave);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragleave", onDragLeave);
    };
  }, [onFiles]);

  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl glass neon-border rounded-3xl p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-white/70 hover:text-white transition">← Back</Link>
          <div className="badge-neon pulse-glow">
            <span className="text-[11px] tracking-[0.22em]" style={{fontFamily: "var(--font-orbitron)"}}>MODE</span>
            <span className="text-[13px] tracking-[0.28em] text-gradient-blue" style={{fontFamily: "var(--font-orbitron)"}}>UPLOAD</span>
            <span className="underline" />
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); onFiles(e.dataTransfer.files); }}
          className={`rounded-2xl border-2 border-dashed p-8 md:p-10 text-center transition ${isDragging ? "border-[var(--accent)] bg-white/5 shadow-[0_0_0_2px_rgba(20,183,255,0.22),0_0_36px_rgba(20,183,255,0.32)]" : "border-white/15"}`}
        >
          <UploadCloud className="mx-auto mb-3 text-white/80 float-soft" />
          <p className="text-white/80">Drag & drop files here</p>
          <p className="text-white/50 text-sm">or</p>
          <button onClick={() => inputRef.current?.click()} className="btn-neon rounded-xl px-5 py-2.5 mt-2">Browse Files</button>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </div>

        {items.length > 0 && (
          <div className="mt-8 space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded-xl border border-white/10 p-4 bg-white/5">
                <div className="min-w-0 mr-4">
                  <p className="truncate font-medium">{it.file.name}</p>
                  <p className="text-xs text-white/60">{(it.file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0, background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }}
                      animate={{ width: `${it.progress}%` }}
                      transition={{ ease: "easeInOut" }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  {it.status === "done" ? (
                    <CheckCircle2 className="text-emerald-400 inline" />
                  ) : (
                    <span className="text-sm text-white/70">{Math.floor(it.progress)}%</span>
                  )}
                </div>
                <button
                  className="ml-3 text-white/60 hover:text-white"
                  onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
                  aria-label="Remove"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="col-span-1 md:col-span-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Lock size={18} className="text-white/70" />
            <input
              type="password"
              placeholder="Optional password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none text-white placeholder:text-white/50 w-full"
            />
          </label>
          <button
            onClick={() => setEncryptClientSide((v) => !v)}
            className={`col-span-1 md:col-span-1 rounded-xl px-4 py-3 inline-flex items-center gap-2 ${encryptClientSide ? "btn-neon" : "border border-white/10 bg-white/5"}`}
            type="button"
          >
            <Shield size={18} />
            {encryptClientSide ? "Client-side encryption ON" : "Encrypt with password (client-side)"}
          </button>
          <div className="col-span-1 md:col-span-1 select-wrapper flex items-center gap-2">
            <Timer size={18} className="text-white/70" />
            <select
              value={expiryMinutes === null ? "never" : String(expiryMinutes)}
              onChange={(e) => {
                const v = e.target.value;
                setExpiryMinutes(v === "never" ? null : parseInt(v, 10));
              }}
              className="select-glass w-full"
              aria-label="Link expiration"
            >
              <option className="bg-black" value="10">10 minutes</option>
              <option className="bg-black" value="60">1 hour</option>
              <option className="bg-black" value="1440">24 hours</option>
              <option className="bg-black" value="10080">7 days</option>
              <option className="bg-black" value="never">Never</option>
            </select>
            <ChevronDown className="chevron" size={18} />
          </div>
          <button
            onClick={startUpload}
            disabled={!hasQueued}
            className={`rounded-xl px-4 py-3 ${hasQueued ? "btn-neon" : "bg-white/10 text-white/50 cursor-not-allowed"}`}
          >
            Start Upload
          </button>
        </div>

        {link && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/80">Your private link:</p>
            <div className="mt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <code className="flex-1 bg-black/40 rounded-xl px-4 py-3 overflow-x-auto">{link}</code>
              <button
                onClick={() => navigator.clipboard.writeText(link)}
                className="btn-neon rounded-xl px-4 py-3"
              >Copy</button>
              <Link href={`/confirm?link=${encodeURIComponent(link)}`} className="rounded-xl px-4 py-3 border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition text-center">Continue</Link>
            </div>
          </motion.div>
        )}
      </div>
    {overlayDrag && (
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="absolute inset-0 bg-[rgba(0,191,255,0.08)]" />
        <div className="absolute inset-10 rounded-3xl border-2 border-dashed border-[var(--accent)]"></div>
      </div>
    )}
    </div>
  );
}


