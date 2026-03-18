"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getVegetable, getVegetables } from "@/app/api/api.requests";
import { useGetVegetables } from "@/app/api/queries/vegetables/useGetVegetables";
import { useDeleteVegetable } from "@/app/api/mutations/vegetables/useDeleteVegetable";
import { demandLevelOptions, sunExposureOptions } from "@/app/api/api.types";
import type { DemandLevel, SunExposure, Vegetable } from "@/app/api/api.types";
import { useQueryClient } from "@tanstack/react-query";

const csvHeaders = [
  "id",
  "name",
  "latinName",
  "botanicalFamily",
  "imageUrl",
  "description",
  "sunExposure",
  "waterDemand",
  "nutrientDemand",
  "recommendedSoilIds",
  "timeToHarvestDaysMin",
  "timeToHarvestDaysMax",
  "harvestStartMonth",
  "harvestEndMonth",
  "createdAt",
  "updatedAt",
];

const escapeCsv = (value: unknown) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

const toCsv = (rows: Vegetable[]) => {
  const header = csvHeaders.join(",");
  const body = rows.map((row) => {
    const values = [
      row.id,
      row.name,
      row.latinName ?? "",
      row.botanicalFamily ?? "",
      row.imageUrl ?? "",
      row.description,
      row.sunExposure ?? "",
      row.waterDemand ?? "",
      row.nutrientDemand ?? "",
      (row.recommendedSoilIds ?? []).join(" | "),
      row.timeToHarvestDaysMin ?? "",
      row.timeToHarvestDaysMax ?? "",
      row.harvestStartMonth ?? "",
      row.harvestEndMonth ?? "",
      row.createdAt,
      row.updatedAt,
    ];
    return values.map((value) => escapeCsv(value)).join(",");
  });

  return [header, ...body].join("\n");
};

const downloadCsv = (content: string, filename: string) => {
  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const getTimestamp = () => {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
};

export default function VegetablesPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sunExposure, setSunExposure] = useState<"" | SunExposure>("");
  const [waterDemand, setWaterDemand] = useState<"" | DemandLevel>("");
  const [nutrientDemand, setNutrientDemand] = useState<"" | DemandLevel>("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q.trim() || undefined,
      sunExposure: sunExposure || undefined,
      waterDemand: waterDemand || undefined,
      nutrientDemand: nutrientDemand || undefined,
    }),
    [page, limit, q, sunExposure, waterDemand, nutrientDemand],
  );

  const { data, isLoading, error } = useGetVegetables(params);
  const deleteMutation = useDeleteVegetable();
  const visibleIds = useMemo(
    () => data?.items.map((item) => item.id) ?? [],
    [data?.items],
  );
  const allSelectedOnPage =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  useEffect(() => {
    setSelectedIds((previous) =>
      previous.filter((id) => visibleIds.includes(id)),
    );
  }, [visibleIds]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Czy na pewno usunąć warzywo?");
    if (!confirmed) return;

    setNotice(null);
    try {
      await deleteMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ["vegetables"] });
      setSelectedIds((previous) =>
        previous.filter((selectedId) => selectedId !== id),
      );
      setNotice("Warzywo zostało usunięte.");
    } catch {
      setNotice("Nie udało się usunąć warzywa.");
    }
  };

  const handleToggleAllOnPage = () => {
    setSelectedIds(allSelectedOnPage ? [] : visibleIds);
  };

  const handleToggleSingle = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id],
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Czy na pewno usunąć ${selectedIds.length} zaznaczonych rekordów?`,
    );
    if (!confirmed) return;

    setNotice(null);
    try {
      await deleteMutation.mutateAsync({ ids: selectedIds });
      await queryClient.invalidateQueries({ queryKey: ["vegetables"] });
      setSelectedIds([]);
      setNotice(`Usunięto ${selectedIds.length} rekordów.`);
    } catch {
      setNotice("Nie udało się usunąć zaznaczonych rekordów.");
    }
  };

  const handleExportCsv = async () => {
    setNotice(null);
    setIsExporting(true);

    try {
      const normalizedParams = {
        q: q.trim() || undefined,
        sunExposure: sunExposure || undefined,
        waterDemand: waterDemand || undefined,
        nutrientDemand: nutrientDemand || undefined,
      };

      const pageSize = 20;
      const firstPage = await getVegetables({
        page: 1,
        limit: pageSize,
        ...normalizedParams,
      });

      const allListItems = [...firstPage.items];
      const totalPages = Math.ceil(firstPage.total / firstPage.limit);

      for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
        const nextPage = await getVegetables({
          page: currentPage,
          limit: pageSize,
          ...normalizedParams,
        });
        allListItems.push(...nextPage.items);
      }

      const fullDetails: Vegetable[] = [];
      const batchSize = 5;
      let failedDetails = 0;

      for (let index = 0; index < allListItems.length; index += batchSize) {
        const batch = allListItems.slice(index, index + batchSize);
        const settled = await Promise.allSettled(
          batch.map((item) => getVegetable(item.id)),
        );
        const batchDetails = settled
          .filter(
            (result): result is PromiseFulfilledResult<Vegetable> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value);
        failedDetails += settled.length - batchDetails.length;
        fullDetails.push(...batchDetails);
      }

      const csvContent = toCsv(fullDetails);
      const filename = `vegetables_${getTimestamp()}.csv`;
      downloadCsv(csvContent, filename);
      setNotice(
        `Wyeksportowano ${fullDetails.length} warzyw do CSV${
          failedDetails > 0 ? ` (pominięto ${failedDetails}).` : "."
        }`,
      );
    } catch {
      setNotice("Nie udało się wyeksportować danych do CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warzywa
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">Lista warzyw</h1>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
              href="/vegetables/new"
            >
              Dodaj warzywo
            </Link>
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleExportCsv}
              disabled={isExporting}
            >
              {isExporting ? "Eksportowanie..." : "Eksport CSV"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0 || deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? "Usuwanie..."
                : `Usuń zaznaczone (${selectedIds.length})`}
            </button>
          </div>
        </div>
        <p className="text-base text-zinc-600">
          Wyszukuj i zarządzaj warzywami w bazie danych.
        </p>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm md:col-span-2"
            placeholder="Szukaj po nazwie"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={sunExposure}
            onChange={(event) =>
              setSunExposure(event.target.value as "" | SunExposure)
            }
          >
            <option value="">Sun exposure</option>
            {sunExposureOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={waterDemand}
            onChange={(event) =>
              setWaterDemand(event.target.value as "" | DemandLevel)
            }
          >
            <option value="">Water demand</option>
            {demandLevelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={nutrientDemand}
            onChange={(event) =>
              setNutrientDemand(event.target.value as "" | DemandLevel)
            }
          >
            <option value="">Nutrient demand</option>
            {demandLevelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={handleToggleAllOnPage}
                  aria-label="Zaznacz wszystkie rekordy na stronie"
                />
              </th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Latin name</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                  Ładowanie...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-4 py-6 text-red-500" colSpan={5}>
                  Nie udało się pobrać listy.
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                  Brak warzyw.
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleToggleSingle(item.id)}
                    aria-label={`Zaznacz rekord ${item.name}`}
                  />
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {item.latinName || "-"}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {item.imageUrl ? (
                    <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-[10px]">
                      IMG
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-xs font-medium">
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/vegetables/${item.id}`}
                    >
                      View
                    </Link>
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/vegetables/${item.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          Strona {data?.page ?? page} z{" "}
          {data ? Math.ceil(data.total / data.limit) : 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-zinc-200 px-3 py-1 text-sm"
            disabled={(data?.page ?? page) <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Wstecz
          </button>
          <button
            className="rounded-lg border border-zinc-200 px-3 py-1 text-sm"
            disabled={
              data ? data.page >= Math.ceil(data.total / data.limit) : false
            }
            onClick={() => setPage((prev) => prev + 1)}
          >
            Dalej
          </button>
          <select
            className="rounded-lg border border-zinc-200 px-2 py-1 text-sm"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            {[10, 20, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value} / strona
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
