"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { ActionTemplateForm } from "@/app/components/ActionTemplateForm";
import { useGetActionTemplate } from "@/app/api/queries/action-templates/useGetActionTemplate";
import { useUpdateActionTemplate } from "@/app/api/mutations/action-templates/useUpdateActionTemplate";
import type { ActionTemplateFormValues } from "@/app/components/ActionTemplateForm";
import type {
  ActionTemplate,
  CreateActionTemplatePayload,
} from "@/app/api/api.types";

const mapActionTemplateToFormValues = (
  data: ActionTemplate,
): ActionTemplateFormValues => ({
  slug: data.slug,
  name: data.name,
  target: data.target,
  type: data.type,
  defaultDueOffsetDays: data.defaultDueOffsetDays.toString(),
  description: data.description || "",
});

export default function EditActionTemplatePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useGetActionTemplate(params?.id);
  const updateMutation = useUpdateActionTemplate();

  const initialValues = useMemo(
    () => (data ? mapActionTemplateToFormValues(data) : undefined),
    [data],
  );

  const handleSubmit = async (payload: CreateActionTemplatePayload) => {
    if (!data) return;
    setErrorMessage(null);
    try {
      const result = await updateMutation.mutateAsync({ id: data.id, payload });
      router.push(`/action-templates/${result.id}`);
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
          setErrorMessage("Nie znaleziono template.");
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
    return <p className="text-sm text-red-500">Nie znaleziono template.</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data || !initialValues) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Action templates
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Edytuj template
        </h1>
      </header>

      <ActionTemplateForm
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={errorMessage}
      />
    </section>
  );
}
