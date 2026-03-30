import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tolerance Stackup Analysis",
  description: "Engineering-focused 1D tolerance stackup calculator"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
