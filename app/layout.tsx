import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

// Fuentes personalizadas
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata global
export const metadata: Metadata = {
  title: "The Sower",
  description: "Refleja tu estilo y Fe con los productos de nuestro catalogo",
};

// Layout principal
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen bg-white text-foreground`}
      >
        <ClerkProvider>
          <Navbar />
          <main className="flex-grow flex flex-col justify-between">
            {children}
          </main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
