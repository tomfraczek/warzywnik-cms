export default function VegetablesPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warzywa
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Lista warzyw</h1>
        <p className="text-base text-zinc-600">
          Podgląd aktualnych upraw, odmian i planów zbiorów.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        Tutaj pojawi się tabela warzyw oraz szczegóły sezonu.
      </div>
    </section>
  );
}
