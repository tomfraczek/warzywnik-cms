"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import type {
  CreateVegetablePayload,
  FertilizationStage,
  Month,
  SowingMethod,
  SowingMethodType,
} from "@/app/api/api.types";
import {
  demandLevelOptions,
  dominantNutrientDemandOptions,
  monthOptions,
  sowingMethodOptions,
  sunExposureOptions,
} from "@/app/api/api.types";
import { useGetPests } from "@/app/api/queries/pests/useGetPests";
import { useGetDiseases } from "@/app/api/queries/diseases/useGetDiseases";
import { useGetVegetables } from "@/app/api/queries/vegetables/useGetVegetables";
import { useGetSoils } from "@/app/api/queries/soils/useGetSoils";
import { MediaLibraryModal } from "@/app/components/MediaLibraryModal";
import type { MediaLibraryItem } from "@/app/api/api.types";

import {
  sunExposureLabels,
  demandLevelLabels,
  sowingMethodLabels,
  monthLabels,
} from "../utils/labels";

export type VegetableFormValues = {
  slug: string;
  name: string;
  description: string;
  latinName: string;
  imageUrl: string;
  sunExposure: "" | CreateVegetablePayload["sunExposure"];
  waterDemand: "" | CreateVegetablePayload["waterDemand"];
  nutrientDemand: "" | CreateVegetablePayload["nutrientDemand"];
  recommendedSoilIds: string[];
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

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const isLowercaseSlug = (value: string) => /^[a-z0-9-]{2,}$/.test(value);

const defaultValues: VegetableFormValues = {
  slug: "",
  name: "",
  description: "",
  latinName: "",
  imageUrl: "",
  sunExposure: "",
  waterDemand: "",
  nutrientDemand: "",
  recommendedSoilIds: [],
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
  commonPestIds: [],
  commonDiseaseIds: [],
  goodCompanionIds: [],
  badCompanionIds: [],
};

export type VegetableFormProps = {
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
};

export const VegetableForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
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

  const listParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const { data: pestsData } = useGetPests(listParams);
  const { data: diseasesData } = useGetDiseases(listParams);
  const { data: vegetablesData } = useGetVegetables(listParams);
  const { data: soilsData, isLoading: soilsLoading } = useGetSoils(listParams);

  const companionOptions = useMemo(() => {
    const items = vegetablesData?.items ?? [];
    if (!excludeCompanionId) {
      return items;
    }
    return items.filter((item) => item.id !== excludeCompanionId);
  }, [vegetablesData, excludeCompanionId]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateImageUrl = async (url: string) => {
    if (!isValidUrl(url)) {
      setImageUrlValid(false);
      return;
    }
    setImageUrlChecking(true);
    try {
      const res = await fetch(url, { method: "HEAD" });
      const contentType = res.headers.get("content-type") || "";
      setImageUrlValid(res.ok && contentType.startsWith("image/"));
    } catch {
      setImageUrlValid(false);
    } finally {
      setImageUrlChecking(false);
    }
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
      if (!interval || interval <= 0) {
        setClientError("Podaj dodatni interwał dla siewu sukcesywnego.");
        return;
      }
    }

    if (values.recommendedSoilIds.some((soilId) => !isUuid(soilId))) {
      setClientError("Każda rekomendowana gleba musi mieć poprawny UUID.");
      return;
    }

    const minSoilDepthCm = toNumberOrNull(values.minSoilDepthCm);
    if (minSoilDepthCm !== null && minSoilDepthCm < 0) {
      setClientError("Minimalna głębokość gleby nie może być ujemna.");
      return;
    }

    const sowingMethods = values.sowingMethods.length
      ? values.sowingMethods.map((method) => ({
          ...method,
          germinationDaysMin: toNumberOrNull(method.germinationDaysMin) ?? null,
          germinationDaysMax: toNumberOrNull(method.germinationDaysMax) ?? null,
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
      slug: values.slug.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      latinName: toOptionalString(values.latinName),
      imageUrl: toOptionalString(values.imageUrl),
      sunExposure: values.sunExposure || null,
      waterDemand: values.waterDemand || null,
      nutrientDemand: values.nutrientDemand || null,
      recommendedSoilIds: values.recommendedSoilIds,
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
      commonPestIds: values.commonPestIds,
      commonDiseaseIds: values.commonDiseaseIds,
      goodCompanionIds: values.goodCompanionIds,
      badCompanionIds: values.badCompanionIds,
    };

    onSubmit(payload, imageFile);
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
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Podstawy</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Slug</span>
            <span className="text-xs text-zinc-500">
              Unikalny identyfikator techniczny używany w URL i jako klucz w
              API. Tylko małe litery, cyfry i myślniki.
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
              value={values.recommendedSoilIds}
              onChange={(event) =>
                updateValue(
                  "recommendedSoilIds",
                  Array.from(event.target.selectedOptions, (option) =>
                    option.value.trim(),
                  ).filter(Boolean),
                )
              }
              disabled={soilsLoading}
            >
              {soilsData?.items.map((soil) => (
                <option key={soil.id} value={soil.id}>
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
            <p className="text-sm font-medium text-zinc-700">Common pests</p>
            <p className="text-xs text-zinc-500">
              Typowe szkodniki atakujące to warzywo. Wybierane ze słownika
              Pests.
            </p>
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
            <p className="text-xs text-zinc-500">
              Typowe choroby dotyczące tego warzywa. Wybierane ze słownika
              Diseases.
            </p>
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
            <p className="text-xs text-zinc-500">
              Warzywa, które zwykle dobrze rosną obok.
            </p>
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
            <p className="text-xs text-zinc-500">
              Warzywa, których zwykle nie sadzi się obok.
            </p>
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
