"use client";

import { useState } from "react";
import type { CreateActionTemplatePayload } from "@/app/api/api.types";
import {
  actionTemplateDefaultTypeByTarget,
  actionTemplateEnvironmentOptions,
  actionTemplateGenerationModeOptions,
  actionTemplatePriorityOptions,
  actionTemplateTypeGroups,
  actionTemplateTargetOptions,
  mapActionTemplateType,
} from "@/app/api/api.types";
import {
  actionTemplateEnvironmentLabels,
  actionTemplateGenerationModeLabels,
  actionTemplatePriorityLabels,
  actionTemplateTargetLabels,
  actionTemplateTypeLabels,
} from "@/app/utils/labels";

export type ActionTemplateFormValues = {
  name: string;
  slug: string;
  target: CreateActionTemplatePayload["target"];
  environment: CreateActionTemplatePayload["environment"];
  type: CreateActionTemplatePayload["type"];
  generationMode: NonNullable<CreateActionTemplatePayload["generationMode"]>;
  priority: NonNullable<CreateActionTemplatePayload["priority"]>;
  maxAutoOccurrencesPerPlanting: number | null;
  minDaysBetweenOccurrences: number | null;
  requiresUserConfirmation: boolean;
  defaultDueOffsetDays: number | null;
  description: string;
};

const defaultValues: ActionTemplateFormValues = {
  name: "",
  slug: "",
  target: "bed",
  environment: "any",
  type: actionTemplateDefaultTypeByTarget.bed,
  generationMode: "MANUAL_ONLY",
  priority: "medium",
  maxAutoOccurrencesPerPlanting: null,
  minDaysBetweenOccurrences: null,
  requiresUserConfirmation: false,
  defaultDueOffsetDays: null,
  description: "",
};

export type ActionTemplateFormProps = {
  formId?: string;
  initialValues?: Partial<ActionTemplateFormValues>;
  onSubmit: (payload: CreateActionTemplatePayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  fieldErrors?: Partial<Record<keyof ActionTemplateFormValues, string>>;
};

export const ActionTemplateForm = ({
  formId,
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
  fieldErrors,
}: ActionTemplateFormProps) => {
  const [values, setValues] = useState<ActionTemplateFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [didUserPickType, setDidUserPickType] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const updateValue = <K extends keyof ActionTemplateFormValues>(
    key: K,
    value: ActionTemplateFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setClientError(null);

    if (values.name.trim().length < 2) {
      setClientError("Nazwa musi mieć co najmniej 2 znaki.");
      return;
    }

    if (!values.target) {
      setClientError("Pole 'Zakres' jest wymagane.");
      return;
    }

    if (!values.type) {
      setClientError("Pole 'Typ' jest wymagane.");
      return;
    }

    if (!actionTemplateGenerationModeOptions.includes(values.generationMode)) {
      setClientError("Niepoprawny tryb generowania.");
      return;
    }

    if (!actionTemplatePriorityOptions.includes(values.priority)) {
      setClientError("Niepoprawny priorytet.");
      return;
    }

    if (values.name.trim().length > 120) {
      setClientError("Nazwa może mieć maksymalnie 120 znaków.");
      return;
    }

    const offsetDays = values.defaultDueOffsetDays;
    const maxAutoOccurrencesPerPlanting = values.maxAutoOccurrencesPerPlanting;
    const minDaysBetweenOccurrences = values.minDaysBetweenOccurrences;

    if (offsetDays !== null && !Number.isInteger(offsetDays)) {
      setClientError("Opóźnienie terminu musi być liczbą całkowitą.");
      return;
    }

    if (
      maxAutoOccurrencesPerPlanting !== null &&
      (!Number.isInteger(maxAutoOccurrencesPerPlanting) ||
        maxAutoOccurrencesPerPlanting < 1)
    ) {
      setClientError(
        "Maksymalna liczba automatycznych wystąpień musi być pusta albo >= 1.",
      );
      return;
    }

    if (
      minDaysBetweenOccurrences !== null &&
      (!Number.isInteger(minDaysBetweenOccurrences) ||
        minDaysBetweenOccurrences < 1)
    ) {
      setClientError(
        "Minimalny odstęp między zadaniami musi być pusty albo >= 1.",
      );
      return;
    }

    if (typeof values.requiresUserConfirmation !== "boolean") {
      setClientError("Pole 'Wymaga zatwierdzenia użytkownika' musi być boolean.");
      return;
    }

    const trimmedDescription = values.description.trim();

    onSubmit({
      name: values.name.trim(),
      slug: values.slug.trim() || null,
      target: values.target,
      environment: values.environment,
      type: mapActionTemplateType(values.type, values.target),
      generationMode: values.generationMode,
      priority: values.priority,
      maxAutoOccurrencesPerPlanting,
      minDaysBetweenOccurrences,
      requiresUserConfirmation: values.requiresUserConfirmation,
      defaultDueOffsetDays: offsetDays,
      description: trimmedDescription === "" ? null : trimmedDescription,
    });
  };

  return (
    <form id={formId} className="space-y-6" onSubmit={handleSubmit}>
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Nazwa
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              required
              minLength={2}
              maxLength={120}
            />
            {fieldErrors?.name && (
              <span className="text-xs text-red-600">{fieldErrors.name}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Slug
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.slug}
              onChange={(event) => updateValue("slug", event.target.value)}
              placeholder="np. podlewanie-po-siewie"
            />
            {fieldErrors?.slug && (
              <span className="text-xs text-red-600">{fieldErrors.slug}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Zakres
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.target}
              onChange={(event) => {
                const nextTarget = event.target
                  .value as ActionTemplateFormValues["target"];
                setValues((prev) => {
                  const nextValues: ActionTemplateFormValues = {
                    ...prev,
                    target: nextTarget,
                  };

                  if (!didUserPickType) {
                    nextValues.type =
                      actionTemplateDefaultTypeByTarget[nextTarget];
                  }

                  return nextValues;
                });
              }}
              required
            >
              {actionTemplateTargetOptions.map((option) => (
                <option key={option} value={option}>
                  {actionTemplateTargetLabels[option] ?? option}
                </option>
              ))}
            </select>
            {fieldErrors?.target && (
              <span className="text-xs text-red-600">{fieldErrors.target}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Środowisko
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.environment}
              onChange={(event) => {
                updateValue(
                  "environment",
                  event.target.value as ActionTemplateFormValues["environment"],
                );
              }}
              required
            >
              {actionTemplateEnvironmentOptions.map((option) => (
                <option key={option} value={option}>
                  {actionTemplateEnvironmentLabels[option] ?? option}
                </option>
              ))}
            </select>
            {fieldErrors?.environment && (
              <span className="text-xs text-red-600">
                {fieldErrors.environment}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Typ
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.type}
              onChange={(event) => {
                setDidUserPickType(true);
                updateValue(
                  "type",
                  event.target.value as ActionTemplateFormValues["type"],
                );
              }}
              required
            >
              {actionTemplateTypeGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option} value={option}>
                      {actionTemplateTypeLabels[option] ?? option}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {fieldErrors?.type && (
              <span className="text-xs text-red-600">{fieldErrors.type}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Tryb generowania
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.generationMode}
              onChange={(event) =>
                updateValue(
                  "generationMode",
                  event.target
                    .value as ActionTemplateFormValues["generationMode"],
                )
              }
              required
            >
              {actionTemplateGenerationModeOptions.map((option) => (
                <option key={option} value={option}>
                  {actionTemplateGenerationModeLabels[option] ?? option}
                </option>
              ))}
            </select>
            {fieldErrors?.generationMode && (
              <span className="text-xs text-red-600">
                {fieldErrors.generationMode}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Priorytet
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.priority}
              onChange={(event) =>
                updateValue(
                  "priority",
                  event.target.value as ActionTemplateFormValues["priority"],
                )
              }
              required
            >
              {actionTemplatePriorityOptions.map((option) => (
                <option key={option} value={option}>
                  {actionTemplatePriorityLabels[option] ?? option}
                </option>
              ))}
            </select>
            {fieldErrors?.priority && (
              <span className="text-xs text-red-600">{fieldErrors.priority}</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Maksymalna liczba automatycznych wystąpień
            <input
              type="number"
              min={1}
              step={1}
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.maxAutoOccurrencesPerPlanting ?? ""}
              onChange={(event) => {
                const raw = event.target.value;
                const parsedValue = event.target.valueAsNumber;
                updateValue(
                  "maxAutoOccurrencesPerPlanting",
                  raw === "" || Number.isNaN(parsedValue) ? null : parsedValue,
                );
              }}
              placeholder="opcjonalnie"
            />
            {fieldErrors?.maxAutoOccurrencesPerPlanting && (
              <span className="text-xs text-red-600">
                {fieldErrors.maxAutoOccurrencesPerPlanting}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Minimalny odstęp między zadaniami
            <input
              type="number"
              min={1}
              step={1}
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.minDaysBetweenOccurrences ?? ""}
              onChange={(event) => {
                const raw = event.target.value;
                const parsedValue = event.target.valueAsNumber;
                updateValue(
                  "minDaysBetweenOccurrences",
                  raw === "" || Number.isNaN(parsedValue) ? null : parsedValue,
                );
              }}
              placeholder="opcjonalnie"
            />
            {fieldErrors?.minDaysBetweenOccurrences && (
              <span className="text-xs text-red-600">
                {fieldErrors.minDaysBetweenOccurrences}
              </span>
            )}
          </label>

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={values.requiresUserConfirmation}
              onChange={(event) =>
                updateValue("requiresUserConfirmation", event.target.checked)
              }
            />
            Wymaga zatwierdzenia użytkownika
          </label>
          {fieldErrors?.requiresUserConfirmation && (
            <span className="text-xs text-red-600 md:col-span-2">
              {fieldErrors.requiresUserConfirmation}
            </span>
          )}

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            Domyślne opóźnienie terminu (dni)
            <input
              type="number"
              step={1}
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.defaultDueOffsetDays ?? ""}
              onChange={(event) => {
                const raw = event.target.value;
                const parsedValue = event.target.valueAsNumber;
                updateValue(
                  "defaultDueOffsetDays",
                  raw === "" || Number.isNaN(parsedValue) ? null : parsedValue,
                );
              }}
              placeholder="np. -3, 0, 14"
            />
            {fieldErrors?.defaultDueOffsetDays && (
              <span className="text-xs text-red-600">
                {fieldErrors.defaultDueOffsetDays}
              </span>
            )}
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-2 text-sm">
          Opis (opcjonalnie)
          <textarea
            className="min-h-24 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
          />
          {fieldErrors?.description && (
            <span className="text-xs text-red-600">
              {fieldErrors.description}
            </span>
          )}
        </label>
      </section>

      {(clientError || errorMessage) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {clientError || errorMessage}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Zapisywanie..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
