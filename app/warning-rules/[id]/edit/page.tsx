"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { WarningRuleForm } from "@/app/components/WarningRuleForm";
import { useGetWarningRule } from "@/app/api/queries/warning-rules/useGetWarningRule";
import { useUpdateWarningRule } from "@/app/api/mutations/warning-rules/useUpdateWarningRule";
import type { WarningRuleFormValues } from "@/app/components/WarningRuleForm";
import type {
  CreateWarningRulePayload,
  WarningRule,
} from "@/app/warning-rules/api/api.types";

const mapRuleToFormValues = (data: WarningRule): WarningRuleFormValues => ({
  code: data.code,
  enabled: data.enabled,
  severity: data.severity,
  title: data.title,
  messageTemplate: data.messageTemplate,
  hintTemplate: data.hintTemplate ?? "",
  blocking: data.blocking,
  cooldownDays:
    typeof data.cooldownDays === "number" ? data.cooldownDays.toString() : "",
});

export default function EditWarningRulePage() {
  const params = useParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useGetWarningRule(params?.id);
  const updateMutation = useUpdateWarningRule();

  const initialValues = useMemo(
    () => (data ? mapRuleToFormValues(data) : undefined),
    [data],
  );

  const handleSubmit = async (payload: CreateWarningRulePayload) => {
    if (!data) return;
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({ id: data.id, payload });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 409) {
          setErrorMessage("Kod reguły jest zajęty");
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
          setErrorMessage("Nie znaleziono reguły.");
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
    return <p className="text-sm text-red-500">Nie znaleziono reguły.</p>;
  }

  if (!data || !initialValues) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warning rules
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Edytuj regułę</h1>
      </header>
      <WarningRuleForm
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={errorMessage}
        isCodeLocked
      />
    </section>
  );
}
