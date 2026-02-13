"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AxiosError } from "axios";
import { useGetArticle } from "@/app/api/queries/articles/useGetArticle";

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("pl-PL");
};

export default function ArticlePreviewPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetArticle(params?.id);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (error instanceof AxiosError && error.response?.status === 404) {
    return <p className="text-sm text-red-500">Nie znaleziono artykułu.</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  console.log("data", data);

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
        <div className="text-sm text-zinc-500">
          <span>Status: {data.status}</span>
          <span className="mx-2">•</span>
          <span>Opublikowano: {formatDateTime(data.publishedAt)}</span>
          <span className="mx-2">•</span>
          <span>Aktualizacja: {formatDateTime(data.updatedAt)}</span>
        </div>
      </header>

      {data.coverImageUrl && (
        <div className="flex max-h-80 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          <Image
            src={data.coverImageUrl}
            alt={data.title}
            className="h-full w-full object-contain"
            width={960}
            height={480}
            unoptimized
          />
        </div>
      )}

      <article
        className="article-content max-w-none rounded-xl border border-zinc-200 bg-white px-6 py-6"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </section>
  );
}
