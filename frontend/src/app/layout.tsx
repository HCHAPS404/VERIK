import "@/app/globals.css";
import "@/core/design-system/tokens.css";

import type { Metadata } from "next";

import { InstitutionalLayout } from "@/shared/layouts/InstitutionalLayout";

export const metadata: Metadata = {
  title: "VERIK Frontend",
  description: "Dashboard gubernamental para verificación documental RAG"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <InstitutionalLayout>{children}</InstitutionalLayout>
      </body>
    </html>
  );
}
