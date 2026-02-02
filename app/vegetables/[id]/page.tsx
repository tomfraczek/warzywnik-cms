"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGetVegetable } from "@/app/api/queries/vegetables/useGetVegetable";
import { useDeleteVegetable } from "@/app/api/mutations/vegetables/useDeleteVegetable";
import { useMemo, useState } from "react";
import { useGetSoils } from "@/app/api/queries/soils/useGetSoils";
import {
  demandLevelLabels,
  monthLabels,
  sowingMethodLabels,
  sunExposureLabels,
} from "../../utils/labels";

export default function VegetableDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetVegetable(params?.id);
  const deleteMutation = useDeleteVegetable();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const listParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const { data: soilsData, isLoading: soilsLoading } = useGetSoils(listParams);

  const soilNameById = useMemo(() => {
    return new Map(
      (soilsData?.items ?? []).map((soil) => [soil.id, soil.name]),
    );
  }, [soilsData]);

  console.log("soilsData", soilsData);

  const recommendedSoilNames = useMemo(() => {
    const ids = data?.recommendedSoilIds ?? [];
    return ids
      .map((id) => soilNameById.get(id))
      .filter((name): name is string => Boolean(name));
  }, [data?.recommendedSoilIds, soilNameById]);

  const recommendedSoilsLabel = soilsLoading
    ? "Ładowanie..."
    : recommendedSoilNames.length
      ? recommendedSoilNames.join(", ")
      : "-";

  const handleDelete = async () => {
    if (!data) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!data) return;
    await deleteMutation.mutateAsync({ id: data.id });
    setShowDeleteModal(false);
    router.push("/vegetables");
  };

  const cancelDelete = () => setShowDeleteModal(false);

  const notFound =
    error instanceof AxiosError && error.response?.status === 404;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (notFound) {
    return <p className="text-sm text-red-500">Nie znaleziono warzywa.</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Potwierdź usunięcie</h2>
            <p className="mb-6">Czy na pewno usunąć warzywo?</p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded bg-zinc-200 px-4 py-2 text-zinc-700"
                onClick={cancelDelete}
              >
                Anuluj
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-white"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Warzywa
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold text-zinc-900">
              {data.name}
            </h1>
            <div className="flex items-center gap-3">
              <Link
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium"
                href={`/vegetables/${data.id}/edit`}
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

        {/* PODSTAWY - pełna szerokość */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Podstawy</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="space-y-3">
              {data.imageUrl ? (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                  <Image
                    src={data.imageUrl}
                    alt={data.name || "Zdjęcie warzywa"}
                    height={160}
                    width={240}
                    style={{
                      height: 160,
                      width: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                    className="rounded-md"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
                  Brak zdjęcia
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm text-zinc-600">
              <p>
                <span className="font-medium text-zinc-900">
                  Nazwa łacińska:
                </span>{" "}
                {data.latinName || "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Opis:</span>{" "}
                {data.description}
              </p>
            </div>
          </div>
        </section>

        {/* WYMAGANIA - pełna szerokość + szczegóły gleby w stylu sekcji */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Wymagania</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Nasłonecznienie
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.sunExposure ? sunExposureLabels[data.sunExposure] : "-"}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Woda
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.waterDemand ? demandLevelLabels[data.waterDemand] : "-"}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Składniki
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.nutrientDemand
                  ? demandLevelLabels[data.nutrientDemand]
                  : "-"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Rekomendowane gleby
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {recommendedSoilsLabel}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Min. głębokość gleby
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.minSoilDepthCm !== null &&
                data.minSoilDepthCm !== undefined
                  ? `${data.minSoilDepthCm} cm`
                  : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Dominujący składnik
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.dominantNutrientDemand || "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Metody siewu</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-600">
            {data.sowingMethods?.length ? (
              data.sowingMethods.map((method, index) => (
                <div
                  key={`method-${index}`}
                  className="rounded-lg border border-zinc-200 p-3"
                >
                  <p>
                    <span className="font-medium text-zinc-900">Metoda:</span>{" "}
                    {method.method ? sowingMethodLabels[method.method] : "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Okno:</span>{" "}
                    {method.startMonth ? monthLabels[method.startMonth] : "-"} -{" "}
                    {method.endMonth ? monthLabels[method.endMonth] : "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Pod osłonami:
                    </span>{" "}
                    {method.underCover ? "Tak" : "Nie"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Brak danych.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Zbiory</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Okno zbioru:</span>{" "}
              {data.harvestStartMonth
                ? monthLabels[data.harvestStartMonth]
                : "-"}{" "}
              - {data.harvestEndMonth ? monthLabels[data.harvestEndMonth] : "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Oznaki:</span>{" "}
              {data.harvestSigns || "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Czas zbioru:</span>{" "}
              {data.timeToHarvestDaysMin ?? "-"} -{" "}
              {data.timeToHarvestDaysMax ?? "-"} dni
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Etapy nawożenia
          </h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-600">
            {data.fertilizationStages?.length ? (
              data.fertilizationStages.map((stage, index) => (
                <div
                  key={`stage-${index}`}
                  className="rounded-lg border border-zinc-200 p-3"
                >
                  <p className="font-medium text-zinc-900">{stage.name}</p>
                  <p className="text-xs text-zinc-500">{stage.timing || "-"}</p>
                  <p>{stage.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Brak danych.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Relacje</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="font-medium text-zinc-900">Szkodniki</p>
              <div className="mt-2 space-y-1 text-zinc-600">
                {data.commonPests.length ? (
                  data.commonPests.map((pest) => (
                    <Link
                      key={pest.id}
                      href={`/pests/${pest.id}`}
                      className="block hover:text-zinc-900"
                    >
                      {pest.name}
                    </Link>
                  ))
                ) : (
                  <p className="text-zinc-500">Brak.</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Choroby</p>
              <div className="mt-2 space-y-1 text-zinc-600">
                {data.commonDiseases.length ? (
                  data.commonDiseases.map((disease) => (
                    <Link
                      key={disease.id}
                      href={`/diseases/${disease.id}`}
                      className="block hover:text-zinc-900"
                    >
                      {disease.name}
                    </Link>
                  ))
                ) : (
                  <p className="text-zinc-500">Brak.</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Dobre sąsiedztwo</p>
              <div className="mt-2 space-y-1 text-zinc-600">
                {data.goodCompanions.length ? (
                  data.goodCompanions.map((companion) => (
                    <Link
                      key={companion.id}
                      href={`/vegetables/${companion.id}`}
                      className="block hover:text-zinc-900"
                    >
                      {companion.name}
                    </Link>
                  ))
                ) : (
                  <p className="text-zinc-500">Brak.</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Złe sąsiedztwo</p>
              <div className="mt-2 space-y-1 text-zinc-600">
                {data.badCompanions.length ? (
                  data.badCompanions.map((companion) => (
                    <Link
                      key={companion.id}
                      href={`/vegetables/${companion.id}`}
                      className="block hover:text-zinc-900"
                    >
                      {companion.name}
                    </Link>
                  ))
                ) : (
                  <p className="text-zinc-500">Brak.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
