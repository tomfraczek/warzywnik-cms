"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { FertilizerForm } from "@/app/components/FertilizerForm";
import { useGetFertilizer } from "@/app/api/queries/fertilizers/useGetFertilizer";
import { useUpdateFertilizer } from "@/app/api/mutations/fertilizers/useUpdateFertilizer";
import type { FertilizerFormValues } from "@/app/components/FertilizerForm";
import type {
  CreateFertilizerTypePayload,
  FertilizerType,
} from "@/app/fertilizers/api/api.types";

const mapFertilizerToFormValues = (
  data: FertilizerType,
): FertilizerFormValues => ({
  slug: data.slug,
  name: data.name,
  description: data.description,
  category: data.category,
  form: data.form,
  applicationMethod: data.applicationMethod,
  riskLevel: data.riskLevel,
  nitrogenEffect: data.nitrogenEffect,
  phosphorusEffect: data.phosphorusEffect,
  potassiumEffect: data.potassiumEffect,
  phEffect: data.phEffect,
  soilStructureEffect: data.soilStructureEffect,
  waterRetentionEffect: data.waterRetentionEffect,
  drainageEffect: data.drainageEffect,
  recommendedFrequency: data.recommendedFrequency,
  dosageGuidance: data.dosageGuidance ?? "",
  notes: data.notes ?? "",
  isActive: data.isActive,
});

export default function EditFertilizerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useGetFertilizer(params?.id);
  const updateMutation = useUpdateFertilizer();

  const initialValues = useMemo(
    () => (data ? mapFertilizerToFormValues(data) : undefined),
    [data],
  );

  const handleSubmit = async (payload: CreateFertilizerTypePayload) => {
    if (!data) return;
    setErrorMessage(null);
    try {
      const result = await updateMutation.mutateAsync({
        id: data.id,
        payload,
      });
      router.push(`/fertilizers/${result.id}`);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 409) {
          setErrorMessage("Slug jest zajęty");
          return;
        }
        if (err.response.status === 400) {
          const message =
            typeof err.response.data?.message === "string"
              ? `Błąd walidacji danych. ${err.response.data.message}`
              : "Błąd walidacji danych.";
          setErrorMessage(message);
          return;
        }
        if (err.response.status === 404) {
          setErrorMessage("Nie znaleziono nawozu.");
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
    return <p className="text-sm text-red-500">Nie znaleziono nawozu.</p>;
  }

  if (!data || !initialValues) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Nawozy
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Edytuj nawóz</h1>
      </header>
      <FertilizerForm
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
