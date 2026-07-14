"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGetContactMessages } from "@/app/api/queries/contact-messages/useGetContactMessages";
import { useDeleteContactMessage } from "@/app/api/mutations/contact-messages/useDeleteContactMessage";
import {
  contactMessageCategoryOptions,
  type ContactMessageAdminItem,
  type ContactMessageCategory,
} from "@/app/api/api.types";
import { contactMessageCategoryLabels } from "@/app/utils/labels";
import ConfirmDeleteDialog from "@/app/components/ConfirmDeleteDialog";

const LIMIT = 50;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function ContactMessagesPage() {
  return (
    <Suspense fallback={null}>
      <ContactMessagesPageContent />
    </Suspense>
  );
}

function ContactMessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState<ContactMessageCategory | "">("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessageAdminItem | null>(
    null,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      setNotice("Wiadomość została usunięta.");
      router.replace("/contact-messages");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value as ContactMessageCategory | "");
    setPage(1);
  };

  const hasActiveFilters = Boolean(q) || Boolean(category);

  const handleClearFilters = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setQ("");
    setDebouncedQ("");
    setCategory("");
    setPage(1);
  };

  const params = useMemo(
    () => ({
      search: debouncedQ.trim() || undefined,
      category: category || undefined,
      page,
      limit: LIMIT,
    }),
    [debouncedQ, category, page],
  );

  const { data, isLoading, error } = useGetContactMessages(params);
  const deleteMutation = useDeleteContactMessage();

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setNotice(null);
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      setNotice("Wiadomość została usunięta.");
      setToDelete(null);
    } catch {
      setNotice("Nie udało się usunąć wiadomości.");
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;
  const hasAnyFilters = Boolean(debouncedQ) || Boolean(category);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Wiadomości
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">
              Wiadomości
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Wiadomości wysłane przez użytkowników aplikacji mobilnej przez
              formularz kontaktowy.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-3">
        <input
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Szukaj po tytule lub treści…"
          value={q}
          onChange={handleSearchChange}
        />
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="">Wszystkie kategorie</option>
          {contactMessageCategoryOptions.map((option) => (
            <option key={option} value={option}>
              {contactMessageCategoryLabels[option]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Wyczyść filtry
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-215 text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Kategoria</th>
                <th className="px-4 py-3">Tytuł</th>
                <th className="px-4 py-3">Nadawca</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3 text-right">Akcje</th>
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
                    Nie udało się pobrać listy wiadomości.
                  </td>
                </tr>
              )}
              {!isLoading && !error && data?.items.length === 0 && (
                <tr>
                  <td className="px-4 py-6" colSpan={6}>
                    {hasAnyFilters ? (
                      <div>
                        <p className="font-medium text-zinc-900">
                          Brak wyników
                        </p>
                        <p className="mt-1 text-zinc-500">
                          Nie znaleziono wiadomości pasujących do wybranych
                          filtrów.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-zinc-900">
                          Brak wiadomości
                        </p>
                        <p className="mt-1 text-zinc-500">
                          Użytkownicy nie wysłali jeszcze żadnych wiadomości.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
              {data?.items.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer border-t border-zinc-100 hover:bg-zinc-50"
                  onClick={() => router.push(`/contact-messages/${item.id}`)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      {contactMessageCategoryLabels[item.category]}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-zinc-900">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {item.userDisplayName || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {item.userEmail || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex justify-end gap-3 text-xs font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        className="text-zinc-600 hover:text-zinc-900"
                        href={`/contact-messages/${item.id}`}
                      >
                        Szczegóły
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
        <ConfirmDeleteDialog
          title="Usuń wiadomość?"
          description="Ta operacja jest nieodwracalna. Wiadomość zostanie trwale usunięta."
          isPending={deleteMutation.isPending}
          onCancel={() => setToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </section>
  );
}
