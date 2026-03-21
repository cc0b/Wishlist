import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wishlist — Social Gift Coordination",
  description:
    "Create wishlists, share with friends, and coordinate gifts together. No more guessing, no more duplicate presents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
