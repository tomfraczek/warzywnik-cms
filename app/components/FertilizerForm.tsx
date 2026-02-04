"use client";

import { useState } from "react";
import type { CreateFertilizerTypePayload } from "@/app/fertilizers/api/api.types";
import {
  fertilizerApplicationMethodOptions,
  fertilizerCategoryOptions,
  fertilizerEffectLevelOptions,
  fertilizerFormOptions,
  fertilizerPhEffectOptions,
  fertilizerRecommendedFrequencyOptions,
  fertilizerRetentionEffectOptions,
  fertilizerRiskLevelOptions,
  fertilizerSoilStructureEffectOptions,
} from "@/app/fertilizers/api/api.types";

export type FertilizerFormValues = {
  slug: string;
  name: string;
  description: string;
  category: CreateFertilizerTypePayload["category"] | "";
  form: CreateFertilizerTypePayload["form"] | "";
  applicationMethod: CreateFertilizerTypePayload["applicationMethod"] | "";
  riskLevel: CreateFertilizerTypePayload["riskLevel"] | "";
  nitrogenEffect: CreateFertilizerTypePayload["nitrogenEffect"] | "";
  phosphorusEffect: CreateFertilizerTypePayload["phosphorusEffect"] | "";
  potassiumEffect: CreateFertilizerTypePayload["potassiumEffect"] | "";
  phEffect: CreateFertilizerTypePayload["phEffect"] | "";
  soilStructureEffect: CreateFertilizerTypePayload["soilStructureEffect"] | "";
  waterRetentionEffect:
    | CreateFertilizerTypePayload["waterRetentionEffect"]
    | "";
  drainageEffect: CreateFertilizerTypePayload["drainageEffect"] | "";
  recommendedFrequency:
    | CreateFertilizerTypePayload["recommendedFrequency"]
    | "";
  dosageGuidance: string;
  notes: string;
  isActive: boolean;
};

const defaultValues: FertilizerFormValues = {
  slug: "",
  name: "",
  description: "",
  category: "",
  form: "",
  applicationMethod: "",
  riskLevel: "",
  nitrogenEffect: "",
  phosphorusEffect: "",
  potassiumEffect: "",
  phEffect: "",
  soilStructureEffect: "",
  waterRetentionEffect: "",
  drainageEffect: "",
  recommendedFrequency: "",
  dosageGuidance: "",
  notes: "",
  isActive: true,
};

const categoryLabels = {
  ORGANIC: "Organiczny",
  MINERAL: "Mineralny",
  BIO_STIMULANT: "Biostymulator",
  SOIL_AMENDMENT: "Polepszacz gleby",
  PH_ADJUSTER: "Regulator pH",
} as const;

const formLabels = {
  SOLID: "Stały",
  LIQUID: "Płynny",
} as const;

const applicationMethodLabels = {
  TOP_DRESS: "Podsypowo",
  INCORPORATE: "Wymieszanie z glebą",
  WATERING: "Podlewanie",
  FOLIAR: "Dolistnie",
  COMPOST_TEA: "Herbata kompostowa",
} as const;

const riskLevelLabels = {
  LOW: "Niskie",
  MEDIUM: "Średnie",
  HIGH: "Wysokie",
} as const;

const effectLevelLabels = {
  NONE: "Brak",
  LOW: "Niski",
  MEDIUM: "Średni",
  HIGH: "Wysoki",
  VARIABLE: "Zmienny",
} as const;

const phEffectLabels = {
  LOWERS: "Obniża",
  RAISES: "Podnosi",
  NEUTRAL: "Neutralny",
  VARIABLE: "Zmienny",
} as const;

const soilStructureEffectLabels = {
  IMPROVES: "Poprawia",
  NEUTRAL: "Neutralny",
  MAY_WORSEN: "Może pogorszyć",
} as const;

const retentionEffectLabels = {
  DECREASES: "Zmniejsza",
  NEUTRAL: "Neutralny",
  INCREASES: "Zwiększa",
} as const;

const recommendedFrequencyLabels = {
  ONE_TIME: "Jednorazowo",
  WEEKLY: "Co tydzień",
  BIWEEKLY: "Co 2 tygodnie",
  MONTHLY: "Co miesiąc",
  SEASONAL: "Sezonowo",
  AS_NEEDED: "W razie potrzeby",
} as const;

const isLowercaseSlug = (value: string) => /^[a-z0-9-]{2,80}$/.test(value);

export type FertilizerFormProps = {
  initialValues?: Partial<FertilizerFormValues>;
  onSubmit: (payload: CreateFertilizerTypePayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export const FertilizerForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
}: FertilizerFormProps) => {
  const [values, setValues] = useState<FertilizerFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [clientError, setClientError] = useState<string | null>(null);

  const updateValue = <K extends keyof FertilizerFormValues>(
    key: K,
    value: FertilizerFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setClientError(null);

    if (!isLowercaseSlug(values.slug)) {
      setClientError("Slug musi mieć 2-80 znaków i tylko a-z0-9-.");
      return;
    }

    if (values.name.trim().length < 2 || values.name.trim().length > 120) {
      setClientError("Nazwa musi mieć 2-120 znaków.");
      return;
    }

    if (values.description.trim().length < 1) {
      setClientError("Opis jest wymagany.");
      return;
    }

    if (
      !values.category ||
      !values.form ||
      !values.applicationMethod ||
      !values.riskLevel ||
      !values.nitrogenEffect ||
      !values.phosphorusEffect ||
      !values.potassiumEffect ||
      !values.phEffect ||
      !values.soilStructureEffect ||
      !values.waterRetentionEffect ||
      !values.drainageEffect ||
      !values.recommendedFrequency
    ) {
      setClientError("Uzupełnij wszystkie wymagane pola wyboru.");
      return;
    }

    const payload: CreateFertilizerTypePayload = {
      slug: values.slug.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      form: values.form,
      applicationMethod: values.applicationMethod,
      riskLevel: values.riskLevel,
      nitrogenEffect: values.nitrogenEffect,
      phosphorusEffect: values.phosphorusEffect,
      potassiumEffect: values.potassiumEffect,
      phEffect: values.phEffect,
      soilStructureEffect: values.soilStructureEffect,
      waterRetentionEffect: values.waterRetentionEffect,
      drainageEffect: values.drainageEffect,
      recommendedFrequency: values.recommendedFrequency,
      dosageGuidance: values.dosageGuidance.trim() || null,
      notes: values.notes.trim() || null,
      isActive: values.isActive,
    };

    onSubmit(payload);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Podstawy</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Slug</span>
            <span className="text-xs text-zinc-500">
              Unikalny identyfikator w URL i API (2-80 znaków, małe litery,
              cyfry, myślniki).
            </span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.slug}
              onChange={(event) => updateValue("slug", event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nazwa</span>
            <span className="text-xs text-zinc-500">
              Nazwa wyświetlana użytkownikom (2-120 znaków).
            </span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              required
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Opis</span>
          <textarea
            className="min-h-30 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
            required
          />
        </label>
        <label className="mt-4 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300"
            checked={values.isActive}
            onChange={(event) => updateValue("isActive", event.target.checked)}
          />
          <span className="font-medium">Aktywny nawóz</span>
        </label>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Klasyfikacja</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Kategoria</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.category}
              onChange={(event) =>
                updateValue(
                  "category",
                  event.target.value as FertilizerFormValues["category"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {categoryLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Forma</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.form}
              onChange={(event) =>
                updateValue(
                  "form",
                  event.target.value as FertilizerFormValues["form"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerFormOptions.map((option) => (
                <option key={option} value={option}>
                  {formLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Metoda aplikacji</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.applicationMethod}
              onChange={(event) =>
                updateValue(
                  "applicationMethod",
                  event.target
                    .value as FertilizerFormValues["applicationMethod"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerApplicationMethodOptions.map((option) => (
                <option key={option} value={option}>
                  {applicationMethodLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Ryzyko</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.riskLevel}
              onChange={(event) =>
                updateValue(
                  "riskLevel",
                  event.target.value as FertilizerFormValues["riskLevel"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerRiskLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {riskLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Efekty odżywcze</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Azot</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.nitrogenEffect}
              onChange={(event) =>
                updateValue(
                  "nitrogenEffect",
                  event.target.value as FertilizerFormValues["nitrogenEffect"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerEffectLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {effectLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Fosfor</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.phosphorusEffect}
              onChange={(event) =>
                updateValue(
                  "phosphorusEffect",
                  event.target
                    .value as FertilizerFormValues["phosphorusEffect"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerEffectLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {effectLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Potas</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.potassiumEffect}
              onChange={(event) =>
                updateValue(
                  "potassiumEffect",
                  event.target.value as FertilizerFormValues["potassiumEffect"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerEffectLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {effectLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Wpływ na glebę</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Wpływ na pH</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.phEffect}
              onChange={(event) =>
                updateValue(
                  "phEffect",
                  event.target.value as FertilizerFormValues["phEffect"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerPhEffectOptions.map((option) => (
                <option key={option} value={option}>
                  {phEffectLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Struktura gleby</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.soilStructureEffect}
              onChange={(event) =>
                updateValue(
                  "soilStructureEffect",
                  event.target
                    .value as FertilizerFormValues["soilStructureEffect"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerSoilStructureEffectOptions.map((option) => (
                <option key={option} value={option}>
                  {soilStructureEffectLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Retencja wody</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.waterRetentionEffect}
              onChange={(event) =>
                updateValue(
                  "waterRetentionEffect",
                  event.target
                    .value as FertilizerFormValues["waterRetentionEffect"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerRetentionEffectOptions.map((option) => (
                <option key={option} value={option}>
                  {retentionEffectLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Drenaż</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.drainageEffect}
              onChange={(event) =>
                updateValue(
                  "drainageEffect",
                  event.target.value as FertilizerFormValues["drainageEffect"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerRetentionEffectOptions.map((option) => (
                <option key={option} value={option}>
                  {retentionEffectLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Zalecenia</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Częstotliwość</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.recommendedFrequency}
              onChange={(event) =>
                updateValue(
                  "recommendedFrequency",
                  event.target
                    .value as FertilizerFormValues["recommendedFrequency"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {fertilizerRecommendedFrequencyOptions.map((option) => (
                <option key={option} value={option}>
                  {recommendedFrequencyLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Dawkowanie</span>
            <textarea
              className="min-h-24 rounded-lg border border-zinc-200 px-3 py-2"
              value={values.dosageGuidance}
              onChange={(event) =>
                updateValue("dosageGuidance", event.target.value)
              }
              placeholder="Opcjonalnie"
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Uwagi</span>
          <textarea
            className="min-h-24 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.notes}
            onChange={(event) => updateValue("notes", event.target.value)}
            placeholder="Opcjonalnie"
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
