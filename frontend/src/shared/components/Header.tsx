export function Header() {
  return (
    <header className="border-b border-gov-border bg-gov-primary px-6 py-4 text-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Entidad Gubernamental</p>
          <h1 className="text-lg font-semibold">VERIK - Verificación Documental</h1>
        </div>
        <div className="rounded-md bg-white/10 px-3 py-1 text-xs">Entorno: Hackathon</div>
      </div>
    </header>
  );
}
