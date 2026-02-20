import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growth Dashboard",
  description: "Track your startup's weekly growth metrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
