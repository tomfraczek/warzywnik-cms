"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { getVegetableIdBySlug } from "@/app/api/api.requests";
import { useGetVegetable } from "@/app/api/queries/vegetables/useGetVegetable";
import { useDeleteVegetable } from "@/app/api/mutations/vegetables/useDeleteVegetable";

export default function VegetableDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const {
    data: vegetableId,
    isLoading: isIdLoading,
    error: idError,
  } = useQuery({
    queryKey: ["vegetable-id", params.slug],
    queryFn: () => getVegetableIdBySlug(params.slug),
  });
  const { data, isLoading, error } = useGetVegetable(vegetableId);
  const deleteMutation = useDeleteVegetable();

  const handleDelete = async () => {
    if (!data) return;
    const confirmed = window.confirm("Czy na pewno usunąć warzywo?");
    if (!confirmed) return;

    await deleteMutation.mutateAsync({ id: data.id });
    router.push("/vegetables");
  };

  const notFound =
    (idError instanceof Error && idError.message === "NOT_FOUND") ||
    (error instanceof AxiosError && error.response?.status === 404);

  if (isIdLoading || isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (notFound) {
    return <p className="text-sm text-red-500">Nie znaleziono warzywa.</p>;
  }

  if (idError || error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warzywa
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">{data.name}</h1>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium"
              href={`/vegetables/${data.slug}/edit`}
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
          <h2 className="text-lg font-semibold text-zinc-900">Basic</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Nazwa łacińska:</span>{" "}
              {data.latinName || "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Image URL:</span>{" "}
              {data.imageUrl || "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Opis:</span>{" "}
              {data.description}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Requirements</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Sun exposure:</span>{" "}
              {data.sunExposure || "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Water demand:</span>{" "}
              {data.waterDemand || "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Soil type:</span>{" "}
              {data.soilType || "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Soil pH:</span>{" "}
              {data.soilPHMin ?? "-"} - {data.soilPHMax ?? "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">
                Nutrient demand:
              </span>{" "}
              {data.nutrientDemand || "-"}
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Sowing methods</h2>
        <div className="mt-4 space-y-3 text-sm text-zinc-600">
          {data.sowingMethods?.length ? (
            data.sowingMethods.map((method, index) => (
              <div
                key={`method-${index}`}
                className="rounded-lg border border-zinc-200 p-3"
              >
                <p>
                  <span className="font-medium text-zinc-900">Method:</span>{" "}
                  {method.method}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">Window:</span>{" "}
                  {method.startMonth} - {method.endMonth}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">
                    Under cover:
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
        <h2 className="text-lg font-semibold text-zinc-900">Harvest</h2>
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
          Fertilization stages
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
        <h2 className="text-lg font-semibold text-zinc-900">Relations</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <p className="font-medium text-zinc-900">Pests</p>
            <div className="mt-2 space-y-1 text-zinc-600">
              {data.commonPests.length ? (
                data.commonPests.map((pest) => (
                  <Link
                    key={pest.id}
                    href={`/pests/${pest.slug}`}
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
            <p className="font-medium text-zinc-900">Diseases</p>
            <div className="mt-2 space-y-1 text-zinc-600">
              {data.commonDiseases.length ? (
                data.commonDiseases.map((disease) => (
                  <Link
                    key={disease.id}
                    href={`/diseases/${disease.slug}`}
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
            <p className="font-medium text-zinc-900">Good companions</p>
            <div className="mt-2 space-y-1 text-zinc-600">
              {data.goodCompanions.length ? (
                data.goodCompanions.map((companion) => (
                  <Link
                    key={companion.id}
                    href={`/vegetables/${companion.slug}`}
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
            <p className="font-medium text-zinc-900">Bad companions</p>
            <div className="mt-2 space-y-1 text-zinc-600">
              {data.badCompanions.length ? (
                data.badCompanions.map((companion) => (
                  <Link
                    key={companion.id}
                    href={`/vegetables/${companion.slug}`}
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
  );
}
