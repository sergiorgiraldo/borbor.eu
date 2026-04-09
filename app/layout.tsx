import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Borbor",
  description: "Plan your trips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-verdana">{children}</body>
    </html>
  );
}
