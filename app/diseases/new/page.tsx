"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { ReferenceForm } from "@/app/components/ReferenceForm";
import { useCreateDisease } from "@/app/api/mutations/diseases/useCreateDisease";
import type { CreateDiseasePayload } from "@/app/api/api.types";

export default function NewDiseasePage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreateDisease();

  const handleSubmit = async (payload: CreateDiseasePayload) => {
    setErrorMessage(null);
    try {
      const result = await createMutation.mutateAsync(payload);
      router.push(`/diseases/${result.slug || result.id}`);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setErrorMessage("Slug jest zajęty");
          return;
        }
        if (error.response.status === 400) {
          setErrorMessage("Błąd walidacji danych.");
          return;
        }
      }
      setErrorMessage("Nie udało się zapisać choroby.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Choroby
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Nowa choroba</h1>
      </header>
      <ReferenceForm
        submitLabel="Utwórz chorobę"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
