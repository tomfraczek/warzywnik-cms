"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { ReferenceForm } from "@/app/components/ReferenceForm";
import { useCreatePest } from "@/app/api/mutations/pests/useCreatePest";
import type { CreatePestPayload } from "@/app/api/api.types";

export default function NewPestPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreatePest();

  const handleSubmit = async (payload: CreatePestPayload) => {
    setErrorMessage(null);
    try {
      const result = await createMutation.mutateAsync(payload);
      router.push(`/pests/${result.slug || result.id}`);
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
      setErrorMessage("Nie udało się zapisać szkodnika.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Szkodniki
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Nowy szkodnik</h1>
      </header>
      <ReferenceForm
        submitLabel="Utwórz szkodnika"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
