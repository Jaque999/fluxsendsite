import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ParticleBackground } from "@/components/ParticleBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FluxSend — Send files. Fast. Private. Beautiful.",
  description: "A sleek, futuristic, encrypted file-sharing platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${orbitron.variable} antialiased bg-[var(--background)] text-[var(--text)]`}>
        <ParticleBackground />
        {children}
      </body>
    </html>
  );
}
