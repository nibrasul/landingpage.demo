import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TapFolio — Zero Gravity Profile",
  description: "Experience the premium physical NFC card suspended in anti-gravity while exploring its invisible technology and customization.",
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
