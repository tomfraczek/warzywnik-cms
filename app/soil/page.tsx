export default function SoilPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Gleba
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Stan gleby</h1>
        <p className="text-base text-zinc-600">
          Podgląd parametrów gleby, nawożenia i nawadniania.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        Tutaj pojawią się metryki jakości gleby oraz historia pomiarów.
      </div>
    </section>
  );
}
