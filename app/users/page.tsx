"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AxiosError } from "axios";
import { useGetAdminUsers } from "@/app/api/queries/users/useGetAdminUsers";
import { useUpdateAdminUser } from "@/app/api/mutations/users/useUpdateAdminUser";
import { useDeleteAdminUser } from "@/app/api/mutations/users/useDeleteAdminUser";
import {
  userPlanSourceOptions,
  type AdminUserListItem,
  type AdminUsersSort,
  type UserPlanSource,
} from "@/app/api/api.types";
import { userPlanSourceLabels } from "@/app/utils/labels";
import ConfirmDeleteDialog from "@/app/components/ConfirmDeleteDialog";

const LIMIT = 50;

type BooleanFilter = "" | "true" | "false";

const sortOptions: { value: string; label: string }[] = [
  { value: "createdAt:desc", label: "Najnowsi" },
  { value: "createdAt:asc", label: "Najstarsi" },
  { value: "lastLoginAt:desc", label: "Ostatnio aktywni" },
  { value: "email:asc", label: "E-mail A–Z" },
  { value: "displayName:asc", label: "Nazwa A–Z" },
];

const planBadgeClasses: Record<UserPlanSource, string> = {
  subscription: "bg-amber-100 text-amber-800",
  trial: "bg-sky-100 text-sky-800",
  free: "bg-zinc-100 text-zinc-700",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: unknown })?.message;
    if (typeof message === "string") return `${fallback} (${message})`;
  }
  return fallback;
}

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersPageContent />
    </Suspense>
  );
}

function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [plan, setPlan] = useState<UserPlanSource | "">("");
  const [isActive, setIsActive] = useState<BooleanFilter>("");
  const [isAdmin, setIsAdmin] = useState<BooleanFilter>("");
  const [sort, setSort] = useState(sortOptions[0].value);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [toDelete, setToDelete] = useState<AdminUserListItem | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      setNotice({ type: "success", text: "Użytkownik został usunięty." });
      router.replace("/users");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQ(value);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setDebouncedQ(value);
        setPage(1);
      }, 300);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const hasActiveFilters =
    Boolean(q) || Boolean(plan) || Boolean(isActive) || Boolean(isAdmin);

  const handleClearFilters = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setQ("");
    setDebouncedQ("");
    setPlan("");
    setIsActive("");
    setIsAdmin("");
    setPage(1);
  };

  const params = useMemo(() => {
    const [sortField, order] = sort.split(":") as [
      AdminUsersSort,
      "asc" | "desc",
    ];
    return {
      search: debouncedQ.trim() || undefined,
      plan: plan || undefined,
      isActive: isActive ? isActive === "true" : undefined,
      isAdmin: isAdmin ? isAdmin === "true" : undefined,
      sort: sortField,
      order,
      page,
      limit: LIMIT,
    };
  }, [debouncedQ, plan, isActive, isAdmin, sort, page]);

  const { data, isLoading, error } = useGetAdminUsers(params);
  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();

  const handleToggleActive = async (user: AdminUserListItem) => {
    setNotice(null);
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        payload: { isActive: !user.isActive },
      });
      setNotice({
        type: "success",
        text: user.isActive
          ? "Użytkownik został zablokowany."
          : "Użytkownik został odblokowany.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        text: errorMessage(err, "Nie udało się zmienić statusu użytkownika."),
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setNotice(null);
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      setNotice({ type: "success", text: "Użytkownik został usunięty." });
      setToDelete(null);
    } catch (err) {
      setNotice({
        type: "error",
        text: errorMessage(err, "Nie udało się usunąć użytkownika."),
      });
      setToDelete(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;
  const hasAnyFilters =
    Boolean(debouncedQ) || Boolean(plan) || Boolean(isActive) || Boolean(isAdmin);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Użytkownicy
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">
              Użytkownicy
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Konta użytkowników aplikacji: premium, blokady, uprawnienia
              administratora i usuwanie kont.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-6">
        <input
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm xl:col-span-2"
          placeholder="Szukaj po e-mailu, nazwie lub ID…"
          value={q}
          onChange={handleSearchChange}
        />
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value as UserPlanSource | "");
            setPage(1);
          }}
        >
          <option value="">Wszystkie plany</option>
          {userPlanSourceOptions.map((option) => (
            <option key={option} value={option}>
              {userPlanSourceLabels[option]}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value as BooleanFilter);
            setPage(1);
          }}
        >
          <option value="">Wszystkie statusy</option>
          <option value="true">Aktywni</option>
          <option value="false">Zablokowani</option>
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={isAdmin}
          onChange={(e) => {
            setIsAdmin(e.target.value as BooleanFilter);
            setPage(1);
          }}
        >
          <option value="">Wszystkie role</option>
          <option value="true">Administratorzy</option>
          <option value="false">Zwykli użytkownicy</option>
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 md:col-span-3 xl:col-span-6 xl:justify-self-end"
        >
          Wyczyść filtry
        </button>
      </div>

      {notice && (
        <div
          className={
            notice.type === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600"
              : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          }
        >
          {notice.text}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-215 text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Użytkownik</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ostatnie logowanie</th>
                <th className="px-4 py-3">Rejestracja</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-4 py-6 text-zinc-500" colSpan={6}>
                    Ładowanie...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td className="px-4 py-6 text-red-500" colSpan={6}>
                    Nie udało się pobrać listy użytkowników.
                  </td>
                </tr>
              )}
              {!isLoading && !error && data?.items.length === 0 && (
                <tr>
                  <td className="px-4 py-6" colSpan={6}>
                    {hasAnyFilters ? (
                      <div>
                        <p className="font-medium text-zinc-900">
                          Brak wyników
                        </p>
                        <p className="mt-1 text-zinc-500">
                          Nie znaleziono użytkowników pasujących do wybranych
                          filtrów.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-zinc-900">
                          Brak użytkowników
                        </p>
                        <p className="mt-1 text-zinc-500">
                          Nikt jeszcze nie założył konta.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
              {data?.items.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer border-t border-zinc-100 hover:bg-zinc-50"
                  onClick={() => router.push(`/users/${item.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900">
                        {item.displayName || "—"}
                      </span>
                      {item.isAdmin && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-500">{item.email || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${planBadgeClasses[item.planSource]}`}
                    >
                      {userPlanSourceLabels[item.planSource]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.isActive ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                        Aktywny
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                        Zablokowany
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                    {formatDate(item.lastLoginAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex justify-end gap-3 text-xs font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        className="text-zinc-600 hover:text-zinc-900"
                        href={`/users/${item.id}`}
                      >
                        Szczegóły
                      </Link>
                      <button
                        type="button"
                        className="text-amber-600 hover:text-amber-800 disabled:opacity-40"
                        disabled={updateMutation.isPending}
                        onClick={() => handleToggleActive(item)}
                      >
                        {item.isActive ? "Zablokuj" : "Odblokuj"}
                      </button>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setToDelete(item)}
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          Strona {data?.page ?? page} z {totalPages}
          {data ? ` (${data.total} łącznie)` : ""}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={(data?.page ?? page) <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Wstecz
          </button>
          <button
            className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={data ? data.page >= totalPages : false}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Dalej
          </button>
        </div>
      </div>

      {toDelete && (
        <ConfirmDeleteDialog
          title="Usuń użytkownika?"
          description={`Ta operacja jest nieodwracalna. Konto ${toDelete.email || toDelete.displayName || toDelete.id} zostanie usunięte razem ze wszystkimi danymi (grządki, nasadzenia, notatki) oraz kontem w Clerku.`}
          isPending={deleteMutation.isPending}
          onCancel={() => setToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </section>
  );
}
