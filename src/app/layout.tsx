import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Nexus — desenvolvimento de software", template: "%s · Nexus" },
  description:
    "Sites, sistemas, aplicativos e automações sob medida. Do briefing à entrega, com acompanhamento em tempo real.",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Nexus" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d13",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Public+Sans:ital,wght@0,300..700;1,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
