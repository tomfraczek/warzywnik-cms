"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { ActionTemplateForm } from "@/app/components/ActionTemplateForm";
import { useGetActionTemplate } from "@/app/api/queries/action-templates/useGetActionTemplate";
import { useUpdateActionTemplate } from "@/app/api/mutations/action-templates/useUpdateActionTemplate";
import {
  actionTemplateGenerationModeOptions,
  actionTemplatePriorityOptions,
  mapActionTemplateType,
  normalizeActionTemplateEnvironment,
  normalizeActionTemplateTarget,
} from "@/app/api/api.types";
import type { ActionTemplateFormValues } from "@/app/components/ActionTemplateForm";
import type {
  ActionTemplate,
  CreateActionTemplatePayload,
  UpdateActionTemplatePayload,
} from "@/app/api/api.types";

type FieldErrors = Partial<Record<keyof ActionTemplateFormValues, string>>;

const mapBackendFieldToFormField = (
  field: string,
): keyof ActionTemplateFormValues | null => {
  const mapping: Record<string, keyof ActionTemplateFormValues> = {
    name: "name",
    slug: "slug",
    target: "target",
    environment: "environment",
    type: "type",
    generationMode: "generationMode",
    priority: "priority",
    maxAutoOccurrencesPerPlanting: "maxAutoOccurrencesPerPlanting",
    minDaysBetweenOccurrences: "minDaysBetweenOccurrences",
    requiresUserConfirmation: "requiresUserConfirmation",
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
      "slug",
      "target",
      "environment",
      "type",
      "generationMode",
      "priority",
      "maxAutoOccurrencesPerPlanting",
      "minDaysBetweenOccurrences",
      "requiresUserConfirmation",
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

const buildUpdatePayload = (
  current: CreateActionTemplatePayload,
  initial: ActionTemplateFormValues,
): UpdateActionTemplatePayload => {
  const initialName = initial.name.trim();
  const initialSlug = initial.slug.trim() || null;
  const initialDescription = initial.description.trim() || null;

  const next: UpdateActionTemplatePayload = {};

  if (current.name !== initialName) next.name = current.name;
  if ((current.slug ?? null) !== initialSlug) next.slug = current.slug ?? null;
  if (current.target !== initial.target) next.target = current.target;
  if (current.environment !== initial.environment) {
    next.environment = current.environment;
  }
  if (current.type !== initial.type) next.type = current.type;
  if (current.generationMode !== initial.generationMode) {
    next.generationMode = current.generationMode;
  }
  if (current.priority !== initial.priority) {
    next.priority = current.priority;
  }

  if (
    (current.maxAutoOccurrencesPerPlanting ?? null) !==
    initial.maxAutoOccurrencesPerPlanting
  ) {
    next.maxAutoOccurrencesPerPlanting =
      current.maxAutoOccurrencesPerPlanting ?? null;
  }

  if (
    (current.minDaysBetweenOccurrences ?? null) !==
    initial.minDaysBetweenOccurrences
  ) {
    next.minDaysBetweenOccurrences = current.minDaysBetweenOccurrences ?? null;
  }

  if (current.requiresUserConfirmation !== initial.requiresUserConfirmation) {
    next.requiresUserConfirmation = current.requiresUserConfirmation;
  }

  if ((current.defaultDueOffsetDays ?? null) !== initial.defaultDueOffsetDays) {
    next.defaultDueOffsetDays = current.defaultDueOffsetDays ?? null;
  }

  if ((current.description ?? null) !== initialDescription) {
    next.description = current.description ?? null;
  }

  return next;
};

const mapActionTemplateFromApi = (
  data: ActionTemplate,
): ActionTemplateFormValues => {
  const target = normalizeActionTemplateTarget(data.target);

  return {
    name: data.name,
    slug: data.slug ?? "",
    target,
    environment: normalizeActionTemplateEnvironment(data.environment),
    type: mapActionTemplateType(data.type, target),
    generationMode: actionTemplateGenerationModeOptions.includes(
      data.generationMode ?? "MANUAL_ONLY",
    )
      ? (data.generationMode ?? "MANUAL_ONLY")
      : "MANUAL_ONLY",
    priority: actionTemplatePriorityOptions.includes(data.priority ?? "medium")
      ? (data.priority ?? "medium")
      : "medium",
    maxAutoOccurrencesPerPlanting: data.maxAutoOccurrencesPerPlanting ?? null,
    minDaysBetweenOccurrences: data.minDaysBetweenOccurrences ?? null,
    requiresUserConfirmation: Boolean(data.requiresUserConfirmation),
    defaultDueOffsetDays: data.defaultDueOffsetDays ?? null,
    description: data.description || "",
  };
};

export default function EditActionTemplatePage() {
  const formId = "action-template-edit-form";
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { data, isLoading, error } = useGetActionTemplate(params?.id);
  const updateMutation = useUpdateActionTemplate();

  const initialValues = useMemo(
    () => (data ? mapActionTemplateFromApi(data) : undefined),
    [data],
  );

  const handleSubmit = async (payload: CreateActionTemplatePayload) => {
    if (!data || !initialValues) return;

    setErrorMessage(null);
    setFieldErrors({});

    const updatePayload = buildUpdatePayload(payload, initialValues);

    if (Object.keys(updatePayload).length === 0) {
      router.push(`/action-templates/${data.id}`);
      return;
    }

    try {
      const result = await updateMutation.mutateAsync({
        id: data.id,
        payload: updatePayload,
      });
      router.push(`/action-templates/${result.id}`);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 409) {
          setErrorMessage("Szablon o tej nazwie już istnieje.");
          return;
        }
        if (err.response.status === 400) {
          const nextFieldErrors = extractFieldErrors(err.response.data);
          setFieldErrors(nextFieldErrors);
          const message =
            typeof err.response.data === "object" &&
            err.response.data &&
            typeof (err.response.data as { message?: unknown }).message ===
              "string"
              ? String((err.response.data as { message?: string }).message)
              : "Błąd walidacji danych. Sprawdź pola formularza.";
          setErrorMessage(message);
          return;
        }
        if (err.response.status === 404) {
          setErrorMessage("Nie znaleziono szablonu zabiegu.");
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
    return (
      <p className="text-sm text-red-500">Nie znaleziono szablonu zabiegu.</p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data || !initialValues) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Szablony zabiegów
          </p>
          <button
            type="submit"
            form={formId}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </div>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Edytuj szablon zabiegu
        </h1>
      </header>

      <ActionTemplateForm
        formId={formId}
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
      />
    </section>
  );
}
