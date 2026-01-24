"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { SoilForm } from "@/app/components/SoilForm";
import { useCreateSoil } from "@/app/api/mutations/soils/useCreateSoil";
import type { CreateSoilPayload } from "@/app/soils/api/api.types";

export default function NewSoilPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreateSoil();

  const handleSubmit = async (payload: CreateSoilPayload) => {
    setErrorMessage(null);
    try {
      const result = await createMutation.mutateAsync(payload);
      router.push(`/soils/${result.id}`);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setErrorMessage("Slug jest zajęty");
          return;
        }
        if (error.response.status === 400) {
          const message =
            typeof error.response.data?.message === "string"
              ? `Błąd walidacji danych. ${error.response.data.message}`
              : "Błąd walidacji danych.";
          setErrorMessage(message);
          return;
        }
      }
      setErrorMessage("Nie udało się zapisać gleby.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Gleby
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Nowa gleba</h1>
      </header>
      <SoilForm
        submitLabel="Utwórz glebę"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
