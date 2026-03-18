"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGetWarningRule } from "@/app/api/queries/warning-rules/useGetWarningRule";
import { useDeleteWarningRule } from "@/app/api/mutations/warning-rules/useDeleteWarningRule";

const severityLabels = {
  INFO: "Informacja",
  WARNING: "Ostrzeżenie",
  CRITICAL: "Krytyczny",
} as const;

const horizonLabels: Record<string, string> = {
  RADAR: "Radar",
  OPERATIONAL: "Operacyjne",
};

const dayPartLabels: Record<string, string> = {
  ANY: "Dowolna pora",
  DAY: "Dzień",
  NIGHT: "Noc",
};

const codeLabels: Record<string, string> = {
  SOIL_NOT_RECOMMENDED: "Gleba niezalecana",
  PH_OUT_OF_RANGE: "pH poza zakresem",
  DEPTH_TOO_SMALL: "Zbyt mała głębokość",
  NPK_TOO_LOW: "Za niski poziom NPK",
  ROTATION_RISK: "Ryzyko płodozmianu",
  WATER_RETENTION_MISMATCH: "Niedopasowana retencja wody",
  DRAINAGE_MISMATCH: "Niedopasowany drenaż",
  FAMILY_REPETITION: "Powtórzenie rodziny botanicznej",
  HARVEST_WINDOW_MISSED: "Przegapione okno zbioru",
  SUBOPTIMAL_SOWING_TIME: "Niekorzystny termin siewu",
  EXPERIMENTAL_SETUP: "Konfiguracja eksperymentalna",
};

export default function WarningRuleDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetWarningRule(params?.id);
  const deleteMutation = useDeleteWarningRule();

  const handleDelete = async () => {
    if (!data) return;
    const confirmed = window.confirm("Czy na pewno usunąć regułę?");
    if (!confirmed) return;

    await deleteMutation.mutateAsync({ id: data.id });
    router.push("/warning-rules");
  };

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (error instanceof AxiosError && error.response?.status === 404) {
    return <p className="text-sm text-red-500">Nie znaleziono reguły.</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warning rules
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">{data.title}</h1>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium"
              href={`/warning-rules/${data.id}/edit`}
            >
              Edytuj
            </Link>
            <button
              type="button"
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
              onClick={handleDelete}
            >
              Usuń
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Parametry</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Kod
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {codeLabels[data.code] ?? data.code}
              </p>
              <p className="text-xs text-zinc-500">{data.code}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Severity
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {severityLabels[data.severity]}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Horyzont
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {horizonLabels[data.horizon ?? "RADAR"] ?? data.horizon ?? "-"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Pora dnia
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {dayPartLabels[data.dayPart ?? "ANY"] ?? data.dayPart ?? "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Flagi i ograniczenia
          </h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Kategoria
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {data.category ?? "-"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Generuje task
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {data.generatesTask ? "Tak" : "Nie"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Włączona
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {data.enabled ? "Tak" : "Nie"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Blocking
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {data.blocking ? "Tak" : "Nie"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Cooldown
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {data.cooldownDays ?? "-"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Szablony komunikatu
        </h2>
        <div className="mt-4 space-y-4 text-sm text-zinc-700">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Message
            </p>
            <p className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              {data.messageTemplate}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Hint
            </p>
            <p className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              {data.hintTemplate || "-"}
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
