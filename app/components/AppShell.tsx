"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import SolanaWalletProvider from "./SolanaWalletProvider";
import { ToastProvider } from "./ToastProvider";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { GL } from "./gl";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <>
      <GL hovering={false} />
      <SolanaWalletProvider>
        <ToastProvider>
          <Navbar />
          <div className="page-wrapper">{children}</div>
          {!isLanding && <Footer />}
        </ToastProvider>
      </SolanaWalletProvider>
    </>
  );
}
