import type { Metadata } from "next";
import { Cardo, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const cardo = Cardo({
  weight: ["400", "700"],
  variable: "--font-cardo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Дегтярные Бани · ERP",
  description:
    "ERP/CRM для премиального банного комплекса — загрузка залов, финансы, операции",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${cardo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
