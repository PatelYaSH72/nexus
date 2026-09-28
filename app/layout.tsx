import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus — Enterprise RAG Platform",
  description:
    "Retrieval-Augmented Generation built for enterprise teams. Accurate, cited answers from your own knowledge base — with RBAC, hybrid search, and audit logs.",
  keywords: [
    "RAG",
    "enterprise AI",
    "retrieval augmented generation",
    "knowledge base",
    "RBAC",
  ],
  openGraph: {
    title: "Nexus — Enterprise RAG Platform",
    description:
      "Accurate, cited answers from your company's knowledge base. Built for enterprise teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0A0E15] text-white antialiased">{children}</body>
    </html>
  );
}
