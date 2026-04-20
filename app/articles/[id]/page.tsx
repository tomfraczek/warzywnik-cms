"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AxiosError } from "axios";
import { useGetArticle } from "@/app/api/queries/articles/useGetArticle";
import { useGetVegetables } from "@/app/api/queries/vegetables/useGetVegetables";
import { useGetDiseases } from "@/app/api/queries/diseases/useGetDiseases";
import { useGetPests } from "@/app/api/queries/pests/useGetPests";
import { useGetFertilizers } from "@/app/api/queries/fertilizers/useGetFertilizers";
import { useGetSoils } from "@/app/api/queries/soils/useGetSoils";
import type {
  ArticleSeason,
  ArticleContext,
  ArticleStatus,
} from "@/app/api/api.types";

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("pl-PL");
};

const monthNames: Record<number, string> = {
  1: "Styczeń",
  2: "Luty",
  3: "Marzec",
  4: "Kwiecień",
  5: "Maj",
  6: "Czerwiec",
  7: "Lipiec",
  8: "Sierpień",
  9: "Wrzesień",
  10: "Październik",
  11: "Listopad",
  12: "Grudzień",
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

const normalizeArticleHtmlSpacing = (html: string) =>
  html.replace(/(?:&nbsp;|&#160;|\u00a0)+/gi, " ");

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <div className="text-sm text-zinc-800">{children}</div>
    </div>
  );
}

function Pills({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-zinc-400">—</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ArticlePreviewPage() {
  const params = useParams<{ id: string }>();
  const [cacheBuster] = useState(() => Date.now());
  const { data, isLoading, error } = useGetArticle(params?.id);
  const { data: vegetablesData } = useGetVegetables({});
  const { data: diseasesData } = useGetDiseases({});
  const { data: pestsData } = useGetPests({});
  const { data: fertilizersData } = useGetFertilizers({});
  const { data: soilsData } = useGetSoils({});

  console.log("Article data:", data);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (error instanceof AxiosError && error.response?.status === 404) {
    return <p className="text-sm text-red-500">Nie znaleziono artykułu.</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  const resolveNames = (
    ids: string[] | undefined,
    items?: { id: string; name: string }[],
  ) => {
    if (!ids) return [];
    if (!items) return ids;
    return ids.map((id) => items.find((i) => i.id === id)?.name ?? id);
  };

  const vegetableNames = resolveNames(
    data.relatedVegetableIds,
    vegetablesData?.items,
  );
  const diseaseNames = resolveNames(
    data.relatedDiseaseIds,
    diseasesData?.items,
  );
  const pestNames = resolveNames(data.relatedPestIds, pestsData?.items);
  const fertilizerNames = resolveNames(
    data.relatedFertilizerIds,
    fertilizersData?.items,
  );
  const soilNames = resolveNames(data.relatedSoilIds, soilsData?.items);
  const normalizedContent = normalizeArticleHtmlSpacing(data.content ?? "");

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Podgląd artykułu
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">{data.title}</h1>
          <Link
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900"
            href={`/articles/${data.id}/edit`}
          >
            Edytuj artykuł
          </Link>
        </div>
      </header>

      {data.coverImageUrl && (
        <div className="flex max-h-80 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          <Image
            src={`${data.coverImageUrl}?t=${cacheBuster}`}
            alt={data.title}
            className="h-full w-full object-contain"
            width={960}
            height={480}
            unoptimized
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-2">
        <Field label="Status">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${data.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
          >
            {statusLabels[data.status]}
          </span>
        </Field>

        <Field label="Slug">
          <span className="font-mono text-zinc-600">
            {data.slug || <span className="text-zinc-400">—</span>}
          </span>
        </Field>

        <Field label="Priorytet">{data.priority}</Field>

        <Field label="Data publikacji">
          {formatDateTime(data.publishedAt)}
        </Field>

        <Field label="Ostatnia aktualizacja">
          {formatDateTime(data.updatedAt)}
        </Field>

        <Field label="Data utworzenia">{formatDateTime(data.createdAt)}</Field>

        <div className="sm:col-span-2">
          <Field label="Zajawka">
            {data.excerpt || <span className="text-zinc-400">—</span>}
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Miesiące">
            <Pills items={data.months.map((m) => monthNames[m] ?? String(m))} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Pory roku">
            <Pills items={data.seasons.map((s) => seasonLabels[s])} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Konteksty">
            <Pills items={data.contexts.map((c) => contextLabels[c])} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Powiązane warzywa">
            <Pills items={vegetableNames} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Powiązane gleby">
            <Pills items={soilNames} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Powiązane nawozy">
            <Pills items={fertilizerNames} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Powiązane choroby">
            <Pills items={diseaseNames} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Powiązane szkodniki">
            <Pills items={pestNames} />
          </Field>
        </div>
      </div>

      <article
        className="article-content rounded-xl border border-zinc-200 bg-white px-6 py-6"
        dangerouslySetInnerHTML={{ __html: normalizedContent }}
      />
    </section>
  );
}
