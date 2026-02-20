"use client";

import { useState } from "react";
import type { CreateActionTemplatePayload } from "@/app/api/api.types";
import {
  actionTemplateTargetOptions,
  actionTemplateTypeOptions,
} from "@/app/api/api.types";

export type ActionTemplateFormValues = {
  slug: string;
  name: string;
  target: CreateActionTemplatePayload["target"];
  type: CreateActionTemplatePayload["type"];
  defaultDueOffsetDays: string;
  description: string;
};

const defaultValues: ActionTemplateFormValues = {
  slug: "",
  name: "",
  target: "bed",
  type: actionTemplateTypeOptions[0] ?? "other",
  defaultDueOffsetDays: "0",
  description: "",
};

const isLowercaseSlug = (value: string) => /^[a-z0-9-]{2,}$/.test(value);

const targetLabels: Record<CreateActionTemplatePayload["target"], string> = {
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

    if (!isLowercaseSlug(values.slug)) {
      setClientError("Slug musi mieć min 2 znaki i tylko a-z0-9-.");
      return;
    }

    if (values.name.trim().length < 2) {
      setClientError("Nazwa musi mieć co najmniej 2 znaki.");
      return;
    }

    const offsetDays = Number(values.defaultDueOffsetDays);
    if (Number.isNaN(offsetDays) || offsetDays < 0) {
      setClientError("defaultDueOffsetDays musi być liczbą >= 0.");
      return;
    }

    onSubmit({
      slug: values.slug.trim(),
      name: values.name.trim(),
      target: values.target,
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
            Slug
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.slug}
              onChange={(event) => updateValue("slug", event.target.value)}
              required
            />
          </label>

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
            Target
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
              {actionTemplateTargetOptions.map((option) => (
                <option key={option} value={option}>
                  {targetLabels[option] ?? option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Type
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
            defaultDueOffsetDays
            <input
              type="number"
              min={0}
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.defaultDueOffsetDays}
              onChange={(event) =>
                updateValue("defaultDueOffsetDays", event.target.value)
              }
              required
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
