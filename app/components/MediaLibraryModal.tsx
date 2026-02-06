"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useGetMediaLibrary } from "@/app/api/queries/media/useGetMediaLibrary";
import type { MediaItem } from "@/app/api/api.types";

const resolveMediaUrl = (item: MediaItem) =>
  item.url || item.publicUrl || item.cdnUrl || "";

const resolveMediaLabel = (item: MediaItem) =>
  item.fileName || item.name || item.id;

export type MediaLibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
};

export const MediaLibraryModal = ({
  isOpen,
  onClose,
  onSelect,
  title = "Biblioteka mediów",
}: MediaLibraryModalProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [q, setQ] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const params = useMemo(
    () => ({ page, limit, q: q.trim() || undefined }),
    [page, limit, q],
  );
  const { data, isLoading, error } = useGetMediaLibrary(params);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (!selectedUrl) return;
    onSelect(selectedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-5xl rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <button
            type="button"
            className="text-sm text-zinc-500"
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-6 py-4">
          <input
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            placeholder="Szukaj po nazwie pliku"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            {[12, 24, 48].map((value) => (
              <option key={value} value={value}>
                {value} / strona
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {isLoading && <p className="text-sm text-zinc-500">Ładowanie...</p>}
          {error && (
            <p className="text-sm text-red-500">Nie udało się pobrać mediów.</p>
          )}
          {!isLoading && data?.items.length === 0 && (
            <p className="text-sm text-zinc-500">Brak plików w bibliotece.</p>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data?.items.map((item) => {
              const url = resolveMediaUrl(item);
              if (!url) return null;
              const isSelected = selectedUrl === url;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`flex flex-col overflow-hidden rounded-lg border text-left ${
                    isSelected
                      ? "border-emerald-400 ring-2 ring-emerald-200"
                      : "border-zinc-200"
                  }`}
                  onClick={() => setSelectedUrl(url)}
                >
                  <div className="aspect-square w-full overflow-hidden bg-zinc-50">
                    <Image
                      src={url}
                      alt={resolveMediaLabel(item)}
                      className="h-full w-full object-cover"
                      width={240}
                      height={240}
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                  <div className="px-3 py-2">
                    <p className="truncate text-xs text-zinc-600">
                      {resolveMediaLabel(item)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
          <div className="text-sm text-zinc-500">
            Strona {data?.page ?? page} z{" "}
            {data ? Math.ceil(data.total / data.limit) : 1}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-3 py-1 text-sm"
              disabled={(data?.page ?? page) <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Wstecz
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-3 py-1 text-sm"
              disabled={
                data ? data.page >= Math.ceil(data.total / data.limit) : false
              }
              onClick={() => setPage((prev) => prev + 1)}
            >
              Dalej
            </button>
            <button
              type="button"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={!selectedUrl}
              onClick={handleSelect}
            >
              Wybierz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
