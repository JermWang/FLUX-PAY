import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import type { ReactNode } from "react";
import AppShell from "./components/AppShell";

export const metadata = {
  title: "FLUX",
  description: "Untraceable transfers powered by zero-knowledge routing",
  icons: {
    icon: [{ url: "/branding/PFP.png", type: "image/png" }],
  },
  openGraph: {
    title: "FLUX",
    description: "Untraceable transfers powered by zero-knowledge routing",
    type: "website",
    images: [
      {
        url: "/branding/uwu-swap-banner.png",
        width: 1200,
        height: 630,
        alt: "FLUX - Untraceable transfers powered by zero-knowledge routing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FLUX",
    description: "Untraceable transfers powered by zero-knowledge routing",
    images: ["/branding/uwu-swap-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body data-skin="uwu">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
