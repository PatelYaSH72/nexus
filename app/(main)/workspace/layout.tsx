import Footer from "@/components/Footer";
import Navbar from "@/components/workspace/Navbar";
import type { Metadata } from "next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className="bg-[#0A0E15] text-white antialiased">
      <Navbar />

      {children}

      
    </body>

  );
}
