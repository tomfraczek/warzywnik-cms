"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useGetVegetables } from "@/app/api/queries/vegetables/useGetVegetables";
import { useGetArticles } from "@/app/api/queries/articles/useGetArticles";
import { useGetPests } from "@/app/api/queries/pests/useGetPests";
import { useGetDiseases } from "@/app/api/queries/diseases/useGetDiseases";
import { useGetSoils } from "@/app/api/queries/soils/useGetSoils";
import { useGetFertilizers } from "@/app/api/queries/fertilizers/useGetFertilizers";
import { useGetActionTemplates } from "@/app/api/queries/action-templates/useGetActionTemplates";
import { useGetWarningRules } from "@/app/api/queries/warning-rules/useGetWarningRules";
import { useGetAnalyticsDashboard } from "@/app/api/queries/analytics/useGetAnalyticsDashboard";

type StatCardProps = {
  label: string;
  value: number | undefined;
  href: string;
  isLoading: boolean;
};

function StatCard({ label, value, href, isLoading }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
    >
      <p className="text-sm text-zinc-500">{label}</p>
      {isLoading ? (
        <div className="mt-2 h-8 w-12 animate-pulse rounded-md bg-zinc-100" />
      ) : (
        <p className="mt-2 text-3xl font-semibold text-zinc-900 group-hover:text-green-700 transition-colors">
          {value ?? "—"}
        </p>
      )}
    </Link>
  );
}

type AnalyticsMetricCardProps = {
  label: string;
  value: number | undefined;
  isLoading: boolean;
  unit?: string;
};

function AnalyticsMetricCard({
  label,
  value,
  isLoading,
  unit,
}: AnalyticsMetricCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      {isLoading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-zinc-100" />
      ) : (
        <p className="mt-2 text-2xl font-semibold text-zinc-900">
          {value?.toLocaleString("pl-PL") ?? "—"}
          {unit ? (
            <span className="ml-1 text-sm font-normal text-zinc-400">
              {unit}
            </span>
          ) : null}
        </p>
      )}
    </div>
  );
}

type TopListProps<T> = {
  items: T[] | undefined;
  isLoading: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
};

function TopList<T>({ items, isLoading, renderItem }: TopListProps<T>) {
  if (isLoading) {
    return (
      <ul className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton only
          <li key={i} className="h-8 animate-pulse rounded-md bg-zinc-100" />
        ))}
      </ul>
    );
  }
  if (!items?.length) {
    return <p className="text-sm text-zinc-400">Brak danych</p>;
  }
  return (
    <ol className="space-y-1">{items.map((item, i) => renderItem(item, i))}</ol>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: vegetables, isLoading: loadingVegetables } = useGetVegetables({
    limit: 1,
  });
  const { data: articles, isLoading: loadingArticles } = useGetArticles({
    limit: 1,
  });
  const { data: pests, isLoading: loadingPests } = useGetPests({ limit: 1 });
  const { data: diseases, isLoading: loadingDiseases } = useGetDiseases({
    limit: 1,
  });
  const { data: soils, isLoading: loadingSoils } = useGetSoils({ limit: 1 });
  const { data: fertilizers, isLoading: loadingFertilizers } =
    useGetFertilizers({ limit: 1 });
  const { data: actionTemplates, isLoading: loadingActionTemplates } =
    useGetActionTemplates({ limit: 1 });
  const { data: warningRules, isLoading: loadingWarningRules } =
    useGetWarningRules({ limit: 1 });

  const { data: analytics, isLoading: loadingAnalytics } =
    useGetAnalyticsDashboard(10);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials =
    user?.firstName?.[0] ||
    user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
    "?";

  return (
    <section className="space-y-8">
      <div className="flex items-start justify-between">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Przegląd warzywnika
          </h1>
          <p className="text-base text-zinc-600">
            Aktualny stan treści w CMS – kliknij kafelek, aby przejść do sekcji.
          </p>
        </header>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-white shadow-sm"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Menu użytkownika"
          >
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName ?? "Użytkownik"}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-zinc-600">
                {initials}
              </span>
            )}
          </button>

          {isOpen ? (
            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
              <button
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
              >
                Wyloguj
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Zawartość CMS
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Warzywa"
            value={vegetables?.total}
            href="/vegetables"
            isLoading={loadingVegetables}
          />
          <StatCard
            label="Artykuły"
            value={articles?.total}
            href="/articles"
            isLoading={loadingArticles}
          />
          <StatCard
            label="Szkodniki"
            value={pests?.total}
            href="/pests"
            isLoading={loadingPests}
          />
          <StatCard
            label="Choroby"
            value={diseases?.total}
            href="/diseases"
            isLoading={loadingDiseases}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Zasoby i reguły
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Gleby"
            value={soils?.total}
            href="/soils"
            isLoading={loadingSoils}
          />
          <StatCard
            label="Nawozy"
            value={fertilizers?.total}
            href="/fertilizers"
            isLoading={loadingFertilizers}
          />
          <StatCard
            label="Szablony akcji"
            value={actionTemplates?.total}
            href="/action-templates"
            isLoading={loadingActionTemplates}
          />
          <StatCard
            label="Reguły ostrzeżeń"
            value={warningRules?.total}
            href="/warning-rules"
            isLoading={loadingWarningRules}
          />
        </div>
      </div>

      {/* ── Analytics ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Statystyki ogólne (wszystkie czasy)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnalyticsMetricCard
            label="Wyświetlenia artykułów"
            value={analytics?.totals.articleViewsTotal}
            isLoading={loadingAnalytics}
          />
          <AnalyticsMetricCard
            label="Czas czytania artykułów"
            value={
              analytics?.totals.articleEngagedSecondsTotal != null
                ? Math.round(analytics.totals.articleEngagedSecondsTotal / 60)
                : undefined
            }
            unit="min"
            isLoading={loadingAnalytics}
          />
          <AnalyticsMetricCard
            label="Przewinięcia 50% artykułów"
            value={analytics?.totals.articleScroll50Total}
            isLoading={loadingAnalytics}
          />
          <AnalyticsMetricCard
            label="Przewinięcia 90% artykułów"
            value={analytics?.totals.articleScroll90Total}
            isLoading={loadingAnalytics}
          />
          <AnalyticsMetricCard
            label="Polubienia artykułów"
            value={analytics?.totals.articleFavoritesTotal}
            isLoading={loadingAnalytics}
          />
          <AnalyticsMetricCard
            label="Dodania warzyw do ogrodu"
            value={analytics?.totals.vegetableAddsTotal}
            isLoading={loadingAnalytics}
          />
          <AnalyticsMetricCard
            label="Polubienia warzyw"
            value={analytics?.totals.vegetableFavoritesTotal}
            isLoading={loadingAnalytics}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Aktywność — ostatnie 30 dni
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnalyticsMetricCard
            label="Wyświetlenia artykułów"
            value={analytics?.last30Days.articleViews}
            isLoading={loadingAnalytics}
          />
          <AnalyticsMetricCard
            label="Dodania warzyw do ogrodu"
            value={analytics?.last30Days.vegetableAdds}
            isLoading={loadingAnalytics}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Top warzywa (dodania)
          </h2>
          <TopList
            items={analytics?.top.vegetablesByAdds}
            isLoading={loadingAnalytics}
            renderItem={(veg, i) => (
              <li
                key={veg.id}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-5 shrink-0 text-center text-xs font-semibold text-zinc-400">
                    {i + 1}.
                  </span>
                  <Link
                    href={`/vegetables/${veg.id}`}
                    className="truncate font-medium text-zinc-800 hover:text-green-700 hover:underline"
                  >
                    {veg.name}
                  </Link>
                </span>
                <span className="shrink-0 text-xs font-semibold text-zinc-500">
                  {veg.adds.toLocaleString("pl-PL")} dodań
                </span>
              </li>
            )}
          />
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Top artykuły (wyświetlenia)
          </h2>
          <TopList
            items={analytics?.top.articlesByViews}
            isLoading={loadingAnalytics}
            renderItem={(article, i) => (
              <li
                key={article.id}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-5 shrink-0 text-center text-xs font-semibold text-zinc-400">
                    {i + 1}.
                  </span>
                  <Link
                    href={`/articles/${article.id}`}
                    className="truncate font-medium text-zinc-800 hover:text-green-700 hover:underline"
                  >
                    {article.title}
                  </Link>
                </span>
                <span className="shrink-0 text-xs font-semibold text-zinc-500">
                  {article.views.toLocaleString("pl-PL")} wyśw.
                </span>
              </li>
            )}
          />
        </div>
      </div>

      {analytics?.generatedAt ? (
        <p className="text-right text-xs text-zinc-400">
          Dane wygenerowane:{" "}
          {new Date(analytics.generatedAt).toLocaleString("pl-PL")}
        </p>
      ) : null}
    </section>
  );
}
