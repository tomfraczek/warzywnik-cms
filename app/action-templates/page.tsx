"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getActionTemplate, getActionTemplates } from "@/app/api/api.requests";
import { useGetActionTemplates } from "@/app/api/queries/action-templates/useGetActionTemplates";
import { useDeleteActionTemplate } from "@/app/api/mutations/action-templates/useDeleteActionTemplate";
import {
  actionTemplateEnvironmentOptions,
  actionTemplateScopeOptions,
  actionTemplateTypeOptions,
  normalizeActionTemplateEnvironment,
  normalizeActionTemplateTarget,
} from "@/app/api/api.types";
import type { ActionTemplate } from "@/app/api/api.types";
import {
  actionTemplateEnvironmentLabels,
  actionTemplateTargetLabels,
  actionTemplateTypeLabels,
} from "@/app/utils/labels";

const csvHeaders = [
  "id",
  "name",
  "scope",
  "target",
  "environment",
  "type",
  "defaultDueOffsetDays",
  "description",
  "createdAt",
  "updatedAt",
];

const escapeCsv = (value: unknown) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

const toCsv = (rows: ActionTemplate[]) => {
  const header = csvHeaders.join(",");
  const body = rows.map((row) => {
    const values = [
      row.id,
      row.name,
      row.scope ?? "",
      row.target,
      row.environment,
      row.type,
      row.defaultDueOffsetDays ?? "",
      row.description ?? "",
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

export default function ActionTemplatesPage() {
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<
    "all" | (typeof actionTemplateScopeOptions)[number]
  >("all");
  const [environment, setEnvironment] = useState<
    "all" | (typeof actionTemplateEnvironmentOptions)[number]
  >("all");
  const [type, setType] = useState<
    "all" | (typeof actionTemplateTypeOptions)[number]
  >("all");
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
      target: target === "all" ? undefined : target,
      environment: environment === "all" ? undefined : environment,
      type: type === "all" ? undefined : type,
    }),
    [environment, limit, page, q, target, type],
  );

  const { data, isLoading, error } = useGetActionTemplates(params);
  const deleteMutation = useDeleteActionTemplate();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Czy na pewno usunąć szablon zabiegu?");
    if (!confirmed) return;

    setNotice(null);
    try {
      await deleteMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ["action-templates"] });
      setNotice("Szablon został usunięty.");
    } catch {
      setNotice("Nie udało się usunąć szablonu.");
    }
  };

  const handleExportCsv = async () => {
    setNotice(null);
    setIsExporting(true);

    try {
      const normalizedQuery = q.trim() || undefined;
      const pageSize = 100;
      const firstPage = await getActionTemplates({
        page: 1,
        limit: pageSize,
        q: normalizedQuery,
        target: target === "all" ? undefined : target,
        environment: environment === "all" ? undefined : environment,
        type: type === "all" ? undefined : type,
      });

      const allListItems = [...firstPage.items];
      const totalPages = Math.ceil(firstPage.total / firstPage.limit);

      for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
        const nextPage = await getActionTemplates({
          page: currentPage,
          limit: pageSize,
          q: normalizedQuery,
          target: target === "all" ? undefined : target,
          environment: environment === "all" ? undefined : environment,
          type: type === "all" ? undefined : type,
        });
        allListItems.push(...nextPage.items);
      }

      const fullDetails: ActionTemplate[] = [];
      const batchSize = 20;

      for (let index = 0; index < allListItems.length; index += batchSize) {
        const batch = allListItems.slice(index, index + batchSize);
        const batchDetails = await Promise.all(
          batch.map((item) => getActionTemplate(item.id)),
        );
        fullDetails.push(...batchDetails);
      }

      const csvContent = toCsv(fullDetails);
      const filename = `action-templates_${getTimestamp()}.csv`;
      downloadCsv(csvContent, filename);
      setNotice(`Wyeksportowano ${fullDetails.length} szablonów do CSV.`);
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
          Szablony zabiegów
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">
            Lista szablonów zabiegów
          </h1>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
              href="/action-templates/new"
            >
              Dodaj szablon
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

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            placeholder="Szukaj po nazwie/opisie"
            value={q}
            onChange={(event) => {
              setPage(1);
              setQ(event.target.value);
            }}
          />

          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={target}
            onChange={(event) => {
              setPage(1);
              setTarget(
                event.target.value as
                  | "all"
                  | (typeof actionTemplateScopeOptions)[number],
              );
            }}
          >
            <option value="all">Wszystkie zakresy</option>
            {actionTemplateScopeOptions.map((option) => (
              <option key={option} value={option}>
                {actionTemplateTargetLabels[option]}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={environment}
            onChange={(event) => {
              setPage(1);
              setEnvironment(
                event.target.value as
                  | "all"
                  | (typeof actionTemplateEnvironmentOptions)[number],
              );
            }}
          >
            <option value="all">Wszystkie środowiska</option>
            {actionTemplateEnvironmentOptions.map((option) => (
              <option key={option} value={option}>
                {actionTemplateEnvironmentLabels[option]}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={type}
            onChange={(event) => {
              setPage(1);
              setType(
                event.target.value as
                  | "all"
                  | (typeof actionTemplateTypeOptions)[number],
              );
            }}
          >
            <option value="all">Wszystkie typy</option>
            {actionTemplateTypeOptions.map((option) => (
              <option key={option} value={option}>
                {actionTemplateTypeLabels[option]}
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
              <th className="px-4 py-3">Nazwa</th>
              <th className="px-4 py-3">Zakres</th>
              <th className="px-4 py-3">Środowisko</th>
              <th className="px-4 py-3">Typ</th>
              <th className="px-4 py-3">Opóźnienie terminu (dni)</th>
              <th className="px-4 py-3">Aktualizacja</th>
              <th className="px-4 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={7}>
                  Ładowanie...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-4 py-6 text-red-500" colSpan={7}>
                  Nie udało się pobrać listy.
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={7}>
                  Brak szablonów zabiegów.
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {
                    actionTemplateTargetLabels[
                      normalizeActionTemplateTarget(item.target ?? item.scope)
                    ]
                  }
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {
                    actionTemplateEnvironmentLabels[
                      normalizeActionTemplateEnvironment(item.environment)
                    ]
                  }
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {actionTemplateTypeLabels[item.type] ?? item.type}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {item.defaultDueOffsetDays ?? "-"}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(item.updatedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-xs font-medium">
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/action-templates/${item.id}`}
                    >
                      Podgląd
                    </Link>
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/action-templates/${item.id}/edit`}
                    >
                      Edytuj
                    </Link>
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => handleDelete(item.id)}
                    >
                      Usuń
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
