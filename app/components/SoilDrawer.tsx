import { useGetSoil } from "@/app/api/queries/soils/useGetSoil";

type SoilDrawerProps = {
  soilId: string;
  onClose: () => void;
};

export const SoilDrawer = ({ soilId, onClose }: SoilDrawerProps) => {
  const { data: soil, isLoading, isError } = useGetSoil(soilId);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Gleba
            </p>
            <h3 className="mt-1 text-xl font-semibold text-zinc-900">
              {isLoading ? "Ładowanie..." : (soil?.name ?? "Gleba")}
            </h3>
            {soil?.slug ? (
              <p className="mt-1 text-sm text-zinc-600">Slug: {soil.slug}</p>
            ) : null}
          </div>

          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium"
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>

        <div className="space-y-6 p-5">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Pobieranie danych gleby...</p>
          ) : isError || !soil ? (
            <p className="text-sm text-red-500">
              Nie udało się pobrać danych gleby.
            </p>
          ) : (
            <>
              <section className="space-y-2 text-sm text-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Opis
                </p>
                <p className="whitespace-pre-line">{soil.description || "-"}</p>
              </section>

              <section className="grid gap-3 text-sm">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Typ gleby
                  </p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {soil.soilType}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Struktura
                  </p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {soil.structure}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Retencja wody
                  </p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {soil.waterRetention}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Drenaż
                  </p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {soil.drainage}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    pH
                  </p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {soil.phMin ?? "-"} – {soil.phMax ?? "-"}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Żyzność
                  </p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {soil.fertilityLevel}
                  </p>
                </div>
              </section>

              <section className="space-y-4 text-sm text-zinc-700">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Zalety
                  </p>
                  {soil.advantages?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {soil.advantages.map((x, i) => (
                        <li key={`adv-${i}`}>{x}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-zinc-500">-</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Wady
                  </p>
                  {soil.disadvantages?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {soil.disadvantages.map((x, i) => (
                        <li key={`dis-${i}`}>{x}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-zinc-500">-</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Porady ulepszeń
                  </p>
                  {soil.improvementTips?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {soil.improvementTips.map((x, i) => (
                        <li key={`tip-${i}`}>{x}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-zinc-500">-</p>
                  )}
                </div>
              </section>

              <section className="text-xs text-zinc-500">
                <p>Utworzono: {soil.createdAt}</p>
                <p>Zaktualizowano: {soil.updatedAt}</p>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};
