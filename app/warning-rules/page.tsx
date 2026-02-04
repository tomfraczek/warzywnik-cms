"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetWarningRules } from "@/app/api/queries/warning-rules/useGetWarningRules";
import { useDeleteWarningRule } from "@/app/api/mutations/warning-rules/useDeleteWarningRule";
import { warningSeverityOptions } from "@/app/warning-rules/api/api.types";

const severityLabels = {
  INFO: "Informacja",
  WARNING: "Ostrzeżenie",
  CRITICAL: "Krytyczny",
} as const;

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleDateString("pl-PL");
};

export default function WarningRulesPage() {
  const [q, setQ] = useState("");
  const [severity, setSeverity] = useState<
    (typeof warningSeverityOptions)[number] | ""
  >("");
  const [enabled, setEnabled] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [notice, setNotice] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q.trim() || undefined,
      severity: severity || undefined,
      enabled:
        enabled === "all" ? undefined : enabled === "true" ? true : false,
    }),
    [page, limit, q, severity, enabled],
  );

  const { data, isLoading, error } = useGetWarningRules(params);
  const deleteMutation = useDeleteWarningRule();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Czy na pewno usunąć regułę?");
    if (!confirmed) return;

    setNotice(null);
    try {
      await deleteMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ["warning-rules"] });
      setNotice("Reguła została usunięta.");
    } catch {
      setNotice("Nie udało się usunąć reguły.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warning rules
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">
            Lista warning rules
          </h1>
          <Link
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            href="/warning-rules/new"
          >
            Dodaj regułę
          </Link>
        </div>
      </header>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-3">
        <input
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Szukaj po tytule"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={severity}
          onChange={(event) =>
            setSeverity(
              event.target.value as (typeof warningSeverityOptions)[number],
            )
          }
        >
          <option value="">Wszystkie poziomy</option>
          {warningSeverityOptions.map((option) => (
            <option key={option} value={option}>
              {severityLabels[option]}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={enabled}
          onChange={(event) =>
            setEnabled(event.target.value as "all" | "true" | "false")
          }
        >
          <option value="all">Status: wszystkie</option>
          <option value="true">Tylko włączone</option>
          <option value="false">Tylko wyłączone</option>
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
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Enabled</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={6}>
                  Ładowanie...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-4 py-6 text-red-500" colSpan={6}>
                  Nie udało się pobrać listy.
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={6}>
                  Brak reguł.
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 text-zinc-600">{item.code}</td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {item.title}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {severityLabels[item.severity]}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {item.enabled ? "Włączona" : "Wyłączona"}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {formatDate(item.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-xs font-medium">
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/warning-rules/${item.id}/edit`}
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
