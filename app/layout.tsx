import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaperTime - ML Paper Recommendations",
  description: "Discover and explore machine learning papers with intelligent recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

