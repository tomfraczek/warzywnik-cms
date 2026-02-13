"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AxiosError } from "axios";
import type {
  MediaLibraryItem,
  MediaLibraryResponse,
} from "@/app/api/api.types";
import { useGetVegetablesMediaLibrary } from "@/app/api/queries/media/useGetVegetablesMediaLibrary";
import { useGetArticlesMediaLibrary } from "@/app/api/queries/media/useGetArticlesMediaLibrary";

type MediaLibraryTab = "vegetables" | "articles";

const resolveMediaUrl = (item: MediaLibraryItem) => {
  const url = item.publicUrl;
  if (url.endsWith("/") && item.fileName) {
    return `${url}${item.fileName}`;
  }
  return url;
};

export type MediaLibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MediaLibraryItem, tab: MediaLibraryTab) => void;
  onUpload?: (
    file: File,
    tab: MediaLibraryTab,
  ) => Promise<MediaLibraryItem | null>;
  title?: string;
  initialTab?: MediaLibraryTab;
};

export const MediaLibraryModal = ({
  isOpen,
  onClose,
  onSelect,
  onUpload,
  title = "Biblioteka mediów",
  initialTab = "articles",
}: MediaLibraryModalProps) => {
  const [activeTab, setActiveTab] = useState<MediaLibraryTab>(initialTab);
  const [limit, setLimit] = useState(24);
  const [q, setQ] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaLibraryItem | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const params = useMemo(() => ({ limit }), [limit]);
  const vegetablesQuery = useGetVegetablesMediaLibrary(params);
  const articlesQuery = useGetArticlesMediaLibrary(params);
  const currentQuery =
    activeTab === "vegetables" ? vegetablesQuery : articlesQuery;

  const items = useMemo(() => {
    const pages = (currentQuery.data?.pages ?? []) as MediaLibraryResponse[];
    const all = pages.flatMap((page) => page.items);
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter((item) => item.fileName.toLowerCase().includes(term));
  }, [currentQuery.data, q]);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (!selectedItem) return;
    onSelect(selectedItem, activeTab);
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
          <div className="flex gap-2">
            <button
              type="button"
              className={`rounded-lg px-3 py-1 text-sm ${
                activeTab === "articles"
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200"
              }`}
              onClick={() => {
                setActiveTab("articles");
                setSelectedItem(null);
              }}
            >
              Artykuły
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-1 text-sm ${
                activeTab === "vegetables"
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200"
              }`}
              onClick={() => {
                setActiveTab("vegetables");
                setSelectedItem(null);
              }}
            >
              Warzywa
            </button>
          </div>
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
          {onUpload && (
            <label className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-2 text-sm">
              Dodaj obraz
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (!file) return;
                  setUploadError(null);
                  if (!file.type.match(/image\/(jpeg|png|webp)/)) {
                    setUploadError("Dozwolone formaty: JPG, PNG, WEBP.");
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    setUploadError("Maksymalny rozmiar pliku to 5 MB.");
                    return;
                  }
                  try {
                    setIsUploading(true);
                    const item = await onUpload(file, activeTab);
                    if (item) {
                      setSelectedItem(item);
                      await currentQuery.refetch();
                    }
                  } catch (err) {
                    if (
                      err instanceof AxiosError &&
                      err.response?.status === 401
                    ) {
                      setUploadError("Wymagane zalogowanie.");
                    } else {
                      setUploadError("Nie udało się wgrać pliku.");
                    }
                  } finally {
                    setIsUploading(false);
                  }
                }}
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          {currentQuery.isLoading && (
            <p className="text-sm text-zinc-500">Ładowanie...</p>
          )}
          {currentQuery.error && (
            <p className="text-sm text-red-500">
              {currentQuery.error instanceof AxiosError &&
              currentQuery.error.response?.status === 401
                ? "Wymagane zalogowanie."
                : "Nie udało się pobrać mediów."}
            </p>
          )}
          {!currentQuery.isLoading && items.length === 0 && (
            <p className="text-sm text-zinc-500">Brak plików w bibliotece.</p>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {items.map((item) => {
              const isSelected = selectedItem?.key === item.key;
              const src = resolveMediaUrl(item);
              return (
                <button
                  type="button"
                  key={item.key}
                  className={`flex flex-col overflow-hidden rounded-lg border text-left ${
                    isSelected
                      ? "border-emerald-400 ring-2 ring-emerald-200"
                      : "border-zinc-200"
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-square w-full overflow-hidden bg-zinc-50">
                    <Image
                      src={src}
                      alt={item.fileName}
                      className="h-full w-full object-cover"
                      width={240}
                      height={240}
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                  <div className="px-3 py-2">
                    <p className="truncate text-xs text-zinc-600">
                      {item.fileName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              disabled={
                !currentQuery.hasNextPage || currentQuery.isFetchingNextPage
              }
              onClick={() => currentQuery.fetchNextPage()}
            >
              {currentQuery.isFetchingNextPage
                ? "Ładowanie..."
                : currentQuery.hasNextPage
                  ? "Załaduj więcej"
                  : "Brak kolejnych"}
            </button>
          </div>
        </div>
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
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={!selectedItem}
            onClick={handleSelect}
          >
            Wybierz
          </button>
        </div>
      </div>
    </div>
  );
};
