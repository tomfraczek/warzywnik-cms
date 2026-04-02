"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { VegetableForm } from "@/app/components/VegetableForm";
import { useGetVegetable } from "@/app/api/queries/vegetables/useGetVegetable";
import { useUpdateVegetable } from "@/app/api/mutations/vegetables/useUpdateVegetable";
import { useUploadVegetableImage } from "@/app/api/mutations/vegetables/useUploadVegetableImage";
import { useDeleteVegetableImage } from "@/app/api/mutations/vegetables/useDeleteVegetableImage";
import { useQueryClient } from "@tanstack/react-query";
import { vegetableKeys } from "@/app/api/queries/vegetables/useGetVegetables";
import type { VegetableFormValues } from "@/app/components/VegetableForm";
import type {
  BotanicalFamily,
  CreateVegetablePayload,
  Vegetable,
} from "@/app/api/api.types";

const mapVegetableToFormValues = (data: Vegetable): VegetableFormValues => ({
  name: data.name,
  description: data.description,
  latinName: data.latinName || "",
  family: (data.family || "") as "" | BotanicalFamily,
  nutrientNeeds: data.nutrientNeeds || "",
  rotationGroup: data.rotationGroup || "",
  imageUrl: data.imageUrl || "",
  sunExposure: data.sunExposure || "",
  waterDemand: data.waterDemand || "",
  nutrientDemand: data.nutrientDemand || "",
  recommendedSoilSlugs: (
    data.recommendedSoilSlugs ??
    (
      data as Vegetable & {
        recommendedSoilIds?: string[];
        recommendedSoils?: Array<{ slug?: string | null; id?: string | null }>;
      }
    ).recommendedSoilIds ??
    (
      data as Vegetable & {
        recommendedSoils?: Array<{ slug?: string | null; id?: string | null }>;
      }
    ).recommendedSoils?.map((soil) => soil.slug ?? soil.id ?? "") ??
    []
  ).filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  ),
  minSoilDepthCm: data.minSoilDepthCm?.toString() ?? "",
  dominantNutrientDemand: data.dominantNutrientDemand || "",
  sowingMethods:
    data.sowingMethods?.map((method) => ({
      ...method,
      germinationDaysMin: method.germinationDaysMin?.toString() ?? "",
      germinationDaysMax: method.germinationDaysMax?.toString() ?? "",
      seedDepthCm: method.seedDepthCm?.toString() ?? "",
      rowSpacingCm: method.rowSpacingCm?.toString() ?? "",
      plantSpacingCm: method.plantSpacingCm?.toString() ?? "",
    })) ?? [],
  timeToHarvestDaysMin: data.timeToHarvestDaysMin?.toString() ?? "",
  timeToHarvestDaysMax: data.timeToHarvestDaysMax?.toString() ?? "",
  successionSowing: data.successionSowing,
  successionIntervalDays: data.successionIntervalDays?.toString() ?? "",
  harvestStartMonth: data.harvestStartMonth || "",
  harvestEndMonth: data.harvestEndMonth || "",
  harvestSigns: data.harvestSigns || "",
  fertilizationStages:
    data.fertilizationStages?.map((stage) => ({
      ...stage,
      timing: stage.timing || "",
    })) ?? [],
  actionRules:
    data.actionRules?.map((rule, index) => ({
      uid: rule.id ?? `${data.id}-rule-${index}`,
      actionTemplateSlug:
        typeof rule.actionTemplateSlug === "string"
          ? rule.actionTemplateSlug
          : typeof (
                rule as {
                  actionTemplate?: { slug?: unknown; id?: unknown };
                }
              ).actionTemplate?.slug === "string"
            ? (
                rule as unknown as {
                  actionTemplate: { slug: string; id?: unknown };
                }
              ).actionTemplate.slug
            : typeof (
                  rule as {
                    actionTemplate?: { slug?: unknown; id?: unknown };
                  }
                ).actionTemplate?.id === "string"
              ? (
                  rule as unknown as {
                    actionTemplate: { slug?: unknown; id: string };
                  }
                ).actionTemplate.id
              : typeof (rule as { actionTemplateId?: unknown })
                    .actionTemplateId === "string"
                ? (rule as unknown as { actionTemplateId: string })
                    .actionTemplateId
                : "",
      trigger: rule.trigger,
      offsetDays: rule.offsetDays.toString(),
      schedule: rule.schedule,
      everyNDays: rule.everyNDays?.toString() ?? "",
      occurrencesLimit: rule.occurrencesLimit?.toString() ?? "",
      applyIfStartMethod: rule.applyIfStartMethod ?? [],
      isEnabled:
        typeof rule.isEnabled === "boolean"
          ? rule.isEnabled
          : typeof (rule as { enabled?: unknown }).enabled === "boolean"
            ? Boolean((rule as { enabled?: unknown }).enabled)
            : true,
    })) ?? [],
  rulesVersion: data.rulesVersion?.toString() ?? "",
  commonPestSlugs: (
    data.commonPestSlugs ??
    data.commonPests?.map((pest) => pest.slug ?? pest.id)
  ).filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  ),
  commonDiseaseSlugs: (
    data.commonDiseaseSlugs ??
    data.commonDiseases?.map((disease) => disease.slug ?? disease.id)
  ).filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  ),
  goodCompanionSlugs: (
    data.goodCompanionSlugs ??
    data.goodCompanions?.map((companion) => companion.slug ?? companion.id)
  ).filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  ),
  badCompanionSlugs: (
    data.badCompanionSlugs ??
    data.badCompanions?.map((companion) => companion.slug ?? companion.id)
  ).filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  ),
});

export default function EditVegetablePage() {
  const formId = "vegetable-edit-form";
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useGetVegetable(params?.id);
  const updateMutation = useUpdateVegetable();
  const uploadMutation = useUploadVegetableImage();
  const deleteImageMutation = useDeleteVegetableImage();

  const initialValues = useMemo(
    () => (data ? mapVegetableToFormValues(data) : undefined),
    [data],
  );

  const handleSubmit = async (
    payload: CreateVegetablePayload,
    imageFile: File | null,
  ) => {
    if (!data) return;
    setErrorMessage(null);
    try {
      const result = await updateMutation.mutateAsync({ id: data.id, payload });
      if (imageFile) {
        await uploadMutation.mutateAsync({
          id: data.id,
          file: imageFile,
        });
        await queryClient.invalidateQueries({
          queryKey: vegetableKeys.detail(data.id),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["vegetables"] });
      router.push(`/vegetables/${result.id}`);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 409) {
          setErrorMessage("Rekord o tej nazwie już istnieje.");
          return;
        }
        if (err.response.status === 400) {
          setErrorMessage("Błąd walidacji danych.");
          return;
        }
        if (err.response.status === 404) {
          setErrorMessage("Nie znaleziono warzywa.");
          return;
        }
      }
      setErrorMessage("Nie udało się zapisać zmian.");
    }
  };

  const handleDeleteImage = async () => {
    if (!data) return;
    await deleteImageMutation.mutateAsync({ id: data.id });
    await queryClient.invalidateQueries({
      queryKey: vegetableKeys.detail(data.id),
    });
    await queryClient.invalidateQueries({ queryKey: ["vegetables"] });
  };

  const handleAssignImageFromLibrary = async (url: string) => {
    if (!data) return;
    await updateMutation.mutateAsync({
      id: data.id,
      payload: { imageUrl: url },
    });
    await queryClient.invalidateQueries({
      queryKey: vegetableKeys.detail(data.id),
    });
    await queryClient.invalidateQueries({ queryKey: ["vegetables"] });
  };

  const handleUploadImage = async (file: File) => {
    if (!data) return null;
    const result = await uploadMutation.mutateAsync({ id: data.id, file });
    await queryClient.invalidateQueries({
      queryKey: vegetableKeys.detail(data.id),
    });
    await queryClient.invalidateQueries({ queryKey: ["vegetables"] });
    return result.imageUrl ?? null;
  };

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (error instanceof AxiosError && error.response?.status === 404) {
    return <p className="text-sm text-red-500">Nie znaleziono warzywa.</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data || !initialValues) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Warzywa
          </p>
          <button
            type="submit"
            form={formId}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            disabled={updateMutation.isPending || uploadMutation.isPending}
          >
            {updateMutation.isPending || uploadMutation.isPending
              ? "Zapisywanie..."
              : "Zapisz zmiany"}
          </button>
        </div>
        <h1 className="text-3xl font-semibold text-zinc-900">Edytuj warzywo</h1>
        <p className="text-base text-zinc-600">
          Aktualizuj dane warzywa i zapisz zmiany.
        </p>
      </header>
      <VegetableForm
        key={data.id}
        formId={formId}
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending || uploadMutation.isPending}
        errorMessage={errorMessage}
        excludeCompanionId={data.id}
        onDeleteImage={handleDeleteImage}
        isDeletingImage={deleteImageMutation.isPending}
        onAssignImageFromLibrary={handleAssignImageFromLibrary}
        onUploadImage={handleUploadImage}
      />
    </section>
  );
}
