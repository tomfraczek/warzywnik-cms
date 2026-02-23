"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { ActionTemplateForm } from "@/app/components/ActionTemplateForm";
import { useCreateActionTemplate } from "@/app/api/mutations/action-templates/useCreateActionTemplate";
import type { CreateActionTemplatePayload } from "@/app/api/api.types";

export default function NewActionTemplatePage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreateActionTemplate();

  const handleSubmit = async (payload: CreateActionTemplatePayload) => {
    setErrorMessage(null);
    try {
      const result = await createMutation.mutateAsync(payload);
      router.push(`/action-templates/${result.id}`);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setErrorMessage("Rekord o tej nazwie już istnieje.");
          return;
        }
        if (error.response.status === 400) {
          setErrorMessage("Błąd walidacji danych.");
          return;
        }
      }
      setErrorMessage("Nie udało się zapisać szablonu.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Szablony zabiegów
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Nowy szablon zabiegu
        </h1>
      </header>

      <ActionTemplateForm
        submitLabel="Utwórz szablon"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
