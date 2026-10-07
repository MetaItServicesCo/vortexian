import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL, mediaUrl } from "@/lib/api";
import { getSection } from "@/lib/content";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata() {
  const settings = await getSection("settings");
  const ogImage = mediaUrl(settings.og_image);

  return {
    metadataBase: new URL(SITE_URL),
    title: settings.meta_title,
    description: settings.meta_description,
    openGraph: {
      siteName: settings.site_name,
      title: settings.meta_title,
      description: settings.meta_description,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
