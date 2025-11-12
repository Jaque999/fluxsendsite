"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Lock, Download } from "lucide-react";

type LinkMeta = { valid: boolean; files: { name: string; size: number }[]; passwordProtected: boolean; expiry: number | null } | null;

export default function TokenDownloadPage() {
  const { token } = useParams<{ token: string }>();
  const [meta, setMeta] = useState<LinkMeta>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/link/${token}`);
      if (!res.ok) {
        setMeta(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMeta(data);
      setLoading(false);
    }
    load();
  }, [token]);

  async function requestDownload() {
    setError(null);
    const res = await fetch(`/api/link/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error || "Download unavailable");
      return;
    }
    const data = await res.json();
    // For MVP: trigger navigation to the first URL (mock)
    if (Array.isArray(data.fileUrls) && data.fileUrls.length > 0) {
      window.location.href = data.fileUrls[0].url;
    }
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl glass neon-border rounded-3xl p-8 md:p-12">
        {loading ? (
          <p className="text-white/70">Loading…</p>
        ) : !meta ? (
          <p className="text-white/70">Link not found or expired.</p>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">Download files</h1>
              <p className="text-white/60">{meta.files.length} file(s) ready</p>
            </div>

            <ul className="space-y-2">
              {meta.files.map((f, i) => (
                <li key={i} className="flex justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="truncate mr-4">{f.name}</span>
                  <span className="text-white/60 text-sm">{(f.size / 1024).toFixed(1)} KB</span>
                </li>
              ))}
            </ul>

            {meta.passwordProtected && (
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <Lock size={18} className="text-white/70" />
                <input
                  type="password"
                  placeholder="Password required"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none text-white placeholder:text-white/50 w-full"
                />
              </label>
            )}

            {error && <p className="text-rose-400">{error}</p>}

            <button onClick={requestDownload} className="btn-neon rounded-xl px-6 py-3 inline-flex items-center gap-2">
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


