"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import type {
  ActionRuleSchedule,
  ActionRuleTrigger,
  BotanicalFamily,
  CreateVegetablePayload,
  FertilizationStage,
  Month,
  NutrientNeeds,
  PlantingStartMethod,
  RotationGroup,
  SowingMethod,
  SowingMethodType,
} from "@/app/api/api.types";
import {
  botanicalFamilyOptions,
  demandLevelOptions,
  dominantNutrientDemandOptions,
  monthOptions,
  nutrientNeedsOptions,
  rotationGroupOptions,
  sowingMethodOptions,
  sunExposureOptions,
} from "@/app/api/api.types";
import { getDiseases, getPests, getVegetables } from "@/app/api/api.requests";
import { getSoils } from "@/app/soils/api/api.requests";
import { MediaLibraryModal } from "@/app/components/MediaLibraryModal";
import type { MediaLibraryItem } from "@/app/api/api.types";
import {
  VegetableActionRulesSection,
  type VegetableActionRuleFormValue,
} from "@/app/components/VegetableActionRulesSection";

import {
  sunExposureLabels,
  botanicalFamilyLabels,
  demandLevelLabels,
  monthLabels,
  nutrientNeedsLabels,
  rotationGroupLabels,
  sowingMethodLabels,
} from "../utils/labels";

export type VegetableFormValues = {
  name: string;
  description: string;
  latinName: string;
  family: "" | BotanicalFamily;
  nutrientNeeds: "" | NutrientNeeds;
  rotationGroup: "" | RotationGroup;
  imageUrl: string;
  sunExposure: "" | CreateVegetablePayload["sunExposure"];
  waterDemand: "" | CreateVegetablePayload["waterDemand"];
  nutrientDemand: "" | CreateVegetablePayload["nutrientDemand"];
  recommendedSoilSlugs: string[];
  minSoilDepthCm: string;
  dominantNutrientDemand:
    | ""
    | NonNullable<CreateVegetablePayload["dominantNutrientDemand"]>;
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
  actionRules: VegetableActionRuleFormValue[];
  rulesVersion: string;
  commonPestSlugs: string[];
  commonDiseaseSlugs: string[];
  goodCompanionSlugs: string[];
  badCompanionSlugs: string[];
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

type PaginatedListResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

const MAX_DICTIONARY_PAGES = 500;

const fetchAllPages = async <T,>(
  fetchPage: (page: number) => Promise<PaginatedListResponse<T>>,
) => {
  const firstPage = await fetchPage(1);
  const allItems = [...firstPage.items];

  if (firstPage.limit <= 0 || firstPage.total <= firstPage.items.length) {
    return allItems;
  }

  const totalPages = Math.ceil(firstPage.total / firstPage.limit);
  const lastPage = Math.min(totalPages, MAX_DICTIONARY_PAGES);

  for (let page = 2; page <= lastPage; page += 1) {
    const nextPage = await fetchPage(page);
    allItems.push(...nextPage.items);

    if (allItems.length >= firstPage.total) {
      break;
    }
  }

  return allItems;
};

const normalizeRelationValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const getRelationValue = (item: { id?: unknown; slug?: unknown }) =>
  normalizeRelationValue(item.slug) || normalizeRelationValue(item.id);

const isValidRelationValue = (value: unknown) =>
  normalizeRelationValue(value).length > 0;

const parseInteger = (value: string) => {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    return null;
  }

  return parsed;
};

const defaultValues: VegetableFormValues = {
  name: "",
  description: "",
  latinName: "",
  family: "",
  nutrientNeeds: "",
  rotationGroup: "",
  imageUrl: "",
  sunExposure: "",
  waterDemand: "",
  nutrientDemand: "",
  recommendedSoilSlugs: [],
  minSoilDepthCm: "",
  dominantNutrientDemand: "",
  sowingMethods: [],
  timeToHarvestDaysMin: "",
  timeToHarvestDaysMax: "",
  successionSowing: false,
  successionIntervalDays: "",
  harvestStartMonth: "",
  harvestEndMonth: "",
  harvestSigns: "",
  fertilizationStages: [],
  actionRules: [],
  rulesVersion: "",
  commonPestSlugs: [],
  commonDiseaseSlugs: [],
  goodCompanionSlugs: [],
  badCompanionSlugs: [],
};

export type VegetableFormProps = {
  formId?: string;
  initialValues?: Partial<VegetableFormValues>;
  onSubmit: (payload: CreateVegetablePayload, imageFile: File | null) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  excludeCompanionId?: string | null;
  onDeleteImage?: () => Promise<void>;
  isDeletingImage?: boolean;
  onAssignImageFromLibrary?: (url: string) => Promise<void> | void;
  onUploadImage?: (file: File) => Promise<string | null>;
  isCustomized?: boolean;
  isResettingCustomization?: boolean;
  onResetCustomization?: () => void;
};

export const VegetableForm = ({
  formId,
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
  isCustomized,
  isResettingCustomization,
  onResetCustomization,
  excludeCompanionId,
  onDeleteImage,
  isDeletingImage,
  onAssignImageFromLibrary,
  onUploadImage,
}: VegetableFormProps) => {
  const [values, setValues] = useState<VegetableFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const syncedRef = useRef(false);
  useEffect(() => {
    if (initialValues && !syncedRef.current) {
      syncedRef.current = true;
      setValues({ ...defaultValues, ...initialValues });
    }
  }, [initialValues]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUrlValid, setImageUrlValid] = useState<boolean | null>(null);
  const [imageUrlChecking, setImageUrlChecking] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const { data: pestItems = [] } = useQuery({
    queryKey: ["pests", "all-for-vegetable-form"],
    queryFn: () => fetchAllPages((page) => getPests({ page })),
  });

  const { data: diseaseItems = [] } = useQuery({
    queryKey: ["diseases", "all-for-vegetable-form"],
    queryFn: () => fetchAllPages((page) => getDiseases({ page })),
  });

  const { data: vegetableItems = [] } = useQuery({
    queryKey: ["vegetables", "all-for-vegetable-form"],
    queryFn: () => fetchAllPages((page) => getVegetables({ page })),
  });

  const { data: soilItems = [], isLoading: soilsLoading } = useQuery({
    queryKey: ["soils", "all-for-vegetable-form"],
    queryFn: () => fetchAllPages((page) => getSoils({ page })),
  });

  const companionOptions = useMemo(() => {
    const items = vegetableItems;
    if (!excludeCompanionId) {
      return items;
    }
    return items.filter((item) => item.id !== excludeCompanionId);
  }, [vegetableItems, excludeCompanionId]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateImageUrl = (url: string) => {
    if (!isValidUrl(url)) {
      setImageUrlValid(false);
      return;
    }
    setImageUrlChecking(true);
    const img = new window.Image();
    img.onload = () => {
      setImageUrlValid(true);
      setImageUrlChecking(false);
    };
    img.onerror = () => {
      setImageUrlValid(false);
      setImageUrlChecking(false);
    };
    img.src = url;
  };

  const updateValue = <K extends keyof VegetableFormValues>(
    key: K,
    value: VegetableFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "imageUrl") {
      setImageUrlValid(null);
      if (typeof value === "string" && value.trim()) {
        validateImageUrl(value.trim());
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);

    try {
      if (values.name.trim().length < 2) {
        setClientError("Nazwa musi mieć co najmniej 2 znaki.");
        return;
      }
      if (values.description.trim().length < 1) {
        setClientError("Opis jest wymagany.");
        return;
      }

      let timeToHarvestDaysMin = toNumberOrNull(values.timeToHarvestDaysMin);
      let timeToHarvestDaysMax = toNumberOrNull(values.timeToHarvestDaysMax);
      if (typeof timeToHarvestDaysMin !== "number") timeToHarvestDaysMin = null;
      if (typeof timeToHarvestDaysMax !== "number") timeToHarvestDaysMax = null;
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
        if (interval === null || interval < 0) {
          setClientError("Podaj interwał >= 0 dla siewu sukcesywnego.");
          return;
        }
      }

      if (
        values.recommendedSoilSlugs.some(
          (soilId) => !isValidRelationValue(soilId),
        )
      ) {
        setClientError(
          "Każda rekomendowana gleba musi mieć poprawną wartość relacji.",
        );
        return;
      }

      const normalizedActionRules = values.actionRules.map((rule, index) => {
        if (!isValidRelationValue(rule.actionTemplateSlug)) {
          throw new Error(
            `Reguła #${index + 1}: ActionTemplate musi mieć poprawną wartość relacji.`,
          );
        }

        const offsetDays = parseInteger(rule.offsetDays);
        if (offsetDays === null || offsetDays < 0) {
          throw new Error(
            `Reguła #${index + 1}: offsetDays musi być liczbą całkowitą >= 0.`,
          );
        }

        const schedule = rule.schedule as ActionRuleSchedule;
        let everyNDays: number | null = null;

        if (schedule === "EVERY_N_DAYS") {
          everyNDays = parseInteger(rule.everyNDays);
          if (everyNDays === null || everyNDays < 1) {
            throw new Error(
              `Reguła #${index + 1}: everyNDays jest wymagane dla EVERY_N_DAYS i musi być >= 1.`,
            );
          }
        }

        const occurrencesLimit = parseInteger(rule.occurrencesLimit);
        if (occurrencesLimit !== null && occurrencesLimit < 1) {
          throw new Error(
            `Reguła #${index + 1}: occurrencesLimit musi być >= 1 (lub puste).`,
          );
        }

        return {
          actionTemplateSlug: rule.actionTemplateSlug,
          trigger: rule.trigger as ActionRuleTrigger,
          offsetDays,
          schedule,
          everyNDays,
          occurrencesLimit,
          applyIfStartMethod: rule.applyIfStartMethod.length
            ? (rule.applyIfStartMethod as PlantingStartMethod[])
            : null,
          isEnabled: rule.isEnabled,
        };
      });

      const duplicateRuleSet = new Set<string>();
      for (const rule of normalizedActionRules) {
        const duplicateKey = [
          rule.actionTemplateSlug,
          rule.trigger,
          rule.offsetDays,
          rule.schedule,
          rule.everyNDays ?? "",
        ].join("|");

        if (duplicateRuleSet.has(duplicateKey)) {
          setClientError(
            "Zduplikowana reguła. Unikalność: templateSlug + trigger + offsetDays + schedule + everyNDays.",
          );
          return;
        }

        duplicateRuleSet.add(duplicateKey);
      }

      const minSoilDepthCm = toNumberOrNull(values.minSoilDepthCm);
      if (minSoilDepthCm !== null && minSoilDepthCm < 0) {
        setClientError("Minimalna głębokość gleby nie może być ujemna.");
        return;
      }

      const sowingMethods = values.sowingMethods.length
        ? values.sowingMethods.map((method) => ({
            ...method,
            germinationDaysMin:
              toNumberOrNull(method.germinationDaysMin) ?? null,
            germinationDaysMax:
              toNumberOrNull(method.germinationDaysMax) ?? null,
            seedDepthCm: toNumberOrNull(method.seedDepthCm) ?? null,
            rowSpacingCm: toNumberOrNull(method.rowSpacingCm) ?? null,
            plantSpacingCm: toNumberOrNull(method.plantSpacingCm) ?? null,
          }))
        : null;

      const fertilizationStages = values.fertilizationStages.length
        ? values.fertilizationStages.map((stage) => ({
            ...stage,
            timing: toOptionalString(stage.timing),
          }))
        : null;

      const payload: CreateVegetablePayload = {
        name: values.name.trim(),
        description: values.description.trim(),
        latinName: toOptionalString(values.latinName),
        family: values.family || null,
        nutrientNeeds: values.nutrientNeeds || null,
        rotationGroup: values.rotationGroup || null,
        imageUrl: toOptionalString(values.imageUrl),
        sunExposure: values.sunExposure || null,
        waterDemand: values.waterDemand || null,
        nutrientDemand: values.nutrientDemand || null,
        recommendedSoilSlugs: values.recommendedSoilSlugs,
        minSoilDepthCm,
        dominantNutrientDemand: values.dominantNutrientDemand || null,
        sowingMethods,
        timeToHarvestDaysMin: timeToHarvestDaysMin ?? null,
        timeToHarvestDaysMax: timeToHarvestDaysMax ?? null,
        successionSowing: values.successionSowing,
        successionIntervalDays: values.successionSowing
          ? toNumberOrNull(values.successionIntervalDays)
          : null,
        harvestStartMonth: values.harvestStartMonth || null,
        harvestEndMonth: values.harvestEndMonth || null,
        harvestSigns: toOptionalString(values.harvestSigns),
        fertilizationStages,
        actionRules: normalizedActionRules,
        commonPestSlugs: values.commonPestSlugs,
        commonDiseaseSlugs: values.commonDiseaseSlugs,
        goodCompanionSlugs: values.goodCompanionSlugs,
        badCompanionSlugs: values.badCompanionSlugs,
      };

      onSubmit(payload, imageFile);
    } catch (error) {
      if (error instanceof Error) {
        setClientError(error.message);
        return;
      }
      setClientError("Nie udało się zwalidować reguł harmonogramu.");
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setClientError(null);

    if (!file) {
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setClientError("Dozwolone formaty: JPG, PNG, WEBP.");
      event.target.value = "";
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setClientError("Maksymalny rozmiar pliku to 5 MB.");
      event.target.value = "";
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleDeleteImage = async () => {
    if (!onDeleteImage) return;
    setClientError(null);
    try {
      await onDeleteImage();
      updateValue("imageUrl", "");
      setImageFile(null);
      setImagePreviewUrl(null);
    } catch {
      setClientError("Nie udało się usunąć zdjęcia.");
    }
  };

  const toggleSelection = (current: string[], value: string) => {
    if (current.includes(value)) {
      return current.filter((item) => item !== value);
    }
    return [...current, value];
  };

  return (
    <form id={formId} className="space-y-8" onSubmit={handleSubmit}>
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Podstawy</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nazwa</span>
            <span className="text-xs text-zinc-500">
              Nazwa warzywa w języku polskim, wyświetlana w aplikacji mobilnej.
            </span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nazwa łacińska</span>
            <span className="text-xs text-zinc-500">
              Nazwa łacińska gatunku (opcjonalnie).
            </span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.latinName}
              onChange={(event) => updateValue("latinName", event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Rodzina botaniczna</span>
            <span className="text-xs text-zinc-500">
              Rodzina botaniczna warzywa (opcjonalnie).
            </span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.family}
              onChange={(event) =>
                updateValue(
                  "family",
                  event.target.value as "" | BotanicalFamily,
                )
              }
            >
              <option value="">Brak</option>
              {botanicalFamilyOptions.map((option) => (
                <option key={option} value={option}>
                  {botanicalFamilyLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Potrzeby składnikowe</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.nutrientNeeds}
              onChange={(event) =>
                updateValue(
                  "nutrientNeeds",
                  event.target.value as "" | NutrientNeeds,
                )
              }
            >
              <option value="">Brak</option>
              {nutrientNeedsOptions.map((option) => (
                <option key={option} value={option}>
                  {nutrientNeedsLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Grupa płodozmianu</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.rotationGroup}
              onChange={(event) =>
                updateValue(
                  "rotationGroup",
                  event.target.value as "" | RotationGroup,
                )
              }
            >
              <option value="">Brak</option>
              {rotationGroupOptions.map((option) => (
                <option key={option} value={option}>
                  {rotationGroupLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">URL zdjęcia</span>
            <span className="text-xs text-zinc-500">
              Link do jednego zdjęcia warzywa (opcjonalnie). Musi być poprawnym
              URL prowadzącym do pliku graficznego.
            </span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.imageUrl}
              onChange={(event) => updateValue("imageUrl", event.target.value)}
              onBlur={(event) => {
                if (event.target.value.trim())
                  validateImageUrl(event.target.value.trim());
              }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 px-3 py-2 text-xs"
                onClick={() => setIsLibraryOpen(true)}
              >
                Wybierz z biblioteki
              </button>
              {onUploadImage && (
                <label className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-2 text-xs">
                  Upload
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (!file) return;
                      setClientError(null);
                      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
                        setClientError("Dozwolone formaty: JPG, PNG, WEBP.");
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        setClientError("Maksymalny rozmiar pliku to 5 MB.");
                        return;
                      }
                      const url = await onUploadImage(file);
                      if (url) {
                        updateValue("imageUrl", url);
                      }
                    }}
                  />
                </label>
              )}
            </div>
            {imageUrlChecking && (
              <span className="text-xs text-zinc-500">
                Sprawdzanie adresu...
              </span>
            )}
            {imageUrlValid === false && (
              <span className="text-xs text-red-500">
                Podany adres nie jest poprawnym linkiem do obrazka.
              </span>
            )}
            {imageUrlValid === true && (
              <span className="text-xs text-green-600">
                Adres prowadzi do obrazka.
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Plik graficzny</span>
            <span className="text-xs text-zinc-500">
              Dodaj jeden obraz (JPG/PNG/WEBP), maks. 5 MB.
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="rounded-lg border border-zinc-200 px-3 py-2"
              onChange={handleImageChange}
            />

            {(imagePreviewUrl || (values.imageUrl && imageUrlValid)) && (
              <div className="mt-2 space-y-2">
                <div
                  style={{ maxHeight: 128, width: "auto", display: "block" }}
                >
                  <Image
                    src={imagePreviewUrl ?? values.imageUrl}
                    alt="Podgląd zdjęcia warzywa"
                    width={256}
                    height={128}
                    style={{
                      maxHeight: 128,
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                    className="rounded-lg border border-zinc-200"
                    unoptimized
                  />
                </div>

                {onDeleteImage && values.imageUrl && !imagePreviewUrl && (
                  <button
                    type="button"
                    className="text-xs font-medium text-red-600"
                    onClick={handleDeleteImage}
                    disabled={isDeletingImage}
                  >
                    {isDeletingImage ? "Usuwanie..." : "Usuń zdjęcie"}
                  </button>
                )}
              </div>
            )}
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Opis</span>
          <span className="text-xs text-zinc-500">
            Główny opis edukacyjny: wymagania, uprawa, najczęstsze porady.
          </span>
          <textarea
            className="min-h-30 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
            required
          />
        </label>
      </section>

      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        initialTab="vegetables"
        onSelect={async (item: MediaLibraryItem) => {
          const url = item.publicUrl;
          if (onAssignImageFromLibrary) {
            await onAssignImageFromLibrary(url);
          }
          updateValue("imageUrl", url);
          setIsLibraryOpen(false);
        }}
        title="Wybierz zdjęcie warzywa"
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Wymagania</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nasłonecznienie</span>
            <span className="text-xs text-zinc-500">
              Ile światła potrzebuje roślina (pełne słońce / półcień / cień).
            </span>
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
                  {sunExposureLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Zapotrzebowanie na wodę</span>
            <span className="text-xs text-zinc-500">
              Ogólne wymagania wodne: niskie/średnie/wysokie.
            </span>
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
                  {demandLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Zapotrzebowanie na składniki</span>
            <span className="text-xs text-zinc-500">
              Zapotrzebowanie na składniki: low/medium/high.
            </span>
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
                  {demandLevelLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Rekomendowane gleby</span>
            <span className="text-xs text-zinc-500">
              Wybierz jedną lub więcej gleb zdefiniowanych w słowniku.
            </span>
            <select
              multiple
              className="min-h-28 rounded-lg border border-zinc-200 px-3 py-2"
              value={values.recommendedSoilSlugs}
              onChange={(event) =>
                updateValue(
                  "recommendedSoilSlugs",
                  Array.from(event.target.selectedOptions, (option) =>
                    option.value.trim(),
                  ).filter(Boolean),
                )
              }
              disabled={soilsLoading}
            >
              {soilItems.map((soil) => (
                <option key={soil.id} value={getRelationValue(soil)}>
                  {soil.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Min. głębokość gleby (cm)</span>
            <span className="text-xs text-zinc-500">
              Minimalna głębokość profilu glebowego, w cm.
            </span>
            <input
              type="number"
              min={0}
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.minSoilDepthCm}
              onChange={(event) =>
                updateValue("minSoilDepthCm", event.target.value)
              }
              placeholder="np. 30"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Dominujący składnik</span>
            <span className="text-xs text-zinc-500">
              Dominujący składnik pokarmowy: N, P, K lub zbilansowane.
            </span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.dominantNutrientDemand ?? ""}
              onChange={(event) =>
                updateValue(
                  "dominantNutrientDemand",
                  event.target.value as
                    | ""
                    | NonNullable<
                        CreateVegetablePayload["dominantNutrientDemand"]
                      >,
                )
              }
            >
              <option value="">Brak</option>
              {dominantNutrientDemandOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Metody siewu</h2>
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

          {values.sowingMethods.map((method, index) => {
            return (
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
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Metoda</span>
                    <span className="text-xs text-zinc-500">
                      direct_sow = siew do gruntu, seedlings = rozsada.
                    </span>
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
                          {sowingMethodLabels[option]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Miesiąc startu</span>
                    <span className="text-xs text-zinc-500">
                      Zakres miesięcy wysiewu dla tego wariantu.
                    </span>
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
                          {monthLabels[option]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Miesiąc końca</span>
                    <span className="text-xs text-zinc-500">
                      Zakres miesięcy wysiewu dla tego wariantu.
                    </span>
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
                          {monthLabels[option]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-3 flex flex-col gap-1 text-sm">
                  <span className="font-medium">Dni kiełkowania min</span>
                  <span className="text-xs text-zinc-500">
                    Zakres dni kiełkowania (opcjonalnie). Jeśli podajesz zakres,
                    min nie może być większe niż max.
                  </span>
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

                <label className="mt-3 flex flex-col gap-1 text-sm">
                  <span className="font-medium">Dni kiełkowania max</span>
                  <span className="text-xs text-zinc-500">
                    Zakres dni kiełkowania (opcjonalnie). Jeśli podajesz zakres,
                    min nie może być większe niż max.
                  </span>
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

                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Głębokość siewu (cm)</span>
                    <span className="text-xs text-zinc-500">
                      Głębokość siewu w cm (opcjonalnie).
                    </span>
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

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Rozstaw rzędów (cm)</span>
                    <span className="text-xs text-zinc-500">
                      Odległość między rzędami w cm (opcjonalnie).
                    </span>
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

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Rozstaw roślin (cm)</span>
                    <span className="text-xs text-zinc-500">
                      Odległość między roślinami w rzędzie w cm (opcjonalnie).
                    </span>
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
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Początek przesadzania</span>
                    <span className="text-xs text-zinc-500">
                      Zakres miesięcy przesadzania rozsady (tylko dla
                      seedlings).
                    </span>
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
                          {monthLabels[option]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Koniec przesadzania</span>
                    <span className="text-xs text-zinc-500">
                      Zakres miesięcy przesadzania rozsady (tylko dla
                      seedlings).
                    </span>
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
                          {monthLabels[option]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Zbiory</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Miesiąc startu</span>
            <span className="text-xs text-zinc-500">
              Typowy zakres miesięcy zbioru (opcjonalnie).
            </span>
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
                  {monthLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Miesiąc końca</span>
            <span className="text-xs text-zinc-500">
              Typowy zakres miesięcy zbioru (opcjonalnie).
            </span>
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
                  {monthLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Oznaki zbioru</span>
            <span className="text-xs text-zinc-500">
              Po czym poznać, że warzywo jest gotowe do zbioru (opcjonalnie).
            </span>
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
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Czas do zbioru min (dni)</span>
            <span className="text-xs text-zinc-500">
              Przybliżony zakres dni do pierwszych zbiorów (opcjonalnie).
            </span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              type="number"
              value={values.timeToHarvestDaysMin}
              onChange={(event) =>
                updateValue("timeToHarvestDaysMin", event.target.value)
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Czas do zbioru max (dni)</span>
            <span className="text-xs text-zinc-500">
              Przybliżony zakres dni do pierwszych zbiorów (opcjonalnie).
            </span>
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
        <h2 className="text-lg font-semibold text-zinc-900">Siew sukcesywny</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Siew sukcesywny</span>
            <span className="text-xs text-zinc-500">
              Czy warto siać partiami, aby mieć ciągłe zbiory.
            </span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.successionSowing}
                onChange={(event) =>
                  updateValue("successionSowing", event.target.checked)
                }
              />
              Włącz siew sukcesywny
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Interwał (dni)</span>
            <span className="text-xs text-zinc-500">
              Co ile dni powtarzać siew, gdy successionSowing=true.
            </span>
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
        <h2 className="text-lg font-semibold text-zinc-900">
          Zabiegi po zbiorach
        </h2>
        <p className="mt-2 text-xs text-zinc-500">
          Skonfiguruj je w regułach poniżej z triggerem
          <span className="font-medium"> ON_HARVEST_CONFIRMED</span>.
        </p>
      </section>

      <VegetableActionRulesSection
        rulesVersion={values.rulesVersion ? Number(values.rulesVersion) : null}
        rules={values.actionRules}
        onChange={(nextRules) => updateValue("actionRules", nextRules)}
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Etapy nawożenia
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
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">Nazwa</span>
                  <span className="text-xs text-zinc-500">
                    Nazwa etapu (np. „Start”, „Owocowanie”).
                  </span>
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

                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">Kiedy</span>
                  <span className="text-xs text-zinc-500">
                    Kiedy wykonać etap (tekstowo), np. „2 tygodnie po
                    wysadzeniu” (opcjonalnie).
                  </span>
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

              <label className="mt-3 flex flex-col gap-1 text-sm">
                <span className="font-medium">Opis</span>
                <span className="text-xs text-zinc-500">
                  Dokładny opis zaleceń w danym etapie.
                </span>
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
        <h2 className="text-lg font-semibold text-zinc-900">Relacje</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-zinc-700">Szkodniki</p>
            <p className="text-xs text-zinc-500">
              Typowe szkodniki atakujące to warzywo. Wybierane ze słownika
              Pests.
            </p>
            <div className="mt-2 space-y-2">
              {pestItems.map((pest) =>
                (() => {
                  const relationValue = getRelationValue(pest);
                  return (
                    <label
                      key={pest.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={values.commonPestSlugs.includes(relationValue)}
                        onChange={() =>
                          updateValue(
                            "commonPestSlugs",
                            toggleSelection(
                              values.commonPestSlugs,
                              relationValue,
                            ),
                          )
                        }
                      />
                      {pest.name}
                    </label>
                  );
                })(),
              )}

              {pestItems.length === 0 && (
                <p className="text-sm text-zinc-500">Brak danych.</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-700">Choroby</p>
            <p className="text-xs text-zinc-500">
              Typowe choroby dotyczące tego warzywa. Wybierane ze słownika
              Diseases.
            </p>
            <div className="mt-2 space-y-2">
              {diseaseItems.map((disease) =>
                (() => {
                  const relationValue = getRelationValue(disease);
                  return (
                    <label
                      key={disease.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={values.commonDiseaseSlugs.includes(
                          relationValue,
                        )}
                        onChange={() =>
                          updateValue(
                            "commonDiseaseSlugs",
                            toggleSelection(
                              values.commonDiseaseSlugs,
                              relationValue,
                            ),
                          )
                        }
                      />
                      {disease.name}
                    </label>
                  );
                })(),
              )}

              {diseaseItems.length === 0 && (
                <p className="text-sm text-zinc-500">Brak danych.</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-700">
              Dobre sąsiedztwo
            </p>
            <p className="text-xs text-zinc-500">
              Warzywa, które zwykle dobrze rosną obok.
            </p>
            <div className="mt-2 space-y-2">
              {companionOptions.map((companion) =>
                (() => {
                  const relationValue = getRelationValue(companion);
                  return (
                    <label
                      key={companion.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={values.goodCompanionSlugs.includes(
                          relationValue,
                        )}
                        onChange={() =>
                          updateValue(
                            "goodCompanionSlugs",
                            toggleSelection(
                              values.goodCompanionSlugs,
                              relationValue,
                            ),
                          )
                        }
                      />
                      {companion.name}
                    </label>
                  );
                })(),
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-700">Złe sąsiedztwo</p>
            <p className="text-xs text-zinc-500">
              Warzywa, których zwykle nie sadzi się obok.
            </p>
            <div className="mt-2 space-y-2">
              {companionOptions.map((companion) =>
                (() => {
                  const relationValue = getRelationValue(companion);
                  return (
                    <label
                      key={companion.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={values.badCompanionSlugs.includes(
                          relationValue,
                        )}
                        onChange={() =>
                          updateValue(
                            "badCompanionSlugs",
                            toggleSelection(
                              values.badCompanionSlugs,
                              relationValue,
                            ),
                          )
                        }
                      />
                      {companion.name}
                    </label>
                  );
                })(),
              )}
            </div>
          </div>
        </div>
      </section>

      {(clientError || errorMessage) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {clientError || errorMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {onResetCustomization !== undefined ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300"
              checked={isCustomized ?? false}
              disabled={isResettingCustomization || isSubmitting}
              onChange={(e) => {
                if (!e.target.checked) {
                  onResetCustomization();
                }
              }}
            />
            <span className="font-medium text-zinc-700">
              Chroniony przed aktualizacjami z seeda
            </span>
            {isResettingCustomization && (
              <span className="text-xs text-zinc-400">Resetowanie...</span>
            )}
          </label>
        ) : (
          <span />
        )}
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
