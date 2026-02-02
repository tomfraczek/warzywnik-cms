"use client";

import { useState } from "react";
import type { CreateSoilPayload } from "@/app/soils/api/api.types";
import {
  demandLevelOptions,
  drainageLevelOptions,
  soilStructureOptions,
  soilTypeOptions,
} from "@/app/soils/api/api.types";

export type SoilFormValues = {
  slug: string;
  name: string;
  description: string;
  soilType: CreateSoilPayload["soilType"] | "";
  structure: CreateSoilPayload["structure"] | "";
  waterRetention: CreateSoilPayload["waterRetention"] | "";
  drainage: CreateSoilPayload["drainage"] | "";
  fertilityLevel: CreateSoilPayload["fertilityLevel"] | "";
  phMin: string;
  phMax: string;
  advantages: string[];
  disadvantages: string[];
  improvementTips: string[];
};

const soilTypeLabels = {
  SANDY: "Piaszczysta",
  LOAMY: "Gliniasta",
  CLAY: "Ilasta",
  SILT: "Pyłowa",
  PEAT: "Torfowa",
  CHALK: "Wapienna",
  COMPOST_RICH: "Kompostowa",
  OTHER: "Inna",
} as const;

const soilStructureLabels = {
  loose: "Luźna",
  crumbly: "Gruzełkowata",
  compact: "Zbita",
} as const;

const demandLevelLabels = {
  low: "Niskie",
  medium: "Średnie",
  high: "Wysokie",
} as const;

const drainageLevelLabels = {
  poor: "Słaby",
  medium: "Średni",
  good: "Dobry",
} as const;

const defaultValues: SoilFormValues = {
  slug: "",
  name: "",
  description: "",
  soilType: "",
  structure: "",
  waterRetention: "",
  drainage: "",
  fertilityLevel: "",
  phMin: "",
  phMax: "",
  advantages: [],
  disadvantages: [],
  improvementTips: [],
};

const isLowercaseSlug = (value: string) => /^[a-z0-9-]{2,}$/.test(value);

const toNumberOrNull = (value: string) => {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeList = (items: string[]) =>
  items.map((item) => item.trim()).filter(Boolean);

export type SoilFormProps = {
  initialValues?: Partial<SoilFormValues>;
  onSubmit: (payload: CreateSoilPayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export const SoilForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
}: SoilFormProps) => {
  const [values, setValues] = useState<SoilFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [clientError, setClientError] = useState<string | null>(null);

  const updateValue = <K extends keyof SoilFormValues>(
    key: K,
    value: SoilFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateListValue = (
    key: "advantages" | "disadvantages" | "improvementTips",
    index: number,
    value: string,
  ) => {
    const next = [...values[key]];
    next[index] = value;
    updateValue(key, next);
  };

  const addListItem = (
    key: "advantages" | "disadvantages" | "improvementTips",
  ) => {
    updateValue(key, [...values[key], ""]);
  };

  const removeListItem = (
    key: "advantages" | "disadvantages" | "improvementTips",
    index: number,
  ) => {
    updateValue(
      key,
      values[key].filter((_, idx) => idx !== index),
    );
  };

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
    if (values.description.trim().length < 1) {
      setClientError("Opis jest wymagany.");
      return;
    }

    const phMin = toNumberOrNull(values.phMin);
    const phMax = toNumberOrNull(values.phMax);

    if (phMin !== null && (phMin < 0 || phMin > 14)) {
      setClientError("pH minimalne musi być w zakresie 0-14.");
      return;
    }
    if (phMax !== null && (phMax < 0 || phMax > 14)) {
      setClientError("pH maksymalne musi być w zakresie 0-14.");
      return;
    }
    if (phMin !== null && phMax !== null && phMin > phMax) {
      setClientError("pH minimalne nie może być większe niż maksymalne.");
      return;
    }

    if (
      !values.soilType ||
      !values.structure ||
      !values.waterRetention ||
      !values.drainage ||
      !values.fertilityLevel
    ) {
      setClientError("Uzupełnij wszystkie wymagane parametry gleby.");
      return;
    }

    const payload: CreateSoilPayload = {
      slug: values.slug.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      soilType: values.soilType,
      structure: values.structure,
      waterRetention: values.waterRetention,
      drainage: values.drainage,
      fertilityLevel: values.fertilityLevel,
      phMin,
      phMax,
      advantages: normalizeList(values.advantages),
      disadvantages: normalizeList(values.disadvantages),
      improvementTips: normalizeList(values.improvementTips),
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
              Unikalny identyfikator techniczny używany w URL i API. Tylko małe
              litery, cyfry i myślniki (np. „gleba-piaszczysta”).
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
              Nazwa wyświetlana użytkownikom (np. „Gleba piaszczysta”).
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
          <span className="text-xs text-zinc-500">
            Krótki opis czym charakteryzuje się ta gleba i w czym jest
            podobna/różna od innych.
          </span>
          <textarea
            className="min-h-30 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
            required
          />
        </label>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Parametry</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Typ gleby</span>
            <span className="text-xs text-zinc-500">
              Ogólny typ gleby: lekka (piaszczysta), średnia (ogrodowa), ciężka
              (gliniasta).
            </span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.soilType}
              onChange={(event) =>
                updateValue(
                  "soilType",
                  event.target.value as SoilFormValues["soilType"],
                )
              }
            >
              <option value="">Wybierz</option>
              {soilTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {soilTypeLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Struktura</span>
            <span className="text-xs text-zinc-500">
              Struktura gleby: luźna, gruzełkowata (najlepsza), lub zbita.
            </span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.structure}
              onChange={(event) =>
                updateValue(
                  "structure",
                  event.target.value as SoilFormValues["structure"],
                )
              }
            >
              <option value="">Wybierz</option>
              {soilStructureOptions.map((option) => (
                <option key={option} value={option}>
                  {soilStructureLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Retencja wody</span>
            <span className="text-xs text-zinc-500">
              Jak dobrze gleba zatrzymuje wodę: niska oznacza, że szybko
              przesycha.
            </span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.waterRetention}
              onChange={(event) =>
                updateValue(
                  "waterRetention",
                  event.target.value as SoilFormValues["waterRetention"],
                )
              }
            >
              <option value="">Wybierz</option>
              {demandLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {demandLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Drenaż</span>
            <span className="text-xs text-zinc-500">
              Jak dobrze gleba odprowadza nadmiar wody: słaby drenaż sprzyja
              zastojom wody.
            </span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.drainage}
              onChange={(event) =>
                updateValue(
                  "drainage",
                  event.target.value as SoilFormValues["drainage"],
                )
              }
            >
              <option value="">Wybierz</option>
              {drainageLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {drainageLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Poziom żyzności</span>
            <span className="text-xs text-zinc-500">
              Ogólna żyzność: ile naturalnie ma składników odżywczych i jak
              łatwo utrzymać dobre plony.
            </span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.fertilityLevel}
              onChange={(event) =>
                updateValue(
                  "fertilityLevel",
                  event.target.value as SoilFormValues["fertilityLevel"],
                )
              }
            >
              <option value="">Wybierz</option>
              {demandLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {demandLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">pH min</span>
              <span className="text-xs text-zinc-500">
                Typowy zakres pH dla tej gleby (0–14). Jeśli podajesz zakres,
                min nie może być większe niż max.
              </span>
              <input
                className="rounded-lg border border-zinc-200 px-3 py-2"
                type="number"
                min={0}
                max={14}
                step="0.1"
                value={values.phMin}
                onChange={(event) => updateValue("phMin", event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">pH max</span>
              <span className="text-xs text-zinc-500">
                Typowy zakres pH dla tej gleby (0–14). Jeśli podajesz zakres,
                min nie może być większe niż max.
              </span>
              <input
                className="rounded-lg border border-zinc-200 px-3 py-2"
                type="number"
                min={0}
                max={14}
                step="0.1"
                value={values.phMax}
                onChange={(event) => updateValue("phMax", event.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Zalety</h2>
            <p className="text-xs text-zinc-500">
              Lista krótkich punktów: co jest łatwiejsze dzięki tej glebie (1
              zdanie na punkt).
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            onClick={() => addListItem("advantages")}
          >
            Dodaj punkt
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {values.advantages.length === 0 && (
            <p className="text-sm text-zinc-500">Brak punktów.</p>
          )}
          {values.advantages.map((item, index) => (
            <div key={`adv-${index}`} className="flex items-center gap-3">
              <input
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={item}
                onChange={(event) =>
                  updateListValue("advantages", index, event.target.value)
                }
              />
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() => removeListItem("advantages", index)}
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Wady</h2>
            <p className="text-xs text-zinc-500">
              Lista krótkich punktów: typowe problemy tej gleby (1 zdanie na
              punkt).
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            onClick={() => addListItem("disadvantages")}
          >
            Dodaj punkt
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {values.disadvantages.length === 0 && (
            <p className="text-sm text-zinc-500">Brak punktów.</p>
          )}
          {values.disadvantages.map((item, index) => (
            <div key={`dis-${index}`} className="flex items-center gap-3">
              <input
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={item}
                onChange={(event) =>
                  updateListValue("disadvantages", index, event.target.value)
                }
              />
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() => removeListItem("disadvantages", index)}
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Wskazówki poprawy
            </h2>
            <p className="text-xs text-zinc-500">
              Lista praktycznych porad: co zrobić, aby poprawić tę glebę (1
              zdanie na punkt).
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            onClick={() => addListItem("improvementTips")}
          >
            Dodaj punkt
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {values.improvementTips.length === 0 && (
            <p className="text-sm text-zinc-500">Brak punktów.</p>
          )}
          {values.improvementTips.map((item, index) => (
            <div key={`tip-${index}`} className="flex items-center gap-3">
              <input
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={item}
                onChange={(event) =>
                  updateListValue("improvementTips", index, event.target.value)
                }
              />
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() => removeListItem("improvementTips", index)}
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      </section>

      {(clientError || errorMessage) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {clientError || errorMessage}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Zapisywanie..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
