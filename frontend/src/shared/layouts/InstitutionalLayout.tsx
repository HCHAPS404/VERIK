import { Footer } from "@/shared/components/Footer";
import { Header } from "@/shared/components/Header";
import { Sidebar } from "@/shared/components/Sidebar";
import { SkipLink } from "@/shared/components/SkipLink";

type InstitutionalLayoutProps = {
  children: React.ReactNode;
};

export function InstitutionalLayout({ children }: InstitutionalLayoutProps) {
  return (
    <>
      <SkipLink />
      <Header />
      <div className="mx-auto flex w-full max-w-7xl bg-gov-muted">
        <Sidebar />
        <main id="main-content" className="min-h-[calc(100vh-104px)] flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
