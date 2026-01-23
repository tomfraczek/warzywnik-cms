"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { ReferenceForm } from "@/app/components/ReferenceForm";
import { useQuery } from "@tanstack/react-query";
import { getPestIdBySlug } from "@/app/api/api.requests";
import { useGetPest } from "@/app/api/queries/pests/useGetPest";
import { useUpdatePest } from "@/app/api/mutations/pests/useUpdatePest";
import type { ReferenceFormValues } from "@/app/components/ReferenceForm";
import type { CreatePestPayload, Pest } from "@/app/api/api.types";

const mapPestToFormValues = (data: Pest): ReferenceFormValues => ({
  slug: data.slug,
  name: data.name,
  description: data.description,
  symptoms: data.symptoms || "",
  prevention: data.prevention || "",
  treatment: data.treatment || "",
});

export default function EditPestPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    data: pestId,
    isLoading: isIdLoading,
    error: idError,
  } = useQuery({
    queryKey: ["pest-id", params.slug],
    queryFn: () => getPestIdBySlug(params.slug),
  });
  const { data, isLoading, error } = useGetPest(pestId);
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
      router.push(`/pests/${result.slug || result.id}`);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 409) {
          setErrorMessage("Slug jest zajęty");
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

  if (isIdLoading || isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (
    (idError instanceof Error && idError.message === "NOT_FOUND") ||
    (error instanceof AxiosError && error.response?.status === 404)
  ) {
    return <p className="text-sm text-red-500">Nie znaleziono szkodnika.</p>;
  }

  if (idError || error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data || !initialValues) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Szkodniki
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Edytuj szkodnika
        </h1>
      </header>
      <ReferenceForm
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
