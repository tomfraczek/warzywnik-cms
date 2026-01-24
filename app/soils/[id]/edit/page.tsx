"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { SoilForm } from "@/app/components/SoilForm";
import { useGetSoil } from "@/app/api/queries/soils/useGetSoil";
import { useUpdateSoil } from "@/app/api/mutations/soils/useUpdateSoil";
import type { SoilFormValues } from "@/app/components/SoilForm";
import type { CreateSoilPayload, Soil } from "@/app/soils/api/api.types";

const mapSoilToFormValues = (data: Soil): SoilFormValues => ({
  slug: data.slug,
  name: data.name,
  description: data.description,
  soilType: data.soilType,
  structure: data.structure,
  waterRetention: data.waterRetention,
  drainage: data.drainage,
  fertilityLevel: data.fertilityLevel,
  phMin: data.phMin?.toString() ?? "",
  phMax: data.phMax?.toString() ?? "",
  advantages: data.advantages,
  disadvantages: data.disadvantages,
  improvementTips: data.improvementTips,
});

export default function EditSoilPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useGetSoil(params.id);
  const updateMutation = useUpdateSoil();

  const initialValues = useMemo(
    () => (data ? mapSoilToFormValues(data) : undefined),
    [data],
  );

  const handleSubmit = async (payload: CreateSoilPayload) => {
    if (!data) return;
    setErrorMessage(null);
    try {
      const result = await updateMutation.mutateAsync({ id: data.id, payload });
      router.push(`/soils/${result.id}`);
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
          setErrorMessage("Nie znaleziono gleby.");
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
    return <p className="text-sm text-red-500">Nie znaleziono gleby.</p>;
  }

  if (!data || !initialValues) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Gleby
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Edytuj glebę</h1>
      </header>
      <SoilForm
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
