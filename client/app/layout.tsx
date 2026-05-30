import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",      
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",  
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

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
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable} ${playfair.variable}`}
    >
      <body id="root">
        <Navbar />
        {children}
        <ChatWidget />
        <Footer />
      </body>
    </html>
  );
}