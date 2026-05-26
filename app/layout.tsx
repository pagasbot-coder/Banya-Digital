import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
