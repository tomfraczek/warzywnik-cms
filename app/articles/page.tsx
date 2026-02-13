"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  articleContextOptions,
  articleSeasonOptions,
  articleStatusOptions,
  type ArticleContext,
  type ArticleSeason,
  type ArticleStatus,
} from "@/app/api/api.types";
import { useGetArticles } from "@/app/api/queries/articles/useGetArticles";
import { useDeleteArticle } from "@/app/api/mutations/articles/useDeleteArticle";

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

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("pl-PL");
};

const noticeLabels: Record<string, string> = {
  created: "Artykuł został utworzony.",
  updated: "Zmiany zostały zapisane.",
  deleted: "Artykuł został usunięty.",
};

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(() => searchParams?.get("q") ?? "");
  const [status, setStatus] = useState<ArticleStatus | "">(
    () => (searchParams?.get("status") as ArticleStatus | null) ?? "",
  );
  const [month, setMonth] = useState<number | "">(() => {
    const value = searchParams?.get("month");
    return value ? Number(value) : "";
  });
  const [season, setSeason] = useState<ArticleSeason | "">(
    () => (searchParams?.get("season") as ArticleSeason | null) ?? "",
  );
  const [context, setContext] = useState<ArticleContext | "">(
    () => (searchParams?.get("context") as ArticleContext | null) ?? "",
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [notice, setNotice] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const params = useMemo(
    () => ({
      page,
      limit,
      q: q.trim() || undefined,
      status: status || undefined,
      month: month || undefined,
      season: season || undefined,
      context: context || undefined,
    }),
    [page, limit, q, status, month, season, context],
  );

  const { data, isLoading, error } = useGetArticles(params);
  const deleteMutation = useDeleteArticle();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Czy na pewno usunąć artykuł?");
    if (!confirmed) return;

    setNotice(null);
    try {
      await deleteMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ["articles"] });
      setNotice(noticeLabels.deleted);
    } catch {
      setNotice("Nie udało się usunąć artykułu.");
    }
  };

  const noticeParam = searchParams?.get("notice");
  const noticeFromQuery = noticeParam ? noticeLabels[noticeParam] : null;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Artykuły
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">
            Lista artykułów
          </h1>
          <Link
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            href="/articles/new"
          >
            Dodaj artykuł
          </Link>
        </div>
      </header>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-5">
        <input
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Szukaj po tytule lub slug"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as ArticleStatus | "")
          }
        >
          <option value="">Status: wszystkie</option>
          {articleStatusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={month}
          onChange={(event) =>
            setMonth(event.target.value ? Number(event.target.value) : "")
          }
        >
          <option value="">Miesiąc: wszystkie</option>
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value} - {option.label}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={season}
          onChange={(event) =>
            setSeason(event.target.value as ArticleSeason | "")
          }
        >
          <option value="">Sezon: wszystkie</option>
          {articleSeasonOptions.map((option) => (
            <option key={option} value={option}>
              {seasonLabels[option]}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={context}
          onChange={(event) =>
            setContext(event.target.value as ArticleContext | "")
          }
        >
          <option value="">Kontekst: wszystkie</option>
          {articleContextOptions.map((option) => (
            <option key={option} value={option}>
              {contextLabels[option]}
            </option>
          ))}
        </select>
      </div>

      {(noticeFromQuery || notice) && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {notice ?? noticeFromQuery}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
                  Brak artykułów.
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {item.title}
                </td>
                <td className="px-4 py-3 text-zinc-500">{item.slug}</td>
                <td className="px-4 py-3 text-zinc-500">{item.status}</td>
                <td className="px-4 py-3 text-zinc-500">{item.priority}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {formatDate(item.publishedAt)}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {formatDate(item.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-xs font-medium">
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/articles/${item.id}`}
                    >
                      Podgląd
                    </Link>
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/articles/${item.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
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
