import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fans Futbol",
  description: "Un reproductor de streaming de alto rendimiento para tus eventos favoritos.",
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
