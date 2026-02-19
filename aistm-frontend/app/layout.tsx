import type { Metadata } from "next";
import "./globals.css";

import Header from "../components/Header";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AistM|業務管理ツール",
  description: "業務管理を効率化するためのツールです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">

      <body className="antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function () {
              try {
                var key = 'theme';
                var saved = localStorage.getItem(key);
                var mode = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var shouldDark = mode === 'dark' || (mode === 'system' && prefersDark);
                var root = document.documentElement;
                root.classList.remove('dark');
                if (shouldDark) root.classList.add('dark');
              } catch (e) {}
            })();
          `,
          }}
        />
        <Header />
        {children}
      </body>
    </html>
  );
}
