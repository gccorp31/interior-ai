"use client";

import { ReactNode } from "react";
import AuthNav from "./AuthNav";

type LayoutWrapperProps = {
  children: ReactNode;
};

/**
 * Wrapper de layout commun pour toutes les pages
 * Inclut la navigation et le style de base
 */
export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <AuthNav />
      <main>{children}</main>
    </div>
  );
}


