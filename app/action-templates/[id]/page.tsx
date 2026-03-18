"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useGetActionTemplate } from "@/app/api/queries/action-templates/useGetActionTemplate";
import { useDeleteActionTemplate } from "@/app/api/mutations/action-templates/useDeleteActionTemplate";
import {
  normalizeActionTemplateEnvironment,
  normalizeActionTemplateTarget,
} from "@/app/api/api.types";
import {
  actionTemplateEnvironmentLabels,
  actionTemplateTargetLabels,
  actionTemplateTypeLabels,
} from "@/app/utils/labels";

export default function ActionTemplateDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetActionTemplate(params?.id);
  const deleteMutation = useDeleteActionTemplate();

  const handleDelete = async () => {
    if (!data) return;
    const confirmed = window.confirm("Czy na pewno usunąć szablon zabiegu?");
    if (!confirmed) return;

    await deleteMutation.mutateAsync({ id: data.id });
    router.push("/action-templates");
  };

  const notFound =
    error instanceof AxiosError && error.response?.status === 404;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (notFound) {
    return (
      <p className="text-sm text-red-500">Nie znaleziono szablonu zabiegu.</p>
    );
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
          Szablony zabiegów
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">{data.name}</h1>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium"
              href={`/action-templates/${data.id}/edit`}
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
                Zakres
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {
                  actionTemplateTargetLabels[
                    normalizeActionTemplateTarget(data.target ?? data.scope)
                  ]
                }
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Środowisko
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {
                  actionTemplateEnvironmentLabels[
                    normalizeActionTemplateEnvironment(data.environment)
                  ]
                }
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Typ
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {actionTemplateTypeLabels[data.type] ?? data.type}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Opóźnienie terminu (dni)
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {data.defaultDueOffsetDays ?? "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Opis</h2>
          <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            {data.description || "-"}
          </p>
        </section>
      </div>
    </section>
  );
}
