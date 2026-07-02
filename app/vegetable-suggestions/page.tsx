"use client";

import Link from "next/link";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useGetVegetableSuggestions } from "@/app/api/queries/vegetable-suggestions/useGetVegetableSuggestions";
import { useDeleteVegetableSuggestion } from "@/app/api/mutations/vegetable-suggestions/useDeleteVegetableSuggestion";
import type { VegetableSuggestionAdminItem } from "@/app/api/api.types";

const LIMIT = 50;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function VegetableSuggestionsPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<VegetableSuggestionAdminItem | null>(
    null,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQ(value);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setDebouncedQ(value);
        setPage(1);
      }, 300);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const params = useMemo(
    () => ({ search: debouncedQ.trim() || undefined, page, limit: LIMIT }),
    [debouncedQ, page],
  );

  const { data, isLoading, error } = useGetVegetableSuggestions(params);
  const deleteMutation = useDeleteVegetableSuggestion();

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    const name = toDelete.name;
    setNotice(null);
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      setNotice(`Zgłoszenie „${name}“ zostało usunięte.`);
    } catch {
      setNotice("Nie udało się usunąć zgłoszenia.");
    } finally {
      setToDelete(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warzywa
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">
              Zgłoszenia warzyw
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Tutaj trafiają propozycje warzyw zgłoszone przez użytkowników
              aplikacji mobilnej. Po dodaniu warzywa do bazy usuń zgłoszenie z
              listy.
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <input
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Szukaj po nazwie warzywa…"
          value={q}
          onChange={handleSearchChange}
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
              <th className="px-4 py-3">Notatka użytkownika</th>
              <th className="px-4 py-3">Użytkownik</th>
              <th className="px-4 py-3">Data zgłoszenia</th>
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
                  {debouncedQ
                    ? "Brak wyników dla podanej frazy."
                    : "Brak zgłoszeń warzyw."}
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {item.note ?? (
                    <span className="italic text-zinc-400">Brak notatki</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {item.userId ?? (
                    <span className="italic text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-xs font-medium">
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/vegetables/new?suggestedName=${encodeURIComponent(item.name)}`}
                    >
                      Dodaj warzywo
                    </Link>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setToDelete(item)}
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
          Strona {data?.page ?? page} z {totalPages}
          {data ? ` (${data.total} łącznie)` : ""}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={(data?.page ?? page) <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Wstecz
          </button>
          <button
            className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={data ? data.page >= totalPages : false}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Dalej
          </button>
        </div>
      </div>

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-900">
              Usunąć zgłoszenie?
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Zgłoszenie{" "}
              <span className="font-medium">&quot;{toDelete.name}&quot;</span>{" "}
              zniknie z listy. Użyj tej akcji po dodaniu warzywa do bazy albo
              gdy zgłoszenie jest duplikatem lub nie jest potrzebne.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setToDelete(null)}
                disabled={deleteMutation.isPending}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Usuwanie…" : "Usuń zgłoszenie"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
