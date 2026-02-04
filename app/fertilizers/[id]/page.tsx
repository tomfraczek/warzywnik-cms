"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGetFertilizer } from "@/app/api/queries/fertilizers/useGetFertilizer";
import { useDeleteFertilizer } from "@/app/api/mutations/fertilizers/useDeleteFertilizer";
import {
  fertilizerApplicationMethodLabels,
  fertilizerCategoryLabels,
  fertilizerEffectLevelLabels,
  fertilizerFormLabels,
  fertilizerPhEffectLabels,
  fertilizerRecommendedFrequencyLabels,
  fertilizerRetentionEffectLabels,
  fertilizerRiskLevelLabels,
  fertilizerSoilStructureEffectLabels,
  labelOrDash,
} from "@/app/utils/labels";

export default function FertilizerDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetFertilizer(params?.id);
  const deleteMutation = useDeleteFertilizer();

  const handleDelete = async () => {
    if (!data) return;
    const confirmed = window.confirm("Czy na pewno usunąć nawóz?");
    if (!confirmed) return;

    await deleteMutation.mutateAsync({ id: data.id });
    router.push("/fertilizers");
  };

  const notFound =
    error instanceof AxiosError && error.response?.status === 404;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (notFound) {
    return <p className="text-sm text-red-500">Nie znaleziono nawozu.</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Nawozy
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">{data.name}</h1>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium"
              href={`/fertilizers/${data.id}/edit`}
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

        <p className="text-base text-zinc-600">Slug: {data.slug}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Podstawy</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Opis:</span>{" "}
              {data.description || "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Kategoria:</span>{" "}
              {labelOrDash(data.category, fertilizerCategoryLabels)}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Forma:</span>{" "}
              {labelOrDash(data.form, fertilizerFormLabels)}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Metoda:</span>{" "}
              {labelOrDash(
                data.applicationMethod,
                fertilizerApplicationMethodLabels,
              )}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Ryzyko:</span>{" "}
              {labelOrDash(data.riskLevel, fertilizerRiskLevelLabels)}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Status:</span>{" "}
              {data.isActive ? "Aktywny" : "Nieaktywny"}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Efekty odżywcze
          </h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Azot:</span>{" "}
              {labelOrDash(data.nitrogenEffect, fertilizerEffectLevelLabels)}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Fosfor:</span>{" "}
              {labelOrDash(data.phosphorusEffect, fertilizerEffectLevelLabels)}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Potas:</span>{" "}
              {labelOrDash(data.potassiumEffect, fertilizerEffectLevelLabels)}
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Wpływ na glebę
          </h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">pH:</span>{" "}
              {labelOrDash(data.phEffect, fertilizerPhEffectLabels)}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Struktura:</span>{" "}
              {labelOrDash(
                data.soilStructureEffect,
                fertilizerSoilStructureEffectLabels,
              )}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Retencja:</span>{" "}
              {labelOrDash(
                data.waterRetentionEffect,
                fertilizerRetentionEffectLabels,
              )}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Drenaż:</span>{" "}
              {labelOrDash(
                data.drainageEffect,
                fertilizerRetentionEffectLabels,
              )}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Zalecenia</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Częstotliwość:</span>{" "}
              {labelOrDash(
                data.recommendedFrequency,
                fertilizerRecommendedFrequencyLabels,
              )}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Dawkowanie:</span>{" "}
              {data.dosageGuidance || "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Uwagi:</span>{" "}
              {data.notes || "-"}
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
