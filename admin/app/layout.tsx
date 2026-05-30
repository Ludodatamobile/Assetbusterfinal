import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asset Busters Admin",
  description: "Enterprise admin dashboard for Asset Busters.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}