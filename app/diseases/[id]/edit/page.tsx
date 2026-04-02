"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { ReferenceForm } from "@/app/components/ReferenceForm";
import { useGetDisease } from "@/app/api/queries/diseases/useGetDisease";
import { useUpdateDisease } from "@/app/api/mutations/diseases/useUpdateDisease";
import type { ReferenceFormValues } from "@/app/components/ReferenceForm";
import type { CreateDiseasePayload, Disease } from "@/app/api/api.types";

const mapDiseaseToFormValues = (data: Disease): ReferenceFormValues => ({
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

export default function EditDiseasePage() {
  const formId = "disease-edit-form";
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useGetDisease(params?.id);
  const updateMutation = useUpdateDisease();

  const initialValues = useMemo(
    () => (data ? mapDiseaseToFormValues(data) : undefined),
    [data],
  );

  const handleSubmit = async (payload: CreateDiseasePayload) => {
    if (!data) return;
    setErrorMessage(null);
    try {
      const result = await updateMutation.mutateAsync({ id: data.id, payload });
      router.push(`/diseases/${result.id}`);
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
          setErrorMessage("Nie znaleziono choroby.");
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
    return <p className="text-sm text-red-500">Nie znaleziono choroby.</p>;
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
            Choroby
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
        <h1 className="text-3xl font-semibold text-zinc-900">Edytuj chorobę</h1>
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
