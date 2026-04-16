"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  articleContextOptions,
  articleSeasonOptions,
  articleStatusOptions,
  type ArticleContext,
  type ArticleSeason,
  type ArticleStatus,
  type CreateArticlePayload,
} from "@/app/api/api.types";
import { getDiseases, getPests, getVegetables } from "@/app/api/api.requests";
import { getFertilizers } from "@/app/fertilizers/api/api.requests";
import { getSoils } from "@/app/soils/api/api.requests";
import { MediaLibraryModal } from "@/app/components/MediaLibraryModal";
import { QuillEditor } from "@/app/components/richtext/QuillEditor";
import type { MediaLibraryItem } from "@/app/api/api.types";
import { AxiosError } from "axios";

export type ArticleFormValues = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  months: number[];
  seasons: ArticleSeason[];
  contexts: ArticleContext[];
  priority: number;
  status: ArticleStatus;
  relatedVegetableIds: string[];
  relatedSoilIds: string[];
  relatedFertilizerIds: string[];
  relatedDiseaseIds: string[];
  relatedPestIds: string[];
  publishedAt: string | null;
};

const defaultValues: ArticleFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  months: [],
  seasons: [],
  contexts: [],
  priority: 3,
  status: "DRAFT",
  relatedVegetableIds: [],
  relatedSoilIds: [],
  relatedFertilizerIds: [],
  relatedDiseaseIds: [],
  relatedPestIds: [],
  publishedAt: null,
};

const seasonLabels: Record<ArticleSeason, string> = {
  winter: "Zima",
  spring: "Wiosna",
  summer: "Lato",
  autumn: "Jesień",
};

const contextLabels: Record<ArticleContext, string> = {
  planning: "Planowanie",
  soil_preparation: "Przygotowanie gleby",
  sowing: "Siew",
  harvest: "Zbiory",
  problem_solving: "Rozwiązywanie problemów",
  learning: "Nauka",
};

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: "Szkic",
  PUBLISHED: "Opublikowany",
};

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// ─── Reusable pill-toggle helper ───────────────────────────────────────────
type PillToggleGroupProps<T extends string> = {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (next: T[]) => void;
};
function PillToggleGroup<T extends string>({
  options,
  selected,
  onChange,
}: PillToggleGroupProps<T>) {
  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={
              active
                ? "rounded-full px-4 py-1.5 text-sm font-medium bg-zinc-900 text-white transition"
                : "rounded-full px-4 py-1.5 text-sm font-medium border border-zinc-300 text-zinc-700 hover:border-zinc-500 transition"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Month grid helper ──────────────────────────────────────────────────────
type MonthGridProps = {
  selected: number[];
  onChange: (next: number[]) => void;
};
function MonthGrid({ selected, onChange }: MonthGridProps) {
  const months = [
    { value: 1, short: "Sty" },
    { value: 2, short: "Lut" },
    { value: 3, short: "Mar" },
    { value: 4, short: "Kwi" },
    { value: 5, short: "Maj" },
    { value: 6, short: "Cze" },
    { value: 7, short: "Lip" },
    { value: 8, short: "Sie" },
    { value: 9, short: "Wrz" },
    { value: 10, short: "Paź" },
    { value: 11, short: "Lis" },
    { value: 12, short: "Gru" },
  ];
  const toggle = (v: number) => {
    if (selected.includes(v)) {
      onChange(selected.filter((m) => m !== v));
    } else {
      onChange([...selected, v].sort((a, b) => a - b));
    }
  };
  return (
    <div className="grid grid-cols-6 gap-2">
      {months.map(({ value, short }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={
              active
                ? "rounded-lg py-2 text-sm font-semibold bg-zinc-900 text-white transition"
                : "rounded-lg py-2 text-sm border border-zinc-200 text-zinc-600 hover:border-zinc-400 transition"
            }
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}

// ─── Searchable multi-select with chips ────────────────────────────────────
type SearchableMultiSelectProps = {
  label: string;
  items: { id: string; name: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  isLoading?: boolean;
  placeholder?: string;
};
function SearchableMultiSelect({
  label,
  items,
  selectedIds,
  onChange,
  isLoading,
  placeholder = "Szukaj…",
}: SearchableMultiSelectProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      )
    : items;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((v) => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      {isLoading ? (
        <div className="h-8 w-32 animate-pulse rounded-md bg-zinc-100" />
      ) : (
        <>
          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700"
                >
                  {item.name}
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label={`Usuń ${item.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
          <div className="max-h-44 overflow-y-auto rounded-lg border border-zinc-200 bg-white">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-zinc-400">Brak wyników.</p>
            ) : (
              filtered.map((item) => {
                const checked = selectedIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-zinc-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(item.id)}
                      className="accent-zinc-900"
                    />
                    <span
                      className={
                        checked ? "text-zinc-900 font-medium" : "text-zinc-700"
                      }
                    >
                      {item.name}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

type PaginatedListResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

const MAX_DICTIONARY_PAGES = 500;

const fetchAllPages = async <T,>(
  fetchPage: (page: number) => Promise<PaginatedListResponse<T>>,
) => {
  const firstPage = await fetchPage(1);
  const allItems = [...firstPage.items];

  if (firstPage.limit <= 0 || firstPage.total <= firstPage.items.length) {
    return allItems;
  }

  const totalPages = Math.ceil(firstPage.total / firstPage.limit);
  const lastPage = Math.min(totalPages, MAX_DICTIONARY_PAGES);

  for (let page = 2; page <= lastPage; page += 1) {
    const nextPage = await fetchPage(page);
    allItems.push(...nextPage.items);

    if (allItems.length >= firstPage.total) {
      break;
    }
  }

  return allItems;
};

type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string }>;
  content?: TiptapNode[];
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const applyMarks = (text: string, marks?: Array<{ type: string }>) => {
  if (!marks?.length) return text;
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${acc}</strong>`;
      case "italic":
        return `<em>${acc}</em>`;
      case "underline":
        return `<u>${acc}</u>`;
      case "strike":
        return `<s>${acc}</s>`;
      default:
        return acc;
    }
  }, text);
};

const renderTiptapNode = (node: TiptapNode): string => {
  const children = node.content?.map(renderTiptapNode).join("") ?? "";
  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return `<p>${children || "<br />"}</p>`;
    case "heading": {
      const level = (node.attrs?.level as number) || 2;
      const safeLevel = level === 1 || level === 2 || level === 3 ? level : 2;
      return `<h${safeLevel}>${children}</h${safeLevel}>`;
    }
    case "bulletList":
      return `<ul>${children}</ul>`;
    case "orderedList":
      return `<ol>${children}</ol>`;
    case "listItem":
      return `<li>${children}</li>`;
    case "image": {
      const src = String(node.attrs?.src ?? "");
      if (!src) return "";
      const alt = node.attrs?.alt
        ? ` alt=\"${escapeHtml(String(node.attrs.alt))}\"`
        : "";
      const title = node.attrs?.title
        ? ` title=\"${escapeHtml(String(node.attrs.title))}\"`
        : "";
      return `<img src=\"${escapeHtml(src)}\"${alt}${title} />`;
    }
    case "hardBreak":
      return "<br />";
    case "text": {
      const text = escapeHtml(node.text ?? "");
      return applyMarks(text, node.marks);
    }
    default:
      return children;
  }
};

const tiptapJsonToHtml = (data: TiptapNode): string => {
  if (!data?.type) return "";
  return renderTiptapNode(data);
};

const normalizeLegacyContent = (content: string) => {
  if (!content) return { html: "", isLegacy: false };
  if (content.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(content) as TiptapNode;
      if (parsed?.type === "doc") {
        return { html: tiptapJsonToHtml(parsed), isLegacy: true };
      }
    } catch {
      // ignore
    }
  }
  return { html: content, isLegacy: false };
};

const stripHtmlToText = (html: string) =>
  html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isHtmlEmpty = (html: string) => {
  if (!html) return true;
  if (/<img\b/i.test(html)) return false;
  return stripHtmlToText(html).length === 0;
};

export type ArticleFormProps = {
  initialValues?: Partial<ArticleFormValues>;
  onSubmit: (payload: CreateArticlePayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onUploadCover?: (file: File) => Promise<string | null>;
  onDeleteCover?: () => Promise<void>;
  onAssignCoverFromLibrary?: (url: string) => Promise<void> | void;
  onUploadContentImage?: (file: File) => Promise<string | null>;
};

export const ArticleForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
  onUploadCover,
  onDeleteCover,
  onAssignCoverFromLibrary,
  onUploadContentImage,
}: ArticleFormProps) => {
  const legacyContent = useMemo(
    () => normalizeLegacyContent(initialValues?.content ?? ""),
    [initialValues?.content],
  );
  const [values, setValues] = useState<ArticleFormValues>({
    ...defaultValues,
    ...initialValues,
    content: legacyContent.html,
  });
  const [clientError, setClientError] = useState<string | null>(null);
  const [isCoverLibraryOpen, setIsCoverLibraryOpen] = useState(false);
  const [isContentEmpty, setIsContentEmpty] = useState(() =>
    isHtmlEmpty(legacyContent.html),
  );
  const [isContentLibraryOpen, setIsContentLibraryOpen] = useState(false);
  const [isContentUploadOpen, setIsContentUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const uploadResolveRef = useRef<((url: string | null) => void) | null>(null);
  const pickResolveRef = useRef<((url: string | null) => void) | null>(null);

  const { data: vegetableItems = [], isLoading: vegetablesLoading } = useQuery({
    queryKey: ["vegetables", "all-for-article-form"],
    queryFn: () => fetchAllPages((page) => getVegetables({ page })),
  });
  const { data: soilItems = [], isLoading: soilsLoading } = useQuery({
    queryKey: ["soils", "all-for-article-form"],
    queryFn: () => fetchAllPages((page) => getSoils({ page })),
  });
  const { data: fertilizerItems = [], isLoading: fertilizersLoading } =
    useQuery({
      queryKey: ["fertilizers", "all-for-article-form"],
      queryFn: () => fetchAllPages((page) => getFertilizers({ page })),
    });
  const { data: diseaseItems = [], isLoading: diseasesLoading } = useQuery({
    queryKey: ["diseases", "all-for-article-form"],
    queryFn: () => fetchAllPages((page) => getDiseases({ page })),
  });
  const { data: pestItems = [], isLoading: pestsLoading } = useQuery({
    queryKey: ["pests", "all-for-article-form"],
    queryFn: () => fetchAllPages((page) => getPests({ page })),
  });

  const publishedLabel = useMemo(() => {
    if (!values.publishedAt) return "-";
    const parsed = new Date(values.publishedAt);
    if (Number.isNaN(parsed.getTime())) return values.publishedAt;
    return parsed.toLocaleString("pl-PL");
  }, [values.publishedAt]);

  const updateValue = <K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const [slugTouched, setSlugTouched] = useState(false);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s]+/g, "-");

  const handleTitleChange = (value: string) => {
    updateValue("title", value);
    if (!slugTouched) {
      updateValue("slug", slugify(value));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setClientError(null);

    if (values.title.trim().length < 1) {
      setClientError("Tytuł jest wymagany.");
      return;
    }
    if (values.slug.trim().length < 1) {
      setClientError("Slug jest wymagany.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(values.slug.trim())) {
      setClientError("Slug może zawierać tylko małe litery, cyfry i myślniki.");
      return;
    }
    if (values.excerpt.trim().length < 1) {
      setClientError("Lead jest wymagany.");
      return;
    }
    if (isHtmlEmpty(values.content) || isContentEmpty) {
      setClientError("Treść jest wymagana.");
      return;
    }
    if (!values.contexts.length) {
      setClientError("Wybierz co najmniej jeden kontekst.");
      return;
    }
    if (values.priority < 1 || values.priority > 5) {
      setClientError("Priorytet musi być w zakresie 1-5.");
      return;
    }
    if (values.coverImageUrl.trim() && !isValidUrl(values.coverImageUrl)) {
      setClientError("URL okładki nie jest poprawnym adresem.");
      return;
    }

    const invalidMonth = values.months.find((month) => month < 1 || month > 12);
    if (invalidMonth) {
      setClientError("Miesiące muszą być w zakresie 1-12.");
      return;
    }

    const payload: CreateArticlePayload = {
      slug: values.slug.trim(),
      title: values.title.trim(),
      excerpt: values.excerpt.trim(),
      content: values.content.trim(),
      coverImageUrl: values.coverImageUrl.trim() || null,
      status: values.status,
      priority: values.priority,
      months: values.months,
      seasons: values.seasons,
      contexts: values.contexts,
      relatedVegetableIds: values.relatedVegetableIds,
      relatedSoilIds: values.relatedSoilIds,
      relatedFertilizerIds: values.relatedFertilizerIds,
      relatedDiseaseIds: values.relatedDiseaseIds,
      relatedPestIds: values.relatedPestIds,
    };

    onSubmit(payload);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Podstawy</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Tytuł</span>
            <span className="text-xs text-zinc-500">
              Krótki tytuł artykułu widoczny w CMS i aplikacji.
            </span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Slug</span>
            <span className="text-xs text-zinc-500">
              Unikalny identyfikator URL. Generowany automatycznie z tytułu —
              możesz go zmienić.
            </span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm"
              value={values.slug}
              onChange={(event) => {
                setSlugTouched(true);
                updateValue("slug", event.target.value);
              }}
              required
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Lead</span>
          <span className="text-xs text-zinc-500">
            Krótki opis artykułu (np. 1-2 zdania). Wyświetlany na liście.
          </span>
          <textarea
            className="min-h-24 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.excerpt}
            onChange={(event) => updateValue("excerpt", event.target.value)}
            required
          />
        </label>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Treść</span>
          <span className="text-xs text-zinc-500">
            Treść artykułu (rich text).
          </span>
          <QuillEditor
            value={values.content}
            onChange={(html) => {
              updateValue("content", html);
              setIsContentEmpty(isHtmlEmpty(html));
            }}
            onRequestImageUpload={async () => {
              setUploadError(null);
              setUploadFile(null);
              setIsContentUploadOpen(true);
              return new Promise((resolve) => {
                uploadResolveRef.current = resolve;
              });
            }}
            onRequestImagePick={async () => {
              setIsContentLibraryOpen(true);
              return new Promise((resolve) => {
                pickResolveRef.current = resolve;
              });
            }}
          />
          {legacyContent.isLegacy && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              Treść jest w starym formacie. Otwórz i zapisz artykuł ponownie,
              aby przekonwertować.
            </div>
          )}
        </label>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Okładka</span>
          <span className="text-xs text-zinc-500">
            Opcjonalne zdjęcie okładki artykułu.
          </span>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                onClick={() => setIsCoverLibraryOpen(true)}
              >
                Wybierz z biblioteki
              </button>
              {onUploadCover && (
                <label className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                  {coverUploading ? "Wgrywanie..." : "Dodaj z dysku"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={coverUploading}
                    onChange={async (event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (!file) return;
                      setCoverUploadError(null);
                      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
                        setCoverUploadError(
                          "Dozwolone formaty: JPG, PNG, WEBP.",
                        );
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        setCoverUploadError(
                          "Maksymalny rozmiar pliku to 5 MB.",
                        );
                        return;
                      }
                      try {
                        setCoverUploading(true);
                        const url = await onUploadCover(file);
                        if (url) {
                          updateValue("coverImageUrl", url);
                        }
                      } catch (err) {
                        if (
                          err instanceof AxiosError &&
                          err.response?.status === 401
                        ) {
                          setCoverUploadError("Wymagane zalogowanie.");
                        } else {
                          setCoverUploadError("Nie udało się wgrać okładki.");
                        }
                      } finally {
                        setCoverUploading(false);
                        event.target.value = "";
                      }
                    }}
                  />
                </label>
              )}
              {values.coverImageUrl && (
                <button
                  type="button"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  onClick={async () => {
                    setCoverUploadError(null);
                    if (onDeleteCover) {
                      await onDeleteCover();
                    }
                    updateValue("coverImageUrl", "");
                  }}
                >
                  Usuń okładkę
                </button>
              )}
            </div>
            {coverUploadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {coverUploadError}
              </div>
            )}
            {values.coverImageUrl && (
              <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                <Image
                  src={values.coverImageUrl}
                  alt="Okładka artykułu"
                  width={512}
                  height={128}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
          </div>
        </label>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Publikacja</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Status</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.status}
              onChange={(event) =>
                updateValue("status", event.target.value as ArticleStatus)
              }
            >
              {articleStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {statusLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Priorytet</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.priority}
              onChange={(event) =>
                updateValue("priority", Number(event.target.value))
              }
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Data publikacji</span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-500"
              value={publishedLabel}
              readOnly
            />
          </label>
        </div>
        {values.status === "PUBLISHED" && !values.publishedAt && (
          <p className="mt-2 text-xs text-zinc-500">
            Data publikacji zostanie ustawiona automatycznie po opublikowaniu.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Tagi czasowe</h2>
        <div className="mt-4 space-y-6">
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Miesiące</span>
            <span className="text-xs text-zinc-500">
              Kliknij miesiące, których dotyczy artykuł.
            </span>
            <MonthGrid
              selected={values.months}
              onChange={(months) => updateValue("months", months)}
            />
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Sezony</span>
            <span className="text-xs text-zinc-500">
              Kliknij sezony, których dotyczy artykuł.
            </span>
            <PillToggleGroup
              options={articleSeasonOptions.map((s) => ({
                value: s,
                label: seasonLabels[s],
              }))}
              selected={values.seasons}
              onChange={(seasons) => updateValue("seasons", seasons)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Konteksty</h2>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <span className="font-medium">Konteksty artykułu</span>
          <span className="text-xs text-zinc-500">
            Wybierz co najmniej jeden kontekst użycia.
          </span>
          <PillToggleGroup
            options={articleContextOptions.map((c) => ({
              value: c,
              label: contextLabels[c],
            }))}
            selected={values.contexts}
            onChange={(contexts) => updateValue("contexts", contexts)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Powiązania</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Wyszukaj i zaznacz powiązane elementy. Zaznaczone pozycje pojawią się
          jako tagi powyżej pola wyszukiwania.
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <SearchableMultiSelect
            label="Warzywa"
            items={vegetableItems}
            selectedIds={values.relatedVegetableIds}
            onChange={(ids) => updateValue("relatedVegetableIds", ids)}
            isLoading={vegetablesLoading}
            placeholder="Szukaj warzywa…"
          />
          <SearchableMultiSelect
            label="Gleby"
            items={soilItems}
            selectedIds={values.relatedSoilIds}
            onChange={(ids) => updateValue("relatedSoilIds", ids)}
            isLoading={soilsLoading}
            placeholder="Szukaj gleby…"
          />
          <SearchableMultiSelect
            label="Nawozy"
            items={fertilizerItems}
            selectedIds={values.relatedFertilizerIds}
            onChange={(ids) => updateValue("relatedFertilizerIds", ids)}
            isLoading={fertilizersLoading}
            placeholder="Szukaj nawozu…"
          />
          <SearchableMultiSelect
            label="Choroby"
            items={diseaseItems}
            selectedIds={values.relatedDiseaseIds}
            onChange={(ids) => updateValue("relatedDiseaseIds", ids)}
            isLoading={diseasesLoading}
            placeholder="Szukaj choroby…"
          />
          <SearchableMultiSelect
            label="Szkodniki"
            items={pestItems}
            selectedIds={values.relatedPestIds}
            onChange={(ids) => updateValue("relatedPestIds", ids)}
            isLoading={pestsLoading}
            placeholder="Szukaj szkodnika…"
          />
        </div>
      </section>

      {(clientError || errorMessage) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {clientError ?? errorMessage}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Zapisywanie..." : submitLabel}
        </button>
      </div>

      <MediaLibraryModal
        isOpen={isCoverLibraryOpen}
        onClose={() => setIsCoverLibraryOpen(false)}
        onSelect={async (item: MediaLibraryItem) => {
          if (onAssignCoverFromLibrary) {
            await onAssignCoverFromLibrary(item.publicUrl);
          }
          updateValue("coverImageUrl", item.publicUrl);
        }}
        onUpload={
          onUploadCover
            ? async (file) => {
                const url = await onUploadCover(file);
                if (!url) return null;
                updateValue("coverImageUrl", url);
                return {
                  key: url,
                  publicUrl: url,
                  fileName: file.name,
                };
              }
            : undefined
        }
        title="Wybierz okładkę"
        initialTab="articles"
      />

      <MediaLibraryModal
        isOpen={isContentLibraryOpen}
        onClose={() => {
          setIsContentLibraryOpen(false);
          pickResolveRef.current?.(null);
          pickResolveRef.current = null;
        }}
        onSelect={(item: MediaLibraryItem) => {
          setIsContentLibraryOpen(false);
          pickResolveRef.current?.(item.publicUrl);
          pickResolveRef.current = null;
        }}
        onUpload={
          onUploadContentImage
            ? async (file) => {
                const url = await onUploadContentImage(file);
                if (!url) return null;
                return {
                  key: url,
                  publicUrl: url,
                  fileName: file.name,
                };
              }
            : undefined
        }
        title="Wybierz obraz do treści"
        initialTab="articles"
      />

      {isContentUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-900">Dodaj obraz</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Wybierz plik graficzny (max 5 MB).
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setUploadError(null);
                  setUploadFile(file);
                }}
              />
              {uploadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {uploadError}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm"
                onClick={() => {
                  setIsContentUploadOpen(false);
                  uploadResolveRef.current?.(null);
                  uploadResolveRef.current = null;
                }}
              >
                Anuluj
              </button>
              <button
                type="button"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={false}
                onClick={async () => {
                  if (!uploadFile) {
                    setUploadError("Wybierz plik do uploadu.");
                    return;
                  }
                  if (!uploadFile.type.match(/image\/(jpeg|png|webp)/)) {
                    setUploadError("Dozwolone formaty: JPG, PNG, WEBP.");
                    return;
                  }
                  const maxSize = 5 * 1024 * 1024;
                  if (uploadFile.size > maxSize) {
                    setUploadError("Maksymalny rozmiar pliku to 5 MB.");
                    return;
                  }
                  try {
                    if (!onUploadContentImage) {
                      setUploadError("Zapisz artykuł, aby dodać obraz.");
                      return;
                    }
                    const url = await onUploadContentImage(uploadFile);
                    if (!url) {
                      setUploadError(
                        "Upload nie zwrócił poprawnego adresu URL.",
                      );
                      return;
                    }
                    setIsContentUploadOpen(false);
                    uploadResolveRef.current?.(url);
                    uploadResolveRef.current = null;
                  } catch (err) {
                    if (
                      err instanceof AxiosError &&
                      err.response?.status === 401
                    ) {
                      setUploadError("Wymagane zalogowanie.");
                      return;
                    }
                    setUploadError("Nie udało się przesłać obrazka.");
                  }
                }}
              >
                Wstaw obraz
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
