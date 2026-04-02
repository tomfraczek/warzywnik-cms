"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { ReferenceForm } from "@/app/components/ReferenceForm";
import { useGetPest } from "@/app/api/queries/pests/useGetPest";
import { useUpdatePest } from "@/app/api/mutations/pests/useUpdatePest";
import type { ReferenceFormValues } from "@/app/components/ReferenceForm";
import type { CreatePestPayload, Pest } from "@/app/api/api.types";

const mapPestToFormValues = (data: Pest): ReferenceFormValues => ({
  name: data.name,
  slug: data.slug ?? "",
  description: data.description,
  symptoms: data.symptoms || "",
  prevention: data.prevention || "",
  treatment: data.treatment || "",
  recommendedActionTemplateIds:
    data.recommendedActions?.map((item) => item.id) ??
    data.recommendedActionTemplateIds ??
    [],
});

export default function EditPestPage() {
  const formId = "pest-edit-form";
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useGetPest(params?.id);
  const updateMutation = useUpdatePest();

  const initialValues = useMemo(
    () => (data ? mapPestToFormValues(data) : undefined),
    [data],
  );

  const handleSubmit = async (payload: CreatePestPayload) => {
    if (!data) return;
    setErrorMessage(null);
    try {
      const result = await updateMutation.mutateAsync({ id: data.id, payload });
      router.push(`/pests/${result.id}`);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 409) {
          setErrorMessage("Rekord o tej nazwie już istnieje.");
          return;
        }
        if (err.response.status === 400) {
          setErrorMessage("Błąd walidacji danych.");
          return;
        }
        if (err.response.status === 404) {
          setErrorMessage("Nie znaleziono szkodnika.");
          return;
        }
      }
      setErrorMessage("Nie udało się zapisać zmian.");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (error instanceof AxiosError && error.response?.status === 404) {
    return <p className="text-sm text-red-500">Nie znaleziono szkodnika.</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data || !initialValues) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Szkodniki
          </p>
          <button
            type="submit"
            form={formId}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </div>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Edytuj szkodnika
        </h1>
      </header>
      <ReferenceForm
        formId={formId}
        initialValues={initialValues}
        initialRecommendedActions={data.recommendedActions ?? []}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
