"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { ActionTemplateForm } from "@/app/components/ActionTemplateForm";
import { useCreateActionTemplate } from "@/app/api/mutations/action-templates/useCreateActionTemplate";
import type { CreateActionTemplatePayload } from "@/app/api/api.types";
import type { ActionTemplateFormValues } from "@/app/components/ActionTemplateForm";

type FieldErrors = Partial<Record<keyof ActionTemplateFormValues, string>>;

const mapBackendFieldToFormField = (
  field: string,
): keyof ActionTemplateFormValues | null => {
  if (field === "scope") return "target";

  const mapping: Record<string, keyof ActionTemplateFormValues> = {
    name: "name",
    target: "target",
    environment: "environment",
    type: "type",
    defaultDueOffsetDays: "defaultDueOffsetDays",
    description: "description",
  };

  return mapping[field] ?? null;
};

const extractFieldErrors = (payload: unknown): FieldErrors => {
  if (!payload || typeof payload !== "object") return {};

  const result: FieldErrors = {};

  const appendFromMessageText = (text: string) => {
    const normalized = text.trim();
    const knownFields = [
      "name",
      "target",
      "scope",
      "environment",
      "type",
      "defaultDueOffsetDays",
      "description",
    ];

    const field = knownFields.find(
      (entry) =>
        normalized.toLowerCase().startsWith(`${entry.toLowerCase()} `) ||
        normalized.toLowerCase().startsWith(`${entry.toLowerCase()}:`),
    );

    if (!field) return;
    const mappedField = mapBackendFieldToFormField(field);
    if (!mappedField) return;
    result[mappedField] = normalized;
  };

  const maybeErrors = (payload as { errors?: unknown }).errors;
  if (Array.isArray(maybeErrors)) {
    maybeErrors.forEach((errorItem) => {
      if (!errorItem || typeof errorItem !== "object") return;

      const field = String((errorItem as { field?: unknown }).field ?? "");
      const message = String(
        (errorItem as { message?: unknown }).message ?? "",
      );
      const mappedField = mapBackendFieldToFormField(field);

      if (mappedField && message) {
        result[mappedField] = message;
      }
    });
  }

  const message = (payload as { message?: unknown }).message;
  if (Array.isArray(message)) {
    message
      .filter((item): item is string => typeof item === "string")
      .forEach(appendFromMessageText);
  }

  if (typeof message === "string") {
    appendFromMessageText(message);
  }

  return result;
};

export default function NewActionTemplatePage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const createMutation = useCreateActionTemplate();

  const handleSubmit = async (payload: CreateActionTemplatePayload) => {
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const result = await createMutation.mutateAsync(payload);
      router.push(`/action-templates/${result.id}`);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setErrorMessage("Szablon o tej nazwie już istnieje.");
          return;
        }

        if (error.response.status === 400) {
          const nextFieldErrors = extractFieldErrors(error.response.data);
          setFieldErrors(nextFieldErrors);
          setErrorMessage("Błąd walidacji danych. Sprawdź pola formularza.");
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
        fieldErrors={fieldErrors}
      />
    </section>
  );
}
