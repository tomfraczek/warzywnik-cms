"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export type RelationItem = {
  id: string;
  name: string;
  slug: string | null;
};

export type RelationPickedItem = {
  value: string;
  label: string;
};

type PaginatedResult = {
  items: RelationItem[];
  page: number;
  limit: number;
  total: number;
};

export type RelationPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: RelationPickedItem[]) => void;
  selectedValues: string[];
  fetchFn: (params: { page: number; q?: string }) => Promise<PaginatedResult>;
  queryKey: string[];
  title: string;
  filterItem?: (item: RelationItem) => boolean;
};

const getItemValue = (item: RelationItem): string =>
  (item.slug ?? "").trim() || item.id;

export const RelationPickerModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedValues,
  fetchFn,
  queryKey,
  title,
  filterItem,
}: RelationPickerModalProps) => {
  const [internalSelected, setInternalSelected] = useState<
    RelationPickedItem[]
  >([]);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // Inicjalizacja stanu przy otwarciu modala
  useEffect(() => {
    if (isOpen) {
      setInternalSelected(selectedValues.map((v) => ({ value: v, label: v })));
      setPage(1);
      setQ("");
      setDebouncedQ("");
    }
    // Celowo pomijamy selectedValues w dep array - inicjalizujemy tylko przy zmianie isOpen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Debounce wyszukiwania
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...queryKey, { page, q: debouncedQ }],
    queryFn: () => fetchFn({ page, q: debouncedQ || undefined }),
    enabled: isOpen,
    staleTime: 60_000,
  });

  // Aktualizacja etykiet wybranych elementów po załadowaniu danych
  useEffect(() => {
    if (!data) return;
    setInternalSelected((prev) =>
      prev.map((sel) => {
        const found = data.items.find(
          (item) => getItemValue(item) === sel.value,
        );
        return found ? { value: sel.value, label: found.name } : sel;
      }),
    );
  }, [data]);

  if (!isOpen) return null;

  const rawItems = data?.items ?? [];
  const items = filterItem ? rawItems.filter(filterItem) : rawItems;
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const loading = isLoading || isFetching;

  const isChecked = (item: RelationItem) => {
    const value = getItemValue(item);
    return internalSelected.some((s) => s.value === value);
  };

  const toggle = (item: RelationItem) => {
    const value = getItemValue(item);
    setInternalSelected((prev) => {
      const exists = prev.some((s) => s.value === value);
      if (exists) {
        return prev.filter((s) => s.value !== value);
      }
      return [...prev, { value, label: item.name }];
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="flex w-full max-w-lg flex-col rounded-xl bg-white shadow-lg"
        style={{ maxHeight: "90vh" }}
      >
        {/* Nagłówek */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <button
            type="button"
            className="text-sm text-zinc-500 hover:text-zinc-800"
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>

        {/* Wyszukiwarka */}
        <div className="border-b border-zinc-200 px-6 py-3">
          <input
            autoFocus
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            placeholder="Szukaj..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Lista elementów */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {loading && items.length === 0 && (
            <p className="text-sm text-zinc-500">Ładowanie...</p>
          )}
          {!loading && items.length === 0 && (
            <p className="text-sm text-zinc-500">Brak wyników.</p>
          )}
          <div className="space-y-2">
            {items.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={isChecked(item)}
                  onChange={() => toggle(item)}
                />
                {item.name}
              </label>
            ))}
          </div>
        </div>

        {/* Paginacja */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </button>
            <span className="text-xs text-zinc-500">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
          <span className="text-xs text-zinc-500">
            Wybrano: {internalSelected.length}
          </span>
        </div>

        {/* Przyciski akcji */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm"
            onClick={onClose}
          >
            Anuluj
          </button>
          <button
            type="button"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              onConfirm(internalSelected);
              onClose();
            }}
          >
            Potwierdź ({internalSelected.length})
          </button>
        </div>
      </div>
    </div>
  );
};
