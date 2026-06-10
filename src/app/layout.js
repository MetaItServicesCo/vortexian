import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Vortexian Tech | IT Solutions & Services",
  description: "Innovative IT solutions, recruitment, and digital marketing services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900" suppressHydrationWarning={true}>
        {/* Navbar aur Footer yahan se remove kar diye hain */}
        {children}
      </body>
    </html>
  );
}