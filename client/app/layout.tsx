import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

export const metadata: Metadata = {
  title: "Asset Busters",
  description: "Connect businesses with investors and unlock growth opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body id="root">
        <Navbar />
        {children}
        <ChatWidget />
        <Footer />
      </body>
    </html>
  );
}
