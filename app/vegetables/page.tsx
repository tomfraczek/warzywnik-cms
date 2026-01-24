"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGetVegetables } from "@/app/api/queries/vegetables/useGetVegetables";
import { useDeleteVegetable } from "@/app/api/mutations/vegetables/useDeleteVegetable";
import { demandLevelOptions, sunExposureOptions } from "@/app/api/api.types";
import type { DemandLevel, SunExposure } from "@/app/api/api.types";
import { useQueryClient } from "@tanstack/react-query";

export default function VegetablesPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sunExposure, setSunExposure] = useState<"" | SunExposure>("");
  const [waterDemand, setWaterDemand] = useState<"" | DemandLevel>("");
  const [nutrientDemand, setNutrientDemand] = useState<"" | DemandLevel>("");
  const [notice, setNotice] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q.trim() || undefined,
      sunExposure: sunExposure || undefined,
      waterDemand: waterDemand || undefined,
      nutrientDemand: nutrientDemand || undefined,
    }),
    [page, limit, q, sunExposure, waterDemand, nutrientDemand],
  );

  const { data, isLoading, error } = useGetVegetables(params);
  const deleteMutation = useDeleteVegetable();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Czy na pewno usunąć warzywo?");
    if (!confirmed) return;

    setNotice(null);
    try {
      await deleteMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ["vegetables"] });
      setNotice("Warzywo zostało usunięte.");
    } catch {
      setNotice("Nie udało się usunąć warzywa.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warzywa
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">Lista warzyw</h1>
          <Link
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            href="/vegetables/new"
          >
            Dodaj warzywo
          </Link>
        </div>
        <p className="text-base text-zinc-600">
          Wyszukuj i zarządzaj warzywami w bazie danych.
        </p>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm md:col-span-2"
            placeholder="Szukaj po nazwie lub slug"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={sunExposure}
            onChange={(event) =>
              setSunExposure(event.target.value as "" | SunExposure)
            }
          >
            <option value="">Sun exposure</option>
            {sunExposureOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={waterDemand}
            onChange={(event) =>
              setWaterDemand(event.target.value as "" | DemandLevel)
            }
          >
            <option value="">Water demand</option>
            {demandLevelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={nutrientDemand}
            onChange={(event) =>
              setNutrientDemand(event.target.value as "" | DemandLevel)
            }
          >
            <option value="">Nutrient demand</option>
            {demandLevelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Latin name</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                  Ładowanie...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-4 py-6 text-red-500" colSpan={5}>
                  Nie udało się pobrać listy.
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                  Brak warzyw.
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-zinc-500">{item.slug}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {item.latinName || "-"}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {item.imageUrl ? (
                    <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-[10px]">
                      IMG
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-xs font-medium">
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/vegetables/${item.id}`}
                    >
                      View
                    </Link>
                    <Link
                      className="text-zinc-600 hover:text-zinc-900"
                      href={`/vegetables/${item.id}/edit`}
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
