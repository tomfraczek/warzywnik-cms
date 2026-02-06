"use client";

import { useMemo, useState } from "react";
import {
  articleContextOptions,
  articleSeasonOptions,
  articleStatusOptions,
  type ArticleContext,
  type ArticleSeason,
  type ArticleStatus,
  type CreateArticlePayload,
} from "@/app/api/api.types";
import { useGetVegetables } from "@/app/api/queries/vegetables/useGetVegetables";
import { useGetSoils } from "@/app/api/queries/soils/useGetSoils";
import { useGetFertilizers } from "@/app/api/queries/fertilizers/useGetFertilizers";
import { useGetDiseases } from "@/app/api/queries/diseases/useGetDiseases";
import { useGetPests } from "@/app/api/queries/pests/useGetPests";

export type ArticleFormValues = {
  title: string;
  slug: string;
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
  title: "",
  slug: "",
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

const monthOptions = [
  { value: 1, label: "Styczeń" },
  { value: 2, label: "Luty" },
  { value: 3, label: "Marzec" },
  { value: 4, label: "Kwiecień" },
  { value: 5, label: "Maj" },
  { value: 6, label: "Czerwiec" },
  { value: 7, label: "Lipiec" },
  { value: 8, label: "Sierpień" },
  { value: 9, label: "Wrzesień" },
  { value: 10, label: "Październik" },
  { value: 11, label: "Listopad" },
  { value: 12, label: "Grudzień" },
];

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

const isLowercaseSlug = (value: string) => /^[a-z0-9-]{2,}$/.test(value);

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export type ArticleFormProps = {
  initialValues?: Partial<ArticleFormValues>;
  onSubmit: (payload: CreateArticlePayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export const ArticleForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
}: ArticleFormProps) => {
  const [values, setValues] = useState<ArticleFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [clientError, setClientError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: vegetablesData, isLoading: vegetablesLoading } =
    useGetVegetables({ page: 1, limit: 100 });
  const { data: soilsData, isLoading: soilsLoading } = useGetSoils({
    page: 1,
    limit: 100,
  });
  const { data: fertilizersData, isLoading: fertilizersLoading } =
    useGetFertilizers({ page: 1, limit: 100 });
  const { data: diseasesData, isLoading: diseasesLoading } = useGetDiseases({
    page: 1,
    limit: 100,
  });
  const { data: pestsData, isLoading: pestsLoading } = useGetPests({
    page: 1,
    limit: 100,
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
    if (!isLowercaseSlug(values.slug.trim())) {
      setClientError("Slug musi mieć min 2 znaki i tylko a-z0-9-.");
      return;
    }
    if (values.excerpt.trim().length < 1) {
      setClientError("Lead jest wymagany.");
      return;
    }
    if (values.content.trim().length < 1) {
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
      title: values.title.trim(),
      slug: values.slug.trim(),
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
              Unikalny identyfikator techniczny. Tylko małe litery, cyfry i
              myślniki.
            </span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
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
            Treść artykułu (na start markdown/textarea).
          </span>
          <textarea
            className="min-h-48 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.content}
            onChange={(event) => updateValue("content", event.target.value)}
            required
          />
        </label>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Okładka (URL)</span>
          <span className="text-xs text-zinc-500">
            Opcjonalny link do obrazka okładki.
          </span>
          <input
            className="rounded-lg border border-zinc-200 px-3 py-2"
            value={values.coverImageUrl}
            onChange={(event) =>
              updateValue("coverImageUrl", event.target.value)
            }
            placeholder="https://"
          />
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
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Miesiące</span>
            <span className="text-xs text-zinc-500">
              Wybierz miesiące, których dotyczy artykuł.
            </span>
            <select
              multiple
              className="min-h-32 rounded-lg border border-zinc-200 px-3 py-2"
              value={values.months.map(String)}
              onChange={(event) =>
                updateValue(
                  "months",
                  Array.from(event.target.selectedOptions, (option) =>
                    Number(option.value),
                  ).filter((value) => Number.isFinite(value)),
                )
              }
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value} - {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Sezony</span>
            <span className="text-xs text-zinc-500">
              Wybierz sezony, których dotyczy artykuł.
            </span>
            <select
              multiple
              className="min-h-32 rounded-lg border border-zinc-200 px-3 py-2"
              value={values.seasons}
              onChange={(event) =>
                updateValue(
                  "seasons",
                  Array.from(event.target.selectedOptions, (option) =>
                    option.value.trim(),
                  ).filter(Boolean) as ArticleSeason[],
                )
              }
            >
              {articleSeasonOptions.map((option) => (
                <option key={option} value={option}>
                  {seasonLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Konteksty</h2>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Konteksty artykułu</span>
          <span className="text-xs text-zinc-500">
            Wybierz co najmniej jeden kontekst użycia.
          </span>
          <select
            multiple
            className="min-h-32 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.contexts}
            onChange={(event) =>
              updateValue(
                "contexts",
                Array.from(event.target.selectedOptions, (option) =>
                  option.value.trim(),
                ).filter(Boolean) as ArticleContext[],
              )
            }
            required
          >
            {articleContextOptions.map((option) => (
              <option key={option} value={option}>
                {contextLabels[option]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Powiązania</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Warzywa</span>
            <select
              multiple
              className="min-h-32 rounded-lg border border-zinc-200 px-3 py-2"
              value={values.relatedVegetableIds}
              onChange={(event) =>
                updateValue(
                  "relatedVegetableIds",
                  Array.from(event.target.selectedOptions, (option) =>
                    option.value.trim(),
                  ).filter(Boolean),
                )
              }
              disabled={vegetablesLoading}
            >
              {vegetablesData?.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Gleby</span>
            <select
              multiple
              className="min-h-32 rounded-lg border border-zinc-200 px-3 py-2"
              value={values.relatedSoilIds}
              onChange={(event) =>
                updateValue(
                  "relatedSoilIds",
                  Array.from(event.target.selectedOptions, (option) =>
                    option.value.trim(),
                  ).filter(Boolean),
                )
              }
              disabled={soilsLoading}
            >
              {soilsData?.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nawozy</span>
            <select
              multiple
              className="min-h-32 rounded-lg border border-zinc-200 px-3 py-2"
              value={values.relatedFertilizerIds}
              onChange={(event) =>
                updateValue(
                  "relatedFertilizerIds",
                  Array.from(event.target.selectedOptions, (option) =>
                    option.value.trim(),
                  ).filter(Boolean),
                )
              }
              disabled={fertilizersLoading}
            >
              {fertilizersData?.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Choroby</span>
            <select
              multiple
              className="min-h-32 rounded-lg border border-zinc-200 px-3 py-2"
              value={values.relatedDiseaseIds}
              onChange={(event) =>
                updateValue(
                  "relatedDiseaseIds",
                  Array.from(event.target.selectedOptions, (option) =>
                    option.value.trim(),
                  ).filter(Boolean),
                )
              }
              disabled={diseasesLoading}
            >
              {diseasesData?.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Szkodniki</span>
            <select
              multiple
              className="min-h-32 rounded-lg border border-zinc-200 px-3 py-2"
              value={values.relatedPestIds}
              onChange={(event) =>
                updateValue(
                  "relatedPestIds",
                  Array.from(event.target.selectedOptions, (option) =>
                    option.value.trim(),
                  ).filter(Boolean),
                )
              }
              disabled={pestsLoading}
            >
              {pestsData?.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
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
    </form>
  );
};
