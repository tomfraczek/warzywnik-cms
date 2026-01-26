"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { VegetableForm } from "@/app/components/VegetableForm";
import { useGetVegetable } from "@/app/api/queries/vegetables/useGetVegetable";
import { useUpdateVegetable } from "@/app/api/mutations/vegetables/useUpdateVegetable";
import { useUploadVegetableImage } from "@/app/api/mutations/vegetables/useUploadVegetableImage";
import { useDeleteVegetableImage } from "@/app/api/mutations/vegetables/useDeleteVegetableImage";
import type { VegetableFormValues } from "@/app/components/VegetableForm";
import type { CreateVegetablePayload, Vegetable } from "@/app/api/api.types";

const mapVegetableToFormValues = (data: Vegetable): VegetableFormValues => ({
  slug: data.slug,
  name: data.name,
  description: data.description,
  latinName: data.latinName || "",
  imageUrl: data.imageUrl || "",
  sunExposure: data.sunExposure || "",
  waterDemand: data.waterDemand || "",
  soilType: data.soilType || "",
  soilPHMin: data.soilPHMin?.toString() ?? "",
  soilPHMax: data.soilPHMax?.toString() ?? "",
  nutrientDemand: data.nutrientDemand || "",
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
  commonPestIds: data.commonPests.map((pest) => pest.id),
  commonDiseaseIds: data.commonDiseases.map((disease) => disease.id),
  goodCompanionIds: data.goodCompanions.map((companion) => companion.id),
  badCompanionIds: data.badCompanions.map((companion) => companion.id),
});

export default function EditVegetablePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useGetVegetable(params?.id);
  const updateMutation = useUpdateVegetable();
  const uploadMutation = useUploadVegetableImage();
  const deleteImageMutation = useDeleteVegetableImage();
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;

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
          adminToken,
        });
      }
      router.push(`/vegetables/${result.id}`);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 409) {
          setErrorMessage("Slug jest zajęty");
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
    await deleteImageMutation.mutateAsync({ id: data.id, adminToken });
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
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warzywa
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Edytuj warzywo</h1>
        <p className="text-base text-zinc-600">
          Aktualizuj dane warzywa i zapisz zmiany.
        </p>
      </header>
      <VegetableForm
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending || uploadMutation.isPending}
        errorMessage={errorMessage}
        excludeCompanionId={data.id}
        onDeleteImage={handleDeleteImage}
        isDeletingImage={deleteImageMutation.isPending}
      />
    </section>
  );
}
