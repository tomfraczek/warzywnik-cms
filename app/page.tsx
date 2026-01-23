export default function Home() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Przegląd warzywnika
        </h1>
        <p className="text-base text-zinc-600">
          Szybki podgląd najważniejszych danych z upraw i stanu gleby.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Aktywne grządki</p>
          <p className="mt-2 text-2xl font-semibold">12</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Warzywa w sezonie</p>
          <p className="mt-2 text-2xl font-semibold">8</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Wilgotność gleby</p>
          <p className="mt-2 text-2xl font-semibold">38%</p>
        </div>
      </div>
    </section>
  );
}
