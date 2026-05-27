import type { Metadata } from "next";
import "./globals.css";
import { getBrandConfig } from "@/lib/brand";

const brand = getBrandConfig();

export const metadata: Metadata = {
  title: `${brand.name} · ERP`,
  description: brand.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
