"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { AxiosError } from "axios";
import { useGetDisease } from "@/app/api/queries/diseases/useGetDisease";
import { useDeleteDisease } from "@/app/api/mutations/diseases/useDeleteDisease";
import { useGetActionTemplatesByIds } from "@/app/api/queries/action-templates/useGetActionTemplatesByIds";

export default function DiseaseDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetDisease(params?.id);
  const deleteMutation = useDeleteDisease();
  console.log("data", data);
  const recommendedActionIds = useMemo(() => {
    const fromRefs = (data?.recommendedActions ?? []).map((item) => item.id);
    const fromIds = data?.recommendedActionTemplateIds ?? [];
    return Array.from(new Set([...fromRefs, ...fromIds]));
  }, [data?.recommendedActions, data?.recommendedActionTemplateIds]);

  const { data: recommendedActionDetails } =
    useGetActionTemplatesByIds(recommendedActionIds);

  const recommendedActionLabels = useMemo(() => {
    const detailsMap = new Map(
      (recommendedActionDetails ?? []).map((item) => [
        item.id,
        `${item.name} (${item.type})`,
      ]),
    );

    return recommendedActionIds.map((id) => {
      const fallback = data?.recommendedActions?.find((item) => item.id === id);
      return (
        detailsMap.get(id) ??
        `${fallback?.name ?? id} (${fallback?.type ?? "-"})`
      );
    });
  }, [
    data?.recommendedActions,
    recommendedActionDetails,
    recommendedActionIds,
  ]);

  const handleDelete = async () => {
    if (!data) return;
    const confirmed = window.confirm("Czy na pewno usunąć chorobę?");
    if (!confirmed) return;

    await deleteMutation.mutateAsync({ id: data.id });
    router.push("/diseases");
  };

  const notFound =
    error instanceof AxiosError && error.response?.status === 404;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (notFound) {
    return <p className="text-sm text-red-500">Nie znaleziono choroby.</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Choroby
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">{data.name}</h1>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium"
              href={`/diseases/${data.id}/edit`}
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
          <h2 className="text-lg font-semibold text-zinc-900">Opis choroby</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>{data.description}</p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Szybki podgląd
          </h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Objawy
              </p>
              <p className="mt-1 text-zinc-700">{data.symptoms || "-"}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Zapobieganie
              </p>
              <p className="mt-1 text-zinc-700">{data.prevention || "-"}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Leczenie
              </p>
              <p className="mt-1 text-zinc-700">{data.treatment || "-"}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Rekomendowane zabiegi
        </h2>
        <div className="mt-4">
          {recommendedActionLabels.length ? (
            <div className="flex flex-wrap gap-2">
              {recommendedActionLabels.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Brak rekomendowanych zabiegów.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
