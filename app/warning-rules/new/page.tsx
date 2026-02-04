"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { WarningRuleForm } from "@/app/components/WarningRuleForm";
import { useCreateWarningRule } from "@/app/api/mutations/warning-rules/useCreateWarningRule";
import type { CreateWarningRulePayload } from "@/app/warning-rules/api/api.types";

export default function NewWarningRulePage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreateWarningRule();

  const handleSubmit = async (payload: CreateWarningRulePayload) => {
    setErrorMessage(null);
    try {
      await createMutation.mutateAsync(payload);
      router.push(`/warning-rules`);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setErrorMessage("Kod reguły jest zajęty");
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
      setErrorMessage("Nie udało się zapisać reguły.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warning rules
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Nowa reguła</h1>
      </header>
      <WarningRuleForm
        submitLabel="Utwórz regułę"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
