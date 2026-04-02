"use client";
import { useDeleteVegetable } from "@/app/api/mutations/vegetables/useDeleteVegetable";
import { useGetVegetable } from "@/app/api/queries/vegetables/useGetVegetable";
import { getSoils } from "@/app/soils/api/api.requests";
import { SoilDrawer } from "@/app/components/SoilDrawer";
import { useQuery } from "@tanstack/react-query";
import {
  actionRuleScheduleLabels,
  actionRuleTriggerLabels,
  actionTemplateTypeLabels,
  botanicalFamilyLabels,
  demandLevelLabels,
  dominantNutrientDemandLabels,
  monthLabels,
  nutrientNeedsLabels,
  plantingStartMethodLabels,
  rotationGroupLabels,
  sowingMethodLabels,
  sunExposureLabels,
} from "@/app/utils/labels";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useMemo } from "react";
import NextImage from "next/image";

export default function VegetableDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetVegetable(params?.id);
  const dataWithLegacy = data as
    | (typeof data & {
        recommendedSoilIds?: string[];
        postHarvestActionTemplateIds?: string[];
        actionRules?: Array<{
          actionTemplateSlug?: string;
          actionTemplateId?: string;
          trigger?: string;
          offsetDays?: number;
          schedule?: string;
          everyNDays?: number | null;
          occurrencesLimit?: number | null;
          applyIfStartMethod?: string[] | null;
          isEnabled?: boolean;
          enabled?: boolean;
        }>;
      })
    | undefined;
  const deleteMutation = useDeleteVegetable();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: soilItems = [], isLoading: soilsLoading } = useQuery({
    queryKey: ["soils", "all-for-vegetable-details"],
    queryFn: async () => {
      const firstPage = await getSoils({ page: 1 });
      const allItems = [...firstPage.items];

      if (firstPage.limit <= 0 || firstPage.total <= firstPage.items.length) {
        return allItems;
      }

      const totalPages = Math.ceil(firstPage.total / firstPage.limit);
      const lastPage = Math.min(totalPages, 500);

      for (let page = 2; page <= lastPage; page += 1) {
        const nextPage = await getSoils({ page });
        allItems.push(...nextPage.items);

        if (allItems.length >= firstPage.total) {
          break;
        }
      }

      return allItems;
    },
  });

  const soilByRelationValue = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    soilItems.forEach((soil) => {
      if (soil.slug?.trim()) {
        map.set(soil.slug, { id: soil.id, name: soil.name });
      }
      map.set(soil.id, { id: soil.id, name: soil.name });
    });
    return map;
  }, [soilItems]);

  const recommendedSoilsForUi = useMemo(() => {
    const relationValues =
      data?.recommendedSoilSlugs ?? dataWithLegacy?.recommendedSoilIds ?? [];
    return relationValues
      .map((value) => {
        const matched = soilByRelationValue.get(value);
        if (!matched) {
          return null;
        }

        return {
          relationValue: value,
          soilId: matched.id,
          name: matched.name,
        };
      })
      .filter(
        (
          item,
        ): item is { relationValue: string; soilId: string; name: string } =>
          Boolean(item),
      );
  }, [
    data?.recommendedSoilSlugs,
    dataWithLegacy?.recommendedSoilIds,
    soilByRelationValue,
  ]);

  const commonPestSlugs = useMemo(
    () =>
      data?.commonPestSlugs ??
      data?.commonPests?.map((item) => item.slug ?? item.id) ??
      [],
    [data?.commonPestSlugs, data?.commonPests],
  );

  const commonDiseaseSlugs = useMemo(
    () =>
      data?.commonDiseaseSlugs ??
      data?.commonDiseases?.map((item) => item.slug ?? item.id) ??
      [],
    [data?.commonDiseaseSlugs, data?.commonDiseases],
  );

  const goodCompanionSlugs = useMemo(
    () =>
      data?.goodCompanionSlugs ??
      data?.goodCompanions?.map((item) => item.slug ?? item.id) ??
      [],
    [data?.goodCompanionSlugs, data?.goodCompanions],
  );

  const badCompanionSlugs = useMemo(
    () =>
      data?.badCompanionSlugs ??
      data?.badCompanions?.map((item) => item.slug ?? item.id) ??
      [],
    [data?.badCompanionSlugs, data?.badCompanions],
  );

  const [openSoilId, setOpenSoilId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!data) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!data) return;
    await deleteMutation.mutateAsync({ id: data.id });
    setShowDeleteModal(false);
    router.push("/vegetables");
  };

  const cancelDelete = () => setShowDeleteModal(false);

  const notFound =
    error instanceof AxiosError && error.response?.status === 404;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (notFound) {
    return <p className="text-sm text-red-500">Nie znaleziono warzywa.</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <>
      {openSoilId ? (
        <SoilDrawer soilId={openSoilId} onClose={() => setOpenSoilId(null)} />
      ) : null}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Potwierdź usunięcie</h2>
            <p className="mb-6">Czy na pewno usunąć warzywo?</p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded bg-zinc-200 px-4 py-2 text-zinc-700"
                onClick={cancelDelete}
              >
                Anuluj
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-white"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Warzywa
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold text-zinc-900">
              {data.name}
            </h1>
            <div className="flex items-center gap-3">
              <Link
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium"
                href={`/vegetables/${data.id}/edit`}
              >
                Edytuj
              </Link>
              <button
                type="button"
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
                onClick={handleDelete}
              >
                Usuń
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Podstawy</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="space-y-3">
              {data.imageUrl ? (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                  <NextImage
                    src={data.imageUrl}
                    alt={data.name || "Zdjęcie warzywa"}
                    height={160}
                    width={240}
                    style={{
                      height: 160,
                      width: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                    className="rounded-md"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
                  Brak zdjęcia
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm text-zinc-600">
              <p>
                <span className="font-medium text-zinc-900">
                  Nazwa łacińska:
                </span>{" "}
                {data.latinName || "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Rodzina:</span>{" "}
                {data.family ? botanicalFamilyLabels[data.family] : "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">
                  Potrzeby składnikowe:
                </span>{" "}
                {data.nutrientNeeds
                  ? nutrientNeedsLabels[data.nutrientNeeds]
                  : "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">
                  Grupa płodozmianu:
                </span>{" "}
                {data.rotationGroup
                  ? rotationGroupLabels[data.rotationGroup]
                  : "-"}
              </p>
              <p>
                <span className="font-medium text-zinc-900">Opis:</span>{" "}
                {data.description}
              </p>
            </div>
          </div>
        </section>

        {/* WYMAGANIA */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Wymagania</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Nasłonecznienie
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.sunExposure ? sunExposureLabels[data.sunExposure] : "-"}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Woda
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.waterDemand ? demandLevelLabels[data.waterDemand] : "-"}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Składniki
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.nutrientDemand
                  ? demandLevelLabels[data.nutrientDemand]
                  : "-"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Rekomendowane gleby
              </p>

              <div className="mt-2">
                {soilsLoading ? (
                  <p className="text-sm font-medium text-zinc-900">
                    Ładowanie...
                  </p>
                ) : recommendedSoilsForUi.length ? (
                  <div className="flex flex-wrap gap-2">
                    {recommendedSoilsForUi.map((soil) => (
                      <button
                        key={soil.relationValue}
                        type="button"
                        onClick={() => setOpenSoilId(soil.soilId)}
                        className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                        title="Pokaż szczegóły gleby"
                      >
                        {soil.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-zinc-900">-</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Min. głębokość gleby
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.minSoilDepthCm !== null &&
                data.minSoilDepthCm !== undefined
                  ? `${data.minSoilDepthCm} cm`
                  : "-"}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Dominujący składnik
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {data.dominantNutrientDemand
                  ? dominantNutrientDemandLabels[data.dominantNutrientDemand]
                  : "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Metody siewu</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-600">
            {data.sowingMethods?.length ? (
              data.sowingMethods.map((method, index) => (
                <div
                  key={`method-${index}`}
                  className="rounded-lg border border-zinc-200 p-3"
                >
                  <p>
                    <span className="font-medium text-zinc-900">Metoda:</span>{" "}
                    {method.method ? sowingMethodLabels[method.method] : "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Okno:</span>{" "}
                    {method.startMonth ? monthLabels[method.startMonth] : "-"} -{" "}
                    {method.endMonth ? monthLabels[method.endMonth] : "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Pod osłonami:
                    </span>{" "}
                    {method.underCover ? "Tak" : "Nie"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Kiełkowanie:
                    </span>{" "}
                    {method.germinationDaysMin ?? "-"} -{" "}
                    {method.germinationDaysMax ?? "-"} dni
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Głębokość siewu:
                    </span>{" "}
                    {method.seedDepthCm ?? "-"} cm
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Rozstaw rzędów:
                    </span>{" "}
                    {method.rowSpacingCm ?? "-"} cm
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Rozstaw roślin:
                    </span>{" "}
                    {method.plantSpacingCm ?? "-"} cm
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Początek przesadzania:
                    </span>{" "}
                    {method.transplantingStartMonth
                      ? monthLabels[method.transplantingStartMonth]
                      : "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Koniec przesadzania:
                    </span>{" "}
                    {method.transplantingEndMonth
                      ? monthLabels[method.transplantingEndMonth]
                      : "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Brak danych.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Zbiory</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Okno zbioru:</span>{" "}
              {data.harvestStartMonth
                ? monthLabels[data.harvestStartMonth]
                : "-"}{" "}
              - {data.harvestEndMonth ? monthLabels[data.harvestEndMonth] : "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Oznaki:</span>{" "}
              {data.harvestSigns || "-"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Czas zbioru:</span>{" "}
              {data.timeToHarvestDaysMin ?? "-"} -{" "}
              {data.timeToHarvestDaysMax ?? "-"} dni
            </p>
            <p>
              <span className="font-medium text-zinc-900">
                Siew sukcesywny:
              </span>{" "}
              {data.successionSowing ? "Tak" : "Nie"}
            </p>
            {data.successionSowing && (
              <p>
                <span className="font-medium text-zinc-900">
                  Interwał siewu:
                </span>{" "}
                {data.successionIntervalDays !== null &&
                data.successionIntervalDays !== undefined
                  ? `${data.successionIntervalDays} dni`
                  : "-"}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Zabiegi po zbiorach
          </h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            {data.postHarvestActions?.length ? (
              data.postHarvestActions.map((item) => (
                <p key={item.id}>
                  <span className="font-medium text-zinc-900">{item.name}</span>{" "}
                  <span className="text-zinc-500">
                    ({actionTemplateTypeLabels[item.type] ?? item.type})
                  </span>
                </p>
              ))
            ) : dataWithLegacy?.postHarvestActionTemplateIds?.length ? (
              dataWithLegacy.postHarvestActionTemplateIds.map((item) => (
                <p key={item}>
                  <span className="font-medium text-zinc-900">{item}</span>
                </p>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Brak danych.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Reguły akcji</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-600">
            {dataWithLegacy?.actionRules?.length ? (
              dataWithLegacy.actionRules.map((rule, index) => (
                <div
                  key={`rule-${index}`}
                  className="rounded-lg border border-zinc-200 p-3"
                >
                  <p>
                    <span className="font-medium text-zinc-900">Szablon:</span>{" "}
                    {(
                      rule as {
                        actionTemplateSlug?: string;
                        actionTemplateId?: string;
                      }
                    ).actionTemplateSlug ??
                      (
                        rule as {
                          actionTemplateSlug?: string;
                          actionTemplateId?: string;
                        }
                      ).actionTemplateId ??
                      "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Trigger:</span>{" "}
                    {rule.trigger
                      ? (actionRuleTriggerLabels[
                          rule.trigger as keyof typeof actionRuleTriggerLabels
                        ] ?? rule.trigger)
                      : "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Opóźnienie:
                    </span>{" "}
                    {rule.offsetDays ?? "-"} dni
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Harmonogram:
                    </span>{" "}
                    {rule.schedule
                      ? (actionRuleScheduleLabels[
                          rule.schedule as keyof typeof actionRuleScheduleLabels
                        ] ?? rule.schedule)
                      : "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Co N dni:</span>{" "}
                    {rule.everyNDays ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Limit powtórzeń:
                    </span>{" "}
                    {rule.occurrencesLimit ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">
                      Dotyczy metody:
                    </span>{" "}
                    {rule.applyIfStartMethod?.length
                      ? rule.applyIfStartMethod
                          .map(
                            (m) =>
                              plantingStartMethodLabels[
                                m as keyof typeof plantingStartMethodLabels
                              ] ?? m,
                          )
                          .join(", ")
                      : "Wszystkie"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Aktywna:</span>{" "}
                    {typeof rule.isEnabled === "boolean"
                      ? rule.isEnabled
                        ? "Tak"
                        : "Nie"
                      : typeof (rule as { enabled?: unknown }).enabled ===
                          "boolean"
                        ? (rule as { enabled?: boolean }).enabled
                          ? "Tak"
                          : "Nie"
                        : "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Brak danych.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Etapy nawożenia
          </h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-600">
            {data.fertilizationStages?.length ? (
              data.fertilizationStages.map((stage, index) => (
                <div
                  key={`stage-${index}`}
                  className="rounded-lg border border-zinc-200 p-3"
                >
                  <p className="font-medium text-zinc-900">{stage.name}</p>
                  <p className="text-xs text-zinc-500">{stage.timing || "-"}</p>
                  <p>{stage.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Brak danych.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Relacje</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="font-medium text-zinc-900">Szkodniki</p>
              <div className="mt-2 space-y-1 text-zinc-600">
                {data.commonPests?.length ? (
                  data.commonPests.map((pest) => (
                    <Link
                      key={pest.id}
                      href={`/pests/${pest.id}`}
                      className="block hover:text-zinc-900"
                    >
                      {pest.name}
                    </Link>
                  ))
                ) : commonPestSlugs.length ? (
                  commonPestSlugs.map((slug) => <p key={slug}>{slug}</p>)
                ) : (
                  <p className="text-zinc-500">Brak.</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Choroby</p>
              <div className="mt-2 space-y-1 text-zinc-600">
                {data.commonDiseases?.length ? (
                  data.commonDiseases.map((disease) => (
                    <Link
                      key={disease.id}
                      href={`/diseases/${disease.id}`}
                      className="block hover:text-zinc-900"
                    >
                      {disease.name}
                    </Link>
                  ))
                ) : commonDiseaseSlugs.length ? (
                  commonDiseaseSlugs.map((slug) => <p key={slug}>{slug}</p>)
                ) : (
                  <p className="text-zinc-500">Brak.</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Dobre sąsiedztwo</p>
              <div className="mt-2 space-y-1 text-zinc-600">
                {data.goodCompanions?.length ? (
                  data.goodCompanions.map((companion) => (
                    <Link
                      key={companion.id}
                      href={`/vegetables/${companion.id}`}
                      className="block hover:text-zinc-900"
                    >
                      {companion.name}
                    </Link>
                  ))
                ) : goodCompanionSlugs.length ? (
                  goodCompanionSlugs.map((slug) => <p key={slug}>{slug}</p>)
                ) : (
                  <p className="text-zinc-500">Brak.</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Złe sąsiedztwo</p>
              <div className="mt-2 space-y-1 text-zinc-600">
                {data.badCompanions?.length ? (
                  data.badCompanions.map((companion) => (
                    <Link
                      key={companion.id}
                      href={`/vegetables/${companion.id}`}
                      className="block hover:text-zinc-900"
                    >
                      {companion.name}
                    </Link>
                  ))
                ) : badCompanionSlugs.length ? (
                  badCompanionSlugs.map((slug) => <p key={slug}>{slug}</p>)
                ) : (
                  <p className="text-zinc-500">Brak.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
