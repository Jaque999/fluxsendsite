import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, EyeOff } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-4 md:px-6 py-12 md:py-16">
      <main className="w-full max-w-6xl">
        <section className="relative overflow-hidden glass neon-border rounded-3xl p-8 md:p-16">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)"}} />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{background: "radial-gradient(circle, var(--accent-2) 0%, transparent 70%)"}} />
          <div className="relative flex flex-col items-center text-center gap-6">
            <span className="text-sm tracking-[0.4em] text-[var(--text-dim)]" style={{fontFamily: "var(--font-orbitron)"}}>FLUXSEND</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight bg-clip-text text-transparent float-soft" style={{backgroundImage: "linear-gradient(180deg, #fff, rgba(215,235,255,0.75))"}}>
              Send files. Fast. Private. Beautiful.
            </h1>
            <p className="max-w-3xl text-base md:text-xl text-[var(--text-dim)]">
              A next-gen file transfer with private links, optional passwords, and flexible expiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link href="/upload" className="btn-neon rounded-xl px-7 py-4 inline-flex items-center justify-center gap-2 text-lg">
                <span>Upload Files</span>
                <ArrowRight size={20} />
              </Link>
              <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="rounded-xl px-7 py-4 inline-flex items-center justify-center border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition text-lg">
                Learn More
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-center gap-3 justify-center">
                <Zap size={18} className="text-[var(--accent)]" />
                <span className="text-white/80">Fast uploads</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-center gap-3 justify-center">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-white/80">Private links</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-center gap-3 justify-center">
                <EyeOff size={18} className="text-[var(--accent-2)]" />
                <span className="text-white/80">Password optional</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
