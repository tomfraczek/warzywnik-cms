"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGetDisease } from "@/app/api/queries/diseases/useGetDisease";
import { useDeleteDisease } from "@/app/api/mutations/diseases/useDeleteDisease";

export default function DiseaseDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetDisease(params?.id);
  const deleteMutation = useDeleteDisease();

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
        <p className="text-base text-zinc-600">Slug: {data.slug}</p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 space-y-2 text-sm text-zinc-600">
        <p>
          <span className="font-medium text-zinc-900">Opis:</span>{" "}
          {data.description}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Objawy:</span>{" "}
          {data.symptoms || "-"}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Zapobieganie:</span>{" "}
          {data.prevention || "-"}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Leczenie:</span>{" "}
          {data.treatment || "-"}
        </p>
      </section>
    </section>
  );
}
