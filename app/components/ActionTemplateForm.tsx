"use client";

import { useState } from "react";
import type { CreateActionTemplatePayload } from "@/app/api/api.types";
import {
  actionTemplateScopeOptions,
  actionTemplateTypeOptions,
} from "@/app/api/api.types";

export type ActionTemplateFormValues = {
  name: string;
  target: CreateActionTemplatePayload["target"];
  type: CreateActionTemplatePayload["type"];
  defaultDueOffsetDays: number | null;
  description: string;
};

const defaultValues: ActionTemplateFormValues = {
  name: "",
  target: "bed",
  type: actionTemplateTypeOptions[0] ?? "OTHER",
  defaultDueOffsetDays: null,
  description: "",
};

const targetLabels: Record<CreateActionTemplatePayload["target"], string> = {
  bed: "Grządka",
  planting: "Nasadzenie",
};

const typeLabels: Record<string, string> = {
  WATER: "Podlewanie",
  SPRAY: "Oprysk",
  FERTILIZE: "Nawożenie",
  WEED: "Odchwaszczanie",
  HARVEST: "Zbiór",
  SOIL_PREP: "Przygotowanie gleby",
  OTHER: "Inne",
};

const normalizeActionTemplateType = (
  type: string,
): CreateActionTemplatePayload["type"] => {
  const normalized = type.trim().toUpperCase();

  const legacyMap: Record<string, CreateActionTemplatePayload["type"]> = {
    spray: "SPRAY",
    fertilization: "FERTILIZE",
    watering: "WATER",
    manual: "OTHER",
    monitoring: "OTHER",
    other: "OTHER",
  };

  return (
    (legacyMap[type.trim().toLowerCase()] ??
      (normalized as CreateActionTemplatePayload["type"])) ||
    "OTHER"
  );
};

export type ActionTemplateFormProps = {
  initialValues?: Partial<ActionTemplateFormValues>;
  onSubmit: (payload: CreateActionTemplatePayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export const ActionTemplateForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
}: ActionTemplateFormProps) => {
  const [values, setValues] = useState<ActionTemplateFormValues>({
    ...defaultValues,
    ...initialValues,
  });
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

    const offsetDays = values.defaultDueOffsetDays;

    if (offsetDays !== null && !Number.isInteger(offsetDays)) {
      setClientError("Opóźnienie terminu musi być liczbą całkowitą.");
      return;
    }

    if (offsetDays !== null && (offsetDays < -3650 || offsetDays > 3650)) {
      setClientError(
        "Opóźnienie terminu musi być w zakresie od -3650 do 3650.",
      );
      return;
    }

    const trimmedDescription = values.description.trim();

    onSubmit({
      name: values.name.trim(),
      target: values.target,
      type: normalizeActionTemplateType(values.type),
      ...(offsetDays === null ? {} : { defaultDueOffsetDays: offsetDays }),
      ...(trimmedDescription === "" ? {} : { description: trimmedDescription }),
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Nazwa
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Zakres
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.target}
              onChange={(event) =>
                updateValue(
                  "target",
                  event.target.value as ActionTemplateFormValues["target"],
                )
              }
            >
              {actionTemplateScopeOptions.map((option) => (
                <option key={option} value={option}>
                  {targetLabels[option] ?? option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Typ
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.type}
              onChange={(event) =>
                updateValue(
                  "type",
                  event.target.value as ActionTemplateFormValues["type"],
                )
              }
            >
              {actionTemplateTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {typeLabels[option] ?? option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            Domyślne opóźnienie terminu (dni)
            <input
              type="number"
              step={1}
              min={-3650}
              max={3650}
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
              placeholder="Liczba dni (np. 7)"
            />
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-2 text-sm">
          Opis (opcjonalnie)
          <textarea
            className="min-h-24 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
          />
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
