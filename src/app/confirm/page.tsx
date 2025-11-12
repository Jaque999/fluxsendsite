"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Copy, Timer } from "lucide-react";
import * as QRCode from "qrcode";

function ConfirmInner() {
  const params = useSearchParams();
  const link = params.get("link");
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function gen() {
      if (!link) return;
      try {
        const url = await QRCode.toDataURL(link, { margin: 1, color: { dark: "#ffffff", light: "#00000000" } });
        if (mounted) setQr(url);
      } catch {
        // ignore
      }
    }
    gen();
    return () => { mounted = false; };
  }, [link]);

  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl glass neon-border rounded-3xl p-8 md:p-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="mx-auto mb-6 h-16 w-16 rounded-full bg-emerald-400/20 flex items-center justify-center"
        >
          <CheckCircle2 className="text-emerald-400" size={34} />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-semibold">Your files are ready</h2>
        <p className="mt-2 text-white/70">Share the private link below.</p>

        {link && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <code className="flex-1 bg-black/40 rounded-xl px-4 py-3 overflow-x-auto">{link}</code>
            <button
              onClick={() => navigator.clipboard.writeText(link)}
              className="btn-neon rounded-xl px-4 py-3 inline-flex items-center justify-center gap-2"
            >
              <Copy size={16} /> Copy
            </button>
          </div>
        )}

        {qr && (
          <div className="mt-6 flex justify-center">
            <img src={qr} alt="Share link QR" className="h-36 w-36" />
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-white/70">
          <Timer size={16} />
          <span>Expiration depends on your selected setting.</span>
        </div>

        <div className="mt-8">
          <Link href="/upload" className="rounded-xl px-5 py-3 border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition">Upload more</Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full flex items-center justify-center">Loading…</div>}>
      <ConfirmInner />
    </Suspense>
  );
}


