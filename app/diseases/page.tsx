"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getActionTemplate,
  getDisease,
  getDiseases,
} from "@/app/api/api.requests";
import type { Disease } from "@/app/api/api.types";
import { useGetDiseases } from "@/app/api/queries/diseases/useGetDiseases";
import { useDeleteDisease } from "@/app/api/mutations/diseases/useDeleteDisease";
import { useQueryClient } from "@tanstack/react-query";

const csvHeaders = [
  "id",
  "name",
  "description",
  "symptoms",
  "prevention",
  "treatment",
  "recommendedActions",
  "createdAt",
  "updatedAt",
];

const escapeCsv = (value: unknown) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

const toCsv = (rows: Disease[], actionNamesById: Map<string, string>) => {
  const header = csvHeaders.join(",");
  const body = rows.map((row) => {
    const actionNames = Array.from(
      new Set([
        ...(row.recommendedActions ?? []).map((item) => item.name),
        ...(row.recommendedActionTemplateIds ?? [])
          .map((id) => actionNamesById.get(id))
          .filter((name): name is string => Boolean(name)),
      ]),
    ).join(" | ");

    const values = [
      row.id,
      row.name,
      row.description,
      row.symptoms ?? "",
      row.prevention ?? "",
      row.treatment ?? "",
      actionNames,
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

export default function DiseasesPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const params = useMemo(
    () => ({ page, limit, q: q.trim() || undefined }),
    [page, limit, q],
  );

  const { data, isLoading, error } = useGetDiseases(params);
  const deleteMutation = useDeleteDisease();
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
    const confirmed = window.confirm("Czy na pewno usunąć chorobę?");
    if (!confirmed) return;

    setNotice(null);
    try {
      await deleteMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ["diseases"] });
      setSelectedIds((previous) =>
        previous.filter((selectedId) => selectedId !== id),
      );
      setNotice("Choroba została usunięta.");
    } catch {
      setNotice("Nie udało się usunąć choroby.");
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
      await queryClient.invalidateQueries({ queryKey: ["diseases"] });
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
      const normalizedQuery = q.trim() || undefined;
      const pageSize = 20;
      const firstPage = await getDiseases({
        page: 1,
        limit: pageSize,
        q: normalizedQuery,
      });

      const allListItems = [...firstPage.items];
      const totalPages = Math.ceil(firstPage.total / firstPage.limit);

      for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
        const nextPage = await getDiseases({
          page: currentPage,
          limit: pageSize,
          q: normalizedQuery,
        });
        allListItems.push(...nextPage.items);
      }

      const fullDetails: Disease[] = [];
      const batchSize = 5;
      let failedDetails = 0;

      for (let index = 0; index < allListItems.length; index += batchSize) {
        const batch = allListItems.slice(index, index + batchSize);
        const settled = await Promise.allSettled(
          batch.map((item) => getDisease(item.id)),
        );
        const batchDetails = settled
          .filter(
            (result): result is PromiseFulfilledResult<Disease> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value);
        failedDetails += settled.length - batchDetails.length;
        fullDetails.push(...batchDetails);
      }

      const actionTemplateIds = Array.from(
        new Set(
          fullDetails.flatMap((item) => [
            ...(item.recommendedActions ?? []).map((action) => action.id),
            ...(item.recommendedActionTemplateIds ?? []),
          ]),
        ),
      );

      const actionNamesById = new Map<string, string>();
      for (
        let index = 0;
        index < actionTemplateIds.length;
        index += batchSize
      ) {
        const batch = actionTemplateIds.slice(index, index + batchSize);
        const settled = await Promise.allSettled(
          batch.map((id) => getActionTemplate(id)),
        );

        settled.forEach((result, resultIndex) => {
          if (result.status === "fulfilled") {
            actionNamesById.set(batch[resultIndex], result.value.name);
          }
        });
      }

      const csvContent = toCsv(fullDetails, actionNamesById);
      const filename = `diseases_${getTimestamp()}.csv`;
      downloadCsv(csvContent, filename);
      setNotice(
        `Wyeksportowano ${fullDetails.length} chorób do CSV${
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
          Choroby
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">Lista chorób</h1>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
              href="/diseases/new"
            >
              Dodaj chorobę
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
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <input
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Szukaj po nazwie"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
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
              <th className="px-4 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={3}>
                  Ładowanie...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-4 py-6 text-red-500" colSpan={3}>
                  Nie udało się pobrać listy.
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={3}>
                  Brak chorób.
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
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-xs font-medium">
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/diseases/${item.id}`}
                    >
                      View
                    </Link>
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/diseases/${item.id}/edit`}
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
