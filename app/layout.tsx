import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Merriweather, Public_Sans } from "next/font/google";
import "./globals.css";
import RacingBackground from "./components/RacingBackground";
import { cn } from "@/lib/utils";

const publicSansHeading = Public_Sans({subsets:['latin'],variable:'--font-heading'});

const merriweather = Merriweather({subsets:['latin'],variable:'--font-serif'});

const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PitStop",
  description: "차량 유지비 계산, 소모품 교환시기, 정비소 검색을 한 번에",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, spaceGrotesk.variable, "font-serif", merriweather.variable, publicSansHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <RacingBackground />
        {children}
      </body>
    </html>
  );
}
