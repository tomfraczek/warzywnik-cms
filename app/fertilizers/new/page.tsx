"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { FertilizerForm } from "@/app/components/FertilizerForm";
import { useCreateFertilizer } from "@/app/api/mutations/fertilizers/useCreateFertilizer";
import type { CreateFertilizerTypePayload } from "@/app/fertilizers/api/api.types";

export default function NewFertilizerPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreateFertilizer();

  const handleSubmit = async (payload: CreateFertilizerTypePayload) => {
    setErrorMessage(null);
    try {
      const result = await createMutation.mutateAsync(payload);
      router.push(`/fertilizers/${result.id}`);
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
      setErrorMessage("Nie udało się zapisać nawozu.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Nawozy
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Nowy nawóz</h1>
      </header>
      <FertilizerForm
        submitLabel="Utwórz nawóz"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
