"use client";

import { useState } from "react";
import type {
  CreateDiseasePayload,
  CreatePestPayload,
} from "@/app/api/api.types";

export type ReferenceFormValues = {
  slug: string;
  name: string;
  description: string;
  symptoms: string;
  prevention: string;
  treatment: string;
};

const defaultValues: ReferenceFormValues = {
  slug: "",
  name: "",
  description: "",
  symptoms: "",
  prevention: "",
  treatment: "",
};

const isLowercaseSlug = (value: string) => /^[a-z0-9-]{2,}$/.test(value);

export type ReferenceFormProps = {
  initialValues?: Partial<ReferenceFormValues>;
  onSubmit: (payload: CreatePestPayload | CreateDiseasePayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export const ReferenceForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
}: ReferenceFormProps) => {
  const [values, setValues] = useState<ReferenceFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [clientError, setClientError] = useState<string | null>(null);

  const updateValue = <K extends keyof ReferenceFormValues>(
    key: K,
    value: ReferenceFormValues[K],
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
    if (!values.description.trim()) {
      setClientError("Opis jest wymagany.");
      return;
    }

    onSubmit({
      slug: values.slug.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      symptoms: values.symptoms.trim() || null,
      prevention: values.prevention.trim() || null,
      treatment: values.treatment.trim() || null,
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
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          Opis
          <textarea
            className="min-h-30 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
            required
          />
        </label>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          Objawy
          <textarea
            className="min-h-20 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.symptoms}
            onChange={(event) => updateValue("symptoms", event.target.value)}
          />
        </label>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          Zapobieganie
          <textarea
            className="min-h-20 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.prevention}
            onChange={(event) => updateValue("prevention", event.target.value)}
          />
        </label>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          Leczenie
          <textarea
            className="min-h-20 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.treatment}
            onChange={(event) => updateValue("treatment", event.target.value)}
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
