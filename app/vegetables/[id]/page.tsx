"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGetVegetable } from "@/app/api/queries/vegetables/useGetVegetable";
import { useDeleteVegetable } from "@/app/api/mutations/vegetables/useDeleteVegetable";
import { useState } from "react";

export default function VegetableDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetVegetable(params?.id);
  const deleteMutation = useDeleteVegetable();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Potwierdź usunięcie</h2>
            <p className="mb-6">Czy na pewno usunąć warzywo?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-zinc-200 text-zinc-700"
                onClick={cancelDelete}
              >
                Anuluj
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white"
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

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Podstawy</h2>
            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p>
                <span className="font-medium text-zinc-900">
                  Nazwa łacińska:
                </span>{" "}
                {data.latinName || "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">URL zdjęcia:</span>{" "}
                {data.imageUrl || "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Opis:</span>{" "}
                {data.description}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Wymagania</h2>
            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p>
                <span className="font-medium text-zinc-900">
                  Nasłonecznienie:
                </span>{" "}
                {data.sunExposure || "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">
                  Zapotrzebowanie na wodę:
                </span>{" "}
                {data.waterDemand || "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Typ gleby:</span>{" "}
                {data.soilType || "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">pH gleby:</span>{" "}
                {data.soilPHMin ?? "-"} - {data.soilPHMax ?? "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">
                  Zapotrzebowanie na składniki:
                </span>{" "}
                {data.nutrientDemand || "-"}
              </p>
            </div>
          </section>
        </div>

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
                    {method.method}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Okno:</span>{" "}
                    {method.startMonth} - {method.endMonth}
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
              {data.harvestStartMonth || "-"} - {data.harvestEndMonth || "-"}
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
