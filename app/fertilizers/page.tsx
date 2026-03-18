"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetFertilizers } from "@/app/api/queries/fertilizers/useGetFertilizers";
import { useDeleteFertilizer } from "@/app/api/mutations/fertilizers/useDeleteFertilizer";
import {
  getFertilizer,
  getFertilizers,
} from "@/app/fertilizers/api/api.requests";
import {
  fertilizerCategoryOptions,
  type FertilizerType,
} from "@/app/fertilizers/api/api.types";

const csvHeaders = [
  "id",
  "name",
  "description",
  "category",
  "form",
  "applicationMethod",
  "riskLevel",
  "nitrogenEffect",
  "phosphorusEffect",
  "potassiumEffect",
  "phEffect",
  "soilStructureEffect",
  "waterRetentionEffect",
  "drainageEffect",
  "recommendedFrequency",
  "dosageGuidance",
  "notes",
  "isActive",
  "createdAt",
  "updatedAt",
];

const escapeCsv = (value: unknown) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

const toCsv = (rows: FertilizerType[]) => {
  const header = csvHeaders.join(",");
  const body = rows.map((row) => {
    const values = [
      row.id,
      row.name,
      row.description,
      row.category,
      row.form,
      row.applicationMethod,
      row.riskLevel,
      row.nitrogenEffect,
      row.phosphorusEffect,
      row.potassiumEffect,
      row.phEffect,
      row.soilStructureEffect,
      row.waterRetentionEffect,
      row.drainageEffect,
      row.recommendedFrequency,
      row.dosageGuidance ?? "",
      row.notes ?? "",
      row.isActive,
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

const categoryLabels = {
  ORGANIC: "Organiczny",
  MINERAL: "Mineralny",
  BIO_STIMULANT: "Biostymulator",
  SOIL_AMENDMENT: "Polepszacz gleby",
  PH_ADJUSTER: "Regulator pH",
} as const;

export default function FertilizersPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<
    (typeof fertilizerCategoryOptions)[number] | ""
  >("");
  const [isActive, setIsActive] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const queryClient = useQueryClient();

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q.trim() || undefined,
      category: category || undefined,
      isActive:
        isActive === "all" ? undefined : isActive === "true" ? true : false,
    }),
    [page, limit, q, category, isActive],
  );

  const { data, isLoading, error } = useGetFertilizers(params);
  const deleteMutation = useDeleteFertilizer();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Czy na pewno usunąć nawóz?");
    if (!confirmed) return;

    setNotice(null);
    try {
      await deleteMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ["fertilizers"] });
      setNotice("Nawóz został usunięty.");
    } catch {
      setNotice("Nie udało się usunąć nawozu.");
    }
  };

  const handleExportCsv = async () => {
    setNotice(null);
    setIsExporting(true);

    try {
      const normalizedParams = {
        q: q.trim() || undefined,
        category: category || undefined,
        isActive:
          isActive === "all" ? undefined : isActive === "true" ? true : false,
      };
      const pageSize = 20;
      const firstPage = await getFertilizers({
        page: 1,
        limit: pageSize,
        ...normalizedParams,
      });

      const allListItems = [...firstPage.items];
      const totalPages = Math.ceil(firstPage.total / firstPage.limit);

      for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
        const nextPage = await getFertilizers({
          page: currentPage,
          limit: pageSize,
          ...normalizedParams,
        });
        allListItems.push(...nextPage.items);
      }

      const fullDetails: FertilizerType[] = [];
      const batchSize = 5;
      let failedDetails = 0;

      for (let index = 0; index < allListItems.length; index += batchSize) {
        const batch = allListItems.slice(index, index + batchSize);
        const settled = await Promise.allSettled(
          batch.map((item) => getFertilizer(item.id)),
        );
        const batchDetails = settled
          .filter(
            (result): result is PromiseFulfilledResult<FertilizerType> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value);
        failedDetails += settled.length - batchDetails.length;
        fullDetails.push(...batchDetails);
      }

      const csvContent = toCsv(fullDetails);
      const filename = `fertilizers_${getTimestamp()}.csv`;
      downloadCsv(csvContent, filename);
      setNotice(
        `Wyeksportowano ${fullDetails.length} nawozów do CSV${
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
          Nawozy
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">
            Lista nawozów
          </h1>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
              href="/fertilizers/new"
            >
              Dodaj nawóz
            </Link>
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleExportCsv}
              disabled={isExporting}
            >
              {isExporting ? "Eksportowanie..." : "Eksport CSV"}
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-3">
        <input
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Szukaj po nazwie"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value as (typeof fertilizerCategoryOptions)[number],
            )
          }
        >
          <option value="">Wszystkie kategorie</option>
          {fertilizerCategoryOptions.map((option) => (
            <option key={option} value={option}>
              {categoryLabels[option]}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={isActive}
          onChange={(event) =>
            setIsActive(event.target.value as "all" | "true" | "false")
          }
        >
          <option value="all">Status: wszystkie</option>
          <option value="true">Tylko aktywne</option>
          <option value="false">Tylko nieaktywne</option>
        </select>
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Kategoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={4}>
                  Ładowanie...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-4 py-6 text-red-500" colSpan={4}>
                  Nie udało się pobrać listy.
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={4}>
                  Brak nawozów.
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {categoryLabels[item.category]}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {item.isActive ? "Aktywny" : "Nieaktywny"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-xs font-medium">
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/fertilizers/${item.id}`}
                    >
                      View
                    </Link>
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/fertilizers/${item.id}/edit`}
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
