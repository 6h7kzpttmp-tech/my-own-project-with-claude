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
  title: "내 차 유지비 계산기",
  description: "차종·연비·주행거리를 입력하면 월간/연간 유지비를 계산해드립니다",
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
