"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ActionTemplate,
  ActionTemplateRef,
  CreateDiseasePayload,
  CreatePestPayload,
} from "@/app/api/api.types";
import { useGetActionTemplates } from "@/app/api/queries/action-templates/useGetActionTemplates";
import { useGetActionTemplatesByIds } from "@/app/api/queries/action-templates/useGetActionTemplatesByIds";

export type ReferenceFormValues = {
  name: string;
  description: string;
  symptoms: string;
  prevention: string;
  treatment: string;
  recommendedActionTemplateIds: string[];
};

const defaultValues: ReferenceFormValues = {
  name: "",
  description: "",
  symptoms: "",
  prevention: "",
  treatment: "",
  recommendedActionTemplateIds: [],
};

export type ReferenceFormProps = {
  initialValues?: Partial<ReferenceFormValues>;
  initialRecommendedActions?: ActionTemplateRef[];
  onSubmit: (payload: CreatePestPayload | CreateDiseasePayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export const ReferenceForm = ({
  initialValues,
  initialRecommendedActions,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
}: ReferenceFormProps) => {
  const [values, setValues] = useState<ReferenceFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [actionTemplateQuery, setActionTemplateQuery] = useState("");
  const [debouncedActionTemplateQuery, setDebouncedActionTemplateQuery] =
    useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedActionTemplateQuery(actionTemplateQuery.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [actionTemplateQuery]);

  const { data: actionTemplatesData, isFetching: actionTemplatesFetching } =
    useGetActionTemplates({
      page: 1,
      limit: 20,
      q: debouncedActionTemplateQuery || undefined,
    });

  const { data: selectedTemplateDetails } = useGetActionTemplatesByIds(
    values.recommendedActionTemplateIds,
  );

  const selectedTemplateMap = useMemo(() => {
    const map = new Map<string, ActionTemplateRef>();

    (initialRecommendedActions ?? []).forEach((item) => {
      map.set(item.id, item);
    });

    (selectedTemplateDetails ?? []).forEach((item: ActionTemplate) => {
      map.set(item.id, {
        id: item.id,
        name: item.name,
        type: item.type,
      });
    });

    (actionTemplatesData?.items ?? []).forEach((item) => {
      map.set(item.id, {
        id: item.id,
        name: item.name,
        type: item.type,
      });
    });

    return map;
  }, [
    actionTemplatesData?.items,
    initialRecommendedActions,
    selectedTemplateDetails,
  ]);

  const updateValue = <K extends keyof ReferenceFormValues>(
    key: K,
    value: ReferenceFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setClientError(null);

    if (values.name.trim().length < 2) {
      setClientError("Nazwa musi mieć co najmniej 2 znaki.");
      return;
    }
    if (!values.description.trim()) {
      setClientError("Opis jest wymagany.");
      return;
    }

    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      symptoms: values.symptoms.trim() || null,
      prevention: values.prevention.trim() || null,
      treatment: values.treatment.trim() || null,
      recommendedActionTemplateIds: values.recommendedActionTemplateIds,
    });
  };

  const toggleRecommendedAction = (id: string) => {
    updateValue(
      "recommendedActionTemplateIds",
      values.recommendedActionTemplateIds.includes(id)
        ? values.recommendedActionTemplateIds.filter((item) => item !== id)
        : [...values.recommendedActionTemplateIds, id],
    );
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

        <div className="mt-4 space-y-2 text-sm">
          <p className="font-medium">Rekomendowane zabiegi</p>
          <p className="text-xs text-zinc-500">
            Szukaj i przypisz szablony zabiegów (limit 20 wyników).
          </p>

          <input
            className="w-full rounded-lg border border-zinc-200 px-3 py-2"
            placeholder="Szukaj szablonów zabiegów po nazwie"
            value={actionTemplateQuery}
            onChange={(event) => setActionTemplateQuery(event.target.value)}
          />

          <div className="max-h-56 overflow-auto rounded-lg border border-zinc-200 p-2">
            {(actionTemplatesData?.items ?? []).map((item) => {
              const checked = values.recommendedActionTemplateIds.includes(
                item.id,
              );
              return (
                <label
                  key={item.id}
                  className="flex items-center gap-2 px-1 py-1 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRecommendedAction(item.id)}
                  />
                  <span className="text-zinc-800">{item.name}</span>
                  <span className="text-xs text-zinc-500">({item.type})</span>
                </label>
              );
            })}

            {actionTemplatesFetching && (
              <p className="px-1 py-1 text-xs text-zinc-500">Ładowanie...</p>
            )}

            {!actionTemplatesFetching &&
              (actionTemplatesData?.items.length ?? 0) === 0 && (
                <p className="px-1 py-1 text-xs text-zinc-500">Brak wyników.</p>
              )}
          </div>

          {values.recommendedActionTemplateIds.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
              <p className="mb-2 font-medium">Wybrane:</p>
              <ul className="space-y-1">
                {values.recommendedActionTemplateIds.map((id) => {
                  const template = selectedTemplateMap.get(id);
                  return (
                    <li key={id}>
                      {template ? `${template.name} (${template.type})` : id}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
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
