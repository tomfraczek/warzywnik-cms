"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGetSoil } from "@/app/api/queries/soils/useGetSoil";
import { useDeleteSoil } from "@/app/api/mutations/soils/useDeleteSoil";

export default function SoilDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetSoil(params?.id);
  const deleteMutation = useDeleteSoil();

  const handleDelete = async () => {
    if (!data) return;
    const confirmed = window.confirm("Czy na pewno usunąć glebę?");
    if (!confirmed) return;

    await deleteMutation.mutateAsync({ id: data.id });
    router.push("/soils");
  };

  const notFound =
    error instanceof AxiosError && error.response?.status === 404;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (notFound) {
    return <p className="text-sm text-red-500">Nie znaleziono gleby.</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Gleby
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">{data.name}</h1>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium"
              href={`/soils/${data.id}/edit`}
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
              <span className="font-medium text-zinc-900">Opis:</span>{" "}
              {data.description}
            </p>
          </div>
        </section>
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Parameters</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Soil type:</span>{" "}
              {data.soilType}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Structure:</span>{" "}
              {data.structure}
            </p>
            <p>
              <span className="font-medium text-zinc-900">
                Water retention:
              </span>{" "}
              {data.waterRetention}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Drainage:</span>{" "}
              {data.drainage}
            </p>
            <p>
              <span className="font-medium text-zinc-900">pH:</span>{" "}
              {data.phMin ?? "-"} - {data.phMax ?? "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Fertility:</span>{" "}
              {data.fertilityLevel}
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Advantages</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
          {data.advantages.length ? (
            data.advantages.map((item, index) => (
              <li key={`adv-${index}`}>{item}</li>
            ))
          ) : (
            <li className="text-zinc-500">Brak danych.</li>
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Disadvantages</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
          {data.disadvantages.length ? (
            data.disadvantages.map((item, index) => (
              <li key={`dis-${index}`}>{item}</li>
            ))
          ) : (
            <li className="text-zinc-500">Brak danych.</li>
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Improvement tips
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
          {data.improvementTips.length ? (
            data.improvementTips.map((item, index) => (
              <li key={`tip-${index}`}>{item}</li>
            ))
          ) : (
            <li className="text-zinc-500">Brak danych.</li>
          )}
        </ul>
      </section>
    </section>
  );
}
