import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premium Streaming Viewer",
  description: "A high-performance streaming viewer for your favorite events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-fixed bg-no-repeat bg-cover" style={{ backgroundImage: "linear-gradient(to bottom right, var(--background), #1a1a1a)" }}>
        {children}
      </body>
    </html>
  );
}
