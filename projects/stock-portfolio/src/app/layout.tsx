import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JY Stock",
  description: "개인화된 주식 투자 기록 및 AI 기반 포트폴리오 시각화 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="antialiased">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen selection:bg-blue-200 dark:selection:bg-blue-900`}>
        {children}
      </body>
    </html>
  );
}
