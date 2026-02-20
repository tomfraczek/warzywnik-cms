"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetActionTemplates } from "@/app/api/queries/action-templates/useGetActionTemplates";
import { useDeleteActionTemplate } from "@/app/api/mutations/action-templates/useDeleteActionTemplate";

export default function ActionTemplatesPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [notice, setNotice] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const params = useMemo(
    () => ({ page, limit, q: q.trim() || undefined }),
    [page, limit, q],
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
          <Link
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            href="/action-templates/new"
          >
            Dodaj szablon
          </Link>
        </div>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <input
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Szukaj po nazwie lub slug"
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
              <th className="px-4 py-3">Nazwa</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Zakres</th>
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
                <td className="px-4 py-3 text-zinc-500">{item.slug}</td>
                <td className="px-4 py-3 text-zinc-500">{item.target}</td>
                <td className="px-4 py-3 text-zinc-500">{item.type}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {item.defaultDueOffsetDays}
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
