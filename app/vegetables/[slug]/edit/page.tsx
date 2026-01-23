"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { VegetableForm } from "@/app/components/VegetableForm";
import { useQuery } from "@tanstack/react-query";
import { getVegetableIdBySlug } from "@/app/api/api.requests";
import { useGetVegetable } from "@/app/api/queries/vegetables/useGetVegetable";
import { useUpdateVegetable } from "@/app/api/mutations/vegetables/useUpdateVegetable";
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

export default function EditVegetablePage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    data: vegetableId,
    isLoading: isIdLoading,
    error: idError,
  } = useQuery({
    queryKey: ["vegetable-id", params.slug],
    queryFn: () => getVegetableIdBySlug(params.slug),
  });
  const { data, isLoading, error } = useGetVegetable(vegetableId);
  const updateMutation = useUpdateVegetable();

  const initialValues = useMemo(
    () => (data ? mapVegetableToFormValues(data) : undefined),
    [data],
  );

  const handleSubmit = async (payload: CreateVegetablePayload) => {
    if (!data) return;
    setErrorMessage(null);
    try {
      const result = await updateMutation.mutateAsync({ id: data.id, payload });
      router.push(`/vegetables/${result.slug || result.id}`);
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

  if (isIdLoading || isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (
    (idError instanceof Error && idError.message === "NOT_FOUND") ||
    (error instanceof AxiosError && error.response?.status === 404)
  ) {
    return <p className="text-sm text-red-500">Nie znaleziono warzywa.</p>;
  }

  if (idError || error) {
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
        isSubmitting={updateMutation.isPending}
        errorMessage={errorMessage}
        excludeCompanionId={data.id}
      />
    </section>
  );
}
