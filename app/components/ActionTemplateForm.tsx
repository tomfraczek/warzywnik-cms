"use client";

import { useState } from "react";
import type { CreateActionTemplatePayload } from "@/app/api/api.types";
import {
  actionTemplateScopeOptions,
  actionTemplateTypeOptions,
} from "@/app/api/api.types";

export type ActionTemplateFormValues = {
  name: string;
  scope: CreateActionTemplatePayload["scope"];
  type: CreateActionTemplatePayload["type"];
  defaultDueOffsetDays: string;
  description: string;
};

const defaultValues: ActionTemplateFormValues = {
  name: "",
  scope: "bed",
  type: actionTemplateTypeOptions[0] ?? "other",
  defaultDueOffsetDays: "",
  description: "",
};

const scopeLabels: Record<CreateActionTemplatePayload["scope"], string> = {
  bed: "Grządka",
  planting: "Nasadzenie",
};

const typeLabels: Record<string, string> = {
  spray: "Oprysk",
  fertilization: "Nawożenie",
  watering: "Podlewanie",
  manual: "Ręcznie",
  monitoring: "Monitoring",
  other: "Inne",
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

    const trimmedOffset = values.defaultDueOffsetDays.trim();
    let offsetDays: number | null = null;

    if (trimmedOffset !== "") {
      const parsedOffset = Number(trimmedOffset);
      if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
        setClientError("Opóźnienie terminu musi być liczbą całkowitą >= 0.");
        return;
      }
      offsetDays = parsedOffset;
    }

    onSubmit({
      name: values.name.trim(),
      scope: values.scope,
      type: values.type,
      defaultDueOffsetDays: offsetDays,
      description: values.description.trim() || null,
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
              value={values.scope}
              onChange={(event) =>
                updateValue(
                  "scope",
                  event.target.value as ActionTemplateFormValues["scope"],
                )
              }
            >
              {actionTemplateScopeOptions.map((option) => (
                <option key={option} value={option}>
                  {scopeLabels[option] ?? option}
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
              min={0}
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.defaultDueOffsetDays}
              onChange={(event) =>
                updateValue("defaultDueOffsetDays", event.target.value)
              }
              placeholder="Opcjonalne"
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
