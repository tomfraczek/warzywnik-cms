"use client";

import { useMemo, useState } from "react";
import type {
  CreateVegetablePayload,
  FertilizationStage,
  Month,
  SowingMethod,
  SowingMethodType,
} from "@/app/api/api.types";
import {
  demandLevelOptions,
  monthOptions,
  soilTypeOptions,
  sunExposureOptions,
  sowingMethodOptions,
} from "@/app/api/api.types";
import { useGetPests } from "@/app/api/queries/pests/useGetPests";
import { useGetDiseases } from "@/app/api/queries/diseases/useGetDiseases";
import { useGetVegetables } from "@/app/api/queries/vegetables/useGetVegetables";

export type VegetableFormValues = {
  slug: string;
  name: string;
  description: string;
  latinName: string;
  imageUrl: string;
  sunExposure: "" | CreateVegetablePayload["sunExposure"];
  waterDemand: "" | CreateVegetablePayload["waterDemand"];
  soilType: "" | CreateVegetablePayload["soilType"];
  soilPHMin: string;
  soilPHMax: string;
  nutrientDemand: "" | CreateVegetablePayload["nutrientDemand"];
  sowingMethods: Array<
    Omit<
      SowingMethod,
      | "germinationDaysMin"
      | "germinationDaysMax"
      | "seedDepthCm"
      | "rowSpacingCm"
      | "plantSpacingCm"
    > & {
      germinationDaysMin: string;
      germinationDaysMax: string;
      seedDepthCm: string;
      rowSpacingCm: string;
      plantSpacingCm: string;
    }
  >;
  timeToHarvestDaysMin: string;
  timeToHarvestDaysMax: string;
  successionSowing: boolean;
  successionIntervalDays: string;
  harvestStartMonth: "" | Month;
  harvestEndMonth: "" | Month;
  harvestSigns: string;
  fertilizationStages: Array<
    Omit<FertilizationStage, "timing"> & { timing: string }
  >;
  commonPestIds: string[];
  commonDiseaseIds: string[];
  goodCompanionIds: string[];
  badCompanionIds: string[];
};

const createEmptySowingMethod =
  (): VegetableFormValues["sowingMethods"][number] => ({
    method: "direct_sow",
    startMonth: "march",
    endMonth: "april",
    underCover: false,
    germinationDaysMin: "",
    germinationDaysMax: "",
    seedDepthCm: "",
    rowSpacingCm: "",
    plantSpacingCm: "",
    transplantingStartMonth: null,
    transplantingEndMonth: null,
  });

const createEmptyFertilizationStage =
  (): VegetableFormValues["fertilizationStages"][number] => ({
    name: "",
    timing: "",
    description: "",
  });

const toNumberOrNull = (value: string) => {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toOptionalString = (value: string) => {
  if (value.trim() === "") {
    return null;
  }
  return value;
};

const isLowercaseSlug = (value: string) => /^[a-z0-9-]{2,}$/.test(value);

const defaultValues: VegetableFormValues = {
  slug: "",
  name: "",
  description: "",
  latinName: "",
  imageUrl: "",
  sunExposure: "",
  waterDemand: "",
  soilType: "",
  soilPHMin: "",
  soilPHMax: "",
  nutrientDemand: "",
  sowingMethods: [],
  timeToHarvestDaysMin: "",
  timeToHarvestDaysMax: "",
  successionSowing: false,
  successionIntervalDays: "",
  harvestStartMonth: "",
  harvestEndMonth: "",
  harvestSigns: "",
  fertilizationStages: [],
  commonPestIds: [],
  commonDiseaseIds: [],
  goodCompanionIds: [],
  badCompanionIds: [],
};

export type VegetableFormProps = {
  initialValues?: Partial<VegetableFormValues>;
  onSubmit: (payload: CreateVegetablePayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  excludeCompanionId?: string | null;
};

export const VegetableForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
  excludeCompanionId,
}: VegetableFormProps) => {
  const [values, setValues] = useState<VegetableFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [clientError, setClientError] = useState<string | null>(null);

  const listParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const { data: pestsData } = useGetPests(listParams);
  const { data: diseasesData } = useGetDiseases(listParams);
  const { data: vegetablesData } = useGetVegetables(listParams);

  const companionOptions = useMemo(() => {
    const items = vegetablesData?.items ?? [];
    if (!excludeCompanionId) {
      return items;
    }
    return items.filter((item) => item.id !== excludeCompanionId);
  }, [vegetablesData, excludeCompanionId]);

  const updateValue = <K extends keyof VegetableFormValues>(
    key: K,
    value: VegetableFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
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

    const soilPHMin = toNumberOrNull(values.soilPHMin);
    const soilPHMax = toNumberOrNull(values.soilPHMax);
    if (soilPHMin !== null && (soilPHMin < 0 || soilPHMin > 14)) {
      setClientError("pH minimalne musi być w zakresie 0-14.");
      return;
    }
    if (soilPHMax !== null && (soilPHMax < 0 || soilPHMax > 14)) {
      setClientError("pH maksymalne musi być w zakresie 0-14.");
      return;
    }
    if (soilPHMin !== null && soilPHMax !== null && soilPHMin > soilPHMax) {
      setClientError("pH minimalne nie może być większe niż maksymalne.");
      return;
    }

    const timeToHarvestDaysMin = toNumberOrNull(values.timeToHarvestDaysMin);
    const timeToHarvestDaysMax = toNumberOrNull(values.timeToHarvestDaysMax);
    if (timeToHarvestDaysMin !== null && timeToHarvestDaysMin < 0) {
      setClientError("Minimalny czas zbioru nie może być ujemny.");
      return;
    }
    if (timeToHarvestDaysMax !== null && timeToHarvestDaysMax < 0) {
      setClientError("Maksymalny czas zbioru nie może być ujemny.");
      return;
    }
    if (
      timeToHarvestDaysMin !== null &&
      timeToHarvestDaysMax !== null &&
      timeToHarvestDaysMin > timeToHarvestDaysMax
    ) {
      setClientError(
        "Minimalny czas zbioru nie może być większy niż maksymalny.",
      );
      return;
    }

    if (values.successionSowing) {
      const interval = toNumberOrNull(values.successionIntervalDays);
      if (!interval || interval <= 0) {
        setClientError("Podaj dodatni interwał dla siewu sukcesywnego.");
        return;
      }
    }

    const sowingMethods = values.sowingMethods.length
      ? values.sowingMethods.map((method) => ({
          ...method,
          germinationDaysMin: toNumberOrNull(method.germinationDaysMin),
          germinationDaysMax: toNumberOrNull(method.germinationDaysMax),
          seedDepthCm: toNumberOrNull(method.seedDepthCm),
          rowSpacingCm: toNumberOrNull(method.rowSpacingCm),
          plantSpacingCm: toNumberOrNull(method.plantSpacingCm),
        }))
      : null;

    const fertilizationStages = values.fertilizationStages.length
      ? values.fertilizationStages.map((stage) => ({
          ...stage,
          timing: toOptionalString(stage.timing),
        }))
      : null;

    const payload: CreateVegetablePayload = {
      slug: values.slug.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      latinName: toOptionalString(values.latinName),
      imageUrl: toOptionalString(values.imageUrl),
      sunExposure: values.sunExposure || null,
      waterDemand: values.waterDemand || null,
      soilType: values.soilType || null,
      soilPHMin,
      soilPHMax,
      nutrientDemand: values.nutrientDemand || null,
      sowingMethods,
      timeToHarvestDaysMin,
      timeToHarvestDaysMax,
      successionSowing: values.successionSowing,
      successionIntervalDays: values.successionSowing
        ? toNumberOrNull(values.successionIntervalDays)
        : null,
      harvestStartMonth: values.harvestStartMonth || null,
      harvestEndMonth: values.harvestEndMonth || null,
      harvestSigns: toOptionalString(values.harvestSigns),
      fertilizationStages,
      commonPestIds: values.commonPestIds,
      commonDiseaseIds: values.commonDiseaseIds,
      goodCompanionIds: values.goodCompanionIds,
      badCompanionIds: values.badCompanionIds,
    };

    onSubmit(payload);
  };

  const toggleSelection = (current: string[], value: string) => {
    if (current.includes(value)) {
      return current.filter((item) => item !== value);
    }
    return [...current, value];
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Basic</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
            Nazwa łacińska
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.latinName}
              onChange={(event) => updateValue("latinName", event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Image URL
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.imageUrl}
              onChange={(event) => updateValue("imageUrl", event.target.value)}
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
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Requirements</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            Sun exposure
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.sunExposure ?? ""}
              onChange={(event) =>
                updateValue(
                  "sunExposure",
                  event.target.value as
                    | ""
                    | CreateVegetablePayload["sunExposure"],
                )
              }
            >
              <option value="">Brak</option>
              {sunExposureOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Water demand
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.waterDemand ?? ""}
              onChange={(event) =>
                updateValue(
                  "waterDemand",
                  event.target.value as
                    | ""
                    | CreateVegetablePayload["waterDemand"],
                )
              }
            >
              <option value="">Brak</option>
              {demandLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Soil type
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.soilType ?? ""}
              onChange={(event) =>
                updateValue(
                  "soilType",
                  event.target.value as "" | CreateVegetablePayload["soilType"],
                )
              }
            >
              <option value="">Brak</option>
              {soilTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            Nutrient demand
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.nutrientDemand ?? ""}
              onChange={(event) =>
                updateValue(
                  "nutrientDemand",
                  event.target.value as
                    | ""
                    | CreateVegetablePayload["nutrientDemand"],
                )
              }
            >
              <option value="">Brak</option>
              {demandLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Soil pH min
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              type="number"
              min={0}
              max={14}
              step="0.1"
              value={values.soilPHMin}
              onChange={(event) => updateValue("soilPHMin", event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Soil pH max
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              type="number"
              min={0}
              max={14}
              step="0.1"
              value={values.soilPHMax}
              onChange={(event) => updateValue("soilPHMax", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Sowing methods
          </h2>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            onClick={() =>
              updateValue("sowingMethods", [
                ...values.sowingMethods,
                createEmptySowingMethod(),
              ])
            }
          >
            Dodaj metodę
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {values.sowingMethods.length === 0 && (
            <p className="text-sm text-zinc-500">Brak metod siewu.</p>
          )}
          {values.sowingMethods.map((method, index) => (
            <div
              key={`sowing-${index}`}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Metoda #{index + 1}</p>
                <button
                  type="button"
                  className="text-xs text-red-500"
                  onClick={() =>
                    updateValue(
                      "sowingMethods",
                      values.sowingMethods.filter((_, idx) => idx !== index),
                    )
                  }
                >
                  Usuń
                </button>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-2 text-sm">
                  Method
                  <select
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    value={method.method}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        method: event.target.value as SowingMethodType,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  >
                    {sowingMethodOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Start month
                  <select
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    value={method.startMonth}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        startMonth: event.target.value as Month,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  >
                    {monthOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  End month
                  <select
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    value={method.endMonth}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        endMonth: event.target.value as Month,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  >
                    {monthOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={method.underCover}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        underCover: event.target.checked,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  />
                  Under cover
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Germination days min
                  <input
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    type="number"
                    value={method.germinationDaysMin}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        germinationDaysMin: event.target.value,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Germination days max
                  <input
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    type="number"
                    value={method.germinationDaysMax}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        germinationDaysMax: event.target.value,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-2 text-sm">
                  Seed depth (cm)
                  <input
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    type="number"
                    value={method.seedDepthCm}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        seedDepthCm: event.target.value,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Row spacing (cm)
                  <input
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    type="number"
                    value={method.rowSpacingCm}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        rowSpacingCm: event.target.value,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Plant spacing (cm)
                  <input
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    type="number"
                    value={method.plantSpacingCm}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        plantSpacingCm: event.target.value,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  Transplant start
                  <select
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    value={method.transplantingStartMonth ?? ""}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        transplantingStartMonth: event.target.value
                          ? (event.target.value as Month)
                          : null,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  >
                    <option value="">Brak</option>
                    {monthOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Transplant end
                  <select
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    value={method.transplantingEndMonth ?? ""}
                    onChange={(event) => {
                      const next = [...values.sowingMethods];
                      next[index] = {
                        ...next[index],
                        transplantingEndMonth: event.target.value
                          ? (event.target.value as Month)
                          : null,
                      };
                      updateValue("sowingMethods", next);
                    }}
                  >
                    <option value="">Brak</option>
                    {monthOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Harvest</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            Start month
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.harvestStartMonth}
              onChange={(event) =>
                updateValue(
                  "harvestStartMonth",
                  event.target.value as "" | Month,
                )
              }
            >
              <option value="">Brak</option>
              {monthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            End month
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.harvestEndMonth}
              onChange={(event) =>
                updateValue("harvestEndMonth", event.target.value as "" | Month)
              }
            >
              <option value="">Brak</option>
              {monthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Harvest signs
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.harvestSigns}
              onChange={(event) =>
                updateValue("harvestSigns", event.target.value)
              }
            />
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Time to harvest min (days)
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              type="number"
              value={values.timeToHarvestDaysMin}
              onChange={(event) =>
                updateValue("timeToHarvestDaysMin", event.target.value)
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Time to harvest max (days)
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              type="number"
              value={values.timeToHarvestDaysMax}
              onChange={(event) =>
                updateValue("timeToHarvestDaysMax", event.target.value)
              }
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Succession sowing
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.successionSowing}
              onChange={(event) =>
                updateValue("successionSowing", event.target.checked)
              }
            />
            Włącz siew sukcesywny
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Interval (days)
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              type="number"
              value={values.successionIntervalDays}
              onChange={(event) =>
                updateValue("successionIntervalDays", event.target.value)
              }
              disabled={!values.successionSowing}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Fertilization stages
          </h2>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            onClick={() =>
              updateValue("fertilizationStages", [
                ...values.fertilizationStages,
                createEmptyFertilizationStage(),
              ])
            }
          >
            Dodaj etap
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {values.fertilizationStages.length === 0 && (
            <p className="text-sm text-zinc-500">Brak etapów nawożenia.</p>
          )}
          {values.fertilizationStages.map((stage, index) => (
            <div
              key={`fert-${index}`}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Etap #{index + 1}</p>
                <button
                  type="button"
                  className="text-xs text-red-500"
                  onClick={() =>
                    updateValue(
                      "fertilizationStages",
                      values.fertilizationStages.filter(
                        (_, idx) => idx !== index,
                      ),
                    )
                  }
                >
                  Usuń
                </button>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  Nazwa
                  <input
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    value={stage.name}
                    onChange={(event) => {
                      const next = [...values.fertilizationStages];
                      next[index] = {
                        ...next[index],
                        name: event.target.value,
                      };
                      updateValue("fertilizationStages", next);
                    }}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Timing
                  <input
                    className="rounded-lg border border-zinc-200 px-3 py-2"
                    value={stage.timing}
                    onChange={(event) => {
                      const next = [...values.fertilizationStages];
                      next[index] = {
                        ...next[index],
                        timing: event.target.value,
                      };
                      updateValue("fertilizationStages", next);
                    }}
                  />
                </label>
              </div>
              <label className="mt-3 flex flex-col gap-2 text-sm">
                Opis
                <textarea
                  className="min-h-20 rounded-lg border border-zinc-200 px-3 py-2"
                  value={stage.description}
                  onChange={(event) => {
                    const next = [...values.fertilizationStages];
                    next[index] = {
                      ...next[index],
                      description: event.target.value,
                    };
                    updateValue("fertilizationStages", next);
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Relations</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-zinc-700">Common pests</p>
            <div className="mt-2 space-y-2">
              {(pestsData?.items ?? []).map((pest) => (
                <label
                  key={pest.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={values.commonPestIds.includes(pest.id)}
                    onChange={() =>
                      updateValue(
                        "commonPestIds",
                        toggleSelection(values.commonPestIds, pest.id),
                      )
                    }
                  />
                  {pest.name}
                </label>
              ))}
              {pestsData?.items?.length === 0 && (
                <p className="text-sm text-zinc-500">Brak danych.</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700">Common diseases</p>
            <div className="mt-2 space-y-2">
              {(diseasesData?.items ?? []).map((disease) => (
                <label
                  key={disease.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={values.commonDiseaseIds.includes(disease.id)}
                    onChange={() =>
                      updateValue(
                        "commonDiseaseIds",
                        toggleSelection(values.commonDiseaseIds, disease.id),
                      )
                    }
                  />
                  {disease.name}
                </label>
              ))}
              {diseasesData?.items?.length === 0 && (
                <p className="text-sm text-zinc-500">Brak danych.</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700">Good companions</p>
            <div className="mt-2 space-y-2">
              {companionOptions.map((companion) => (
                <label
                  key={companion.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={values.goodCompanionIds.includes(companion.id)}
                    onChange={() =>
                      updateValue(
                        "goodCompanionIds",
                        toggleSelection(values.goodCompanionIds, companion.id),
                      )
                    }
                  />
                  {companion.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700">Bad companions</p>
            <div className="mt-2 space-y-2">
              {companionOptions.map((companion) => (
                <label
                  key={companion.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={values.badCompanionIds.includes(companion.id)}
                    onChange={() =>
                      updateValue(
                        "badCompanionIds",
                        toggleSelection(values.badCompanionIds, companion.id),
                      )
                    }
                  />
                  {companion.name}
                </label>
              ))}
            </div>
          </div>
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
