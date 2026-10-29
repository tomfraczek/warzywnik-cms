"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { useGetAdminUser } from "@/app/api/queries/users/useGetAdminUser";
import { useUpdateAdminUser } from "@/app/api/mutations/users/useUpdateAdminUser";
import { useDeleteAdminUser } from "@/app/api/mutations/users/useDeleteAdminUser";
import type {
  AdminUserDetails,
  UpdateAdminUserPayload,
  UserLanguage,
  UserSubscriptionPlan,
  UserThemeMode,
} from "@/app/api/api.types";
import { userPlanSourceLabels } from "@/app/utils/labels";
import ConfirmDeleteDialog from "@/app/components/ConfirmDeleteDialog";

const DAY_MS = 24 * 60 * 60 * 1000;
// Far-future expiry used for a "lifetime" premium grant.
const LIFETIME_EXPIRES_AT = "2099-12-31T23:59:59.000Z";

type Notice = { type: "success" | "error"; text: string };

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function addDays(fromIso: string | null, days: number): string {
  const now = Date.now();
  const base = fromIso ? Math.max(new Date(fromIso).getTime(), now) : now;
  return new Date(base + days * DAY_MS).toISOString();
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: unknown })?.message;
    if (typeof message === "string") return `${fallback} (${message})`;
  }
  return fallback;
}

const inputClass = "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm";
const secondaryButtonClass =
  "rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40";
const primaryButtonClass =
  "rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40";

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetAdminUser(params?.id);
  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const update = async (
    payload: UpdateAdminUserPayload,
    successText: string,
  ) => {
    if (!data) return;
    setNotice(null);
    try {
      await updateMutation.mutateAsync({ id: data.id, payload });
      setNotice({ type: "success", text: successText });
    } catch (err) {
      setNotice({
        type: "error",
        text: errorMessage(err, "Nie udało się zapisać zmian."),
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!data) return;
    setNotice(null);
    try {
      await deleteMutation.mutateAsync(data.id);
      router.push("/users?deleted=true");
    } catch (err) {
      setShowDeleteDialog(false);
      setNotice({
        type: "error",
        text: errorMessage(err, "Nie udało się usunąć użytkownika."),
      });
    }
  };

  const notFound =
    error instanceof AxiosError && error.response?.status === 404;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (notFound) {
    return (
      <p className="text-sm text-red-500">Nie znaleziono użytkownika.</p>
    );
  }

  if (!data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  const isPending = updateMutation.isPending;

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/users"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Wróć do listy
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Użytkownicy
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-zinc-900">
                {data.displayName || data.email || "Bez nazwy"}
              </h1>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                {userPlanSourceLabels[data.planSource]}
              </span>
              {data.isAdmin && (
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                  Admin
                </span>
              )}
              {!data.isActive && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  Zablokowany
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">{data.email || "—"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={isPending}
              onClick={() =>
                update(
                  { isAdmin: !data.isAdmin },
                  data.isAdmin
                    ? "Odebrano uprawnienia administratora."
                    : "Nadano uprawnienia administratora.",
                )
              }
            >
              {data.isAdmin ? "Odbierz admina" : "Nadaj admina"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-40"
              disabled={isPending}
              onClick={() =>
                update(
                  { isActive: !data.isActive },
                  data.isActive
                    ? "Użytkownik został zablokowany."
                    : "Użytkownik został odblokowany.",
                )
              }
            >
              {data.isActive ? "Zablokuj" : "Odblokuj"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={() => setShowDeleteDialog(true)}
            >
              Usuń konto
            </button>
          </div>
        </div>
      </header>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <AccountSection user={data} />
        <StatsSection user={data} />
      </div>

      <PremiumSection
        key={`premium-${data.updatedAt}`}
        user={data}
        isPending={isPending}
        onUpdate={update}
      />

      <SettingsSection
        key={`settings-${data.updatedAt}`}
        user={data}
        isPending={isPending}
        onUpdate={update}
      />

      {showDeleteDialog && (
        <ConfirmDeleteDialog
          title="Usuń użytkownika?"
          description="Ta operacja jest nieodwracalna. Konto zostanie usunięte razem ze wszystkimi danymi (grządki, nasadzenia, notatki) oraz kontem w Clerku."
          isPending={deleteMutation.isPending}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </section>
  );
}

type SectionProps = { user: AdminUserDetails };

type EditableSectionProps = SectionProps & {
  isPending: boolean;
  onUpdate: (payload: UpdateAdminUserPayload, successText: string) => void;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium text-zinc-900">{label}:</span>{" "}
      <span className="break-all">{value}</span>
    </p>
  );
}

function AccountSection({ user }: SectionProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Konto</h2>
      <div className="mt-4 space-y-2 text-sm text-zinc-600">
        <InfoRow label="ID" value={user.id} />
        <InfoRow label="Clerk ID" value={user.clerkUserId} />
        <InfoRow label="E-mail" value={user.email || "—"} />
        <InfoRow label="Rejestracja" value={formatDate(user.createdAt)} />
        <InfoRow
          label="Ostatnie logowanie"
          value={formatDate(user.lastLoginAt)}
        />
        <InfoRow label="Ostatnia zmiana" value={formatDate(user.updatedAt)} />
        <InfoRow label="Lokalizacja" value={user.locationLabel || "—"} />
      </div>
    </section>
  );
}

function StatsSection({ user }: SectionProps) {
  const items = [
    { label: "Przestrzenie uprawy", value: user.stats.growingSpaces },
    { label: "Grządki", value: user.stats.beds },
    { label: "Nasadzenia", value: user.stats.plantings },
    { label: "Notatki", value: user.stats.notes },
    { label: "Urządzenia", value: user.stats.devices },
  ];

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Aktywność</h2>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg bg-zinc-50 p-3">
            <dt className="text-xs text-zinc-500">{item.label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function PremiumSection({ user, isPending, onUpdate }: EditableSectionProps) {
  const [plan, setPlan] = useState<UserSubscriptionPlan>(user.subscriptionPlan);
  const [expiresAt, setExpiresAt] = useState(
    toLocalInput(user.subscriptionExpiresAt),
  );
  const [trialStartedAt, setTrialStartedAt] = useState(
    toLocalInput(user.trialStartedAt),
  );
  const [trialEndsAt, setTrialEndsAt] = useState(
    toLocalInput(user.trialEndsAt),
  );

  const activeSubscriptionExpiresAt =
    user.planSource === "subscription" ? user.subscriptionExpiresAt : null;

  const grantPremium = (days: number) =>
    onUpdate(
      {
        subscriptionPlan: "premium",
        subscriptionExpiresAt: addDays(activeSubscriptionExpiresAt, days),
      },
      `Przedłużono premium o ${days} dni.`,
    );

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Premium</h2>
      <div className="mt-4 space-y-2 text-sm text-zinc-600">
        <InfoRow
          label="Aktualny dostęp"
          value={userPlanSourceLabels[user.planSource]}
        />
        <InfoRow
          label="Subskrypcja wygasa"
          value={formatDate(user.subscriptionExpiresAt)}
        />
        <InfoRow
          label="Trial"
          value={`${formatDate(user.trialStartedAt)} → ${formatDate(user.trialEndsAt)}`}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={isPending}
          onClick={() => grantPremium(30)}
        >
          +30 dni premium
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={isPending}
          onClick={() => grantPremium(365)}
        >
          +1 rok premium
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={isPending}
          onClick={() =>
            onUpdate(
              {
                subscriptionPlan: "premium",
                subscriptionExpiresAt: LIFETIME_EXPIRES_AT,
              },
              "Nadano dożywotnie premium.",
            )
          }
        >
          Premium dożywotnio
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={isPending}
          onClick={() =>
            onUpdate(
              { subscriptionPlan: "free", subscriptionExpiresAt: null },
              "Odebrano subskrypcję premium.",
            )
          }
        >
          Odbierz premium
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={isPending}
          onClick={() =>
            onUpdate(
              {
                trialStartedAt: user.trialStartedAt ?? new Date().toISOString(),
                trialEndsAt: addDays(user.trialEndsAt, 7),
              },
              "Przedłużono trial o 7 dni.",
            )
          }
        >
          +7 dni trialu
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={isPending}
          onClick={() =>
            onUpdate(
              { trialEndsAt: new Date().toISOString() },
              "Zakończono trial.",
            )
          }
        >
          Zakończ trial
        </button>
      </div>

      <form
        className="mt-6 grid gap-4 border-t border-zinc-100 pt-6 md:grid-cols-2 xl:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          onUpdate(
            {
              subscriptionPlan: plan,
              subscriptionExpiresAt: fromLocalInput(expiresAt),
              trialStartedAt: fromLocalInput(trialStartedAt),
              trialEndsAt: fromLocalInput(trialEndsAt),
            },
            "Zapisano ustawienia premium.",
          );
        }}
      >
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Plan subskrypcji</span>
          <select
            className={inputClass}
            value={plan}
            onChange={(e) => setPlan(e.target.value as UserSubscriptionPlan)}
          >
            <option value="free">Darmowy</option>
            <option value="premium">Premium</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Subskrypcja do</span>
          <input
            type="datetime-local"
            className={inputClass}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Początek trialu</span>
          <input
            type="datetime-local"
            className={inputClass}
            value={trialStartedAt}
            onChange={(e) => setTrialStartedAt(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Koniec trialu</span>
          <input
            type="datetime-local"
            className={inputClass}
            value={trialEndsAt}
            onChange={(e) => setTrialEndsAt(e.target.value)}
          />
        </label>
        <p className="text-xs text-zinc-500 md:col-span-2 xl:col-span-3">
          Premium jest aktywne, gdy plan to „Premium” i data wygaśnięcia jest w
          przyszłości, albo gdy trwa trial. Zakup lub odnowienie w sklepie
          (RevenueCat) może nadpisać ręcznie ustawioną subskrypcję.
        </p>
        <div className="flex items-end justify-end">
          <button type="submit" className={primaryButtonClass} disabled={isPending}>
            Zapisz
          </button>
        </div>
      </form>
    </section>
  );
}

function SettingsSection({ user, isPending, onUpdate }: EditableSectionProps) {
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user.notificationsEnabled,
  );
  const [notificationHour, setNotificationHour] = useState(
    user.notificationHour,
  );
  const [automaticTasksEnabled, setAutomaticTasksEnabled] = useState(
    user.automaticTasksEnabled,
  );
  const [tutorialsEnabled, setTutorialsEnabled] = useState(
    user.tutorialsEnabled,
  );
  const [themeMode, setThemeMode] = useState<UserThemeMode>(user.themeMode);
  const [language, setLanguage] = useState<UserLanguage>(user.language);
  const [locale, setLocale] = useState(user.locale);
  const [timezone, setTimezone] = useState(user.timezone);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Profil i ustawienia</h2>
      <form
        className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          onUpdate(
            {
              displayName: displayName.trim() || null,
              notificationsEnabled,
              notificationHour,
              automaticTasksEnabled,
              tutorialsEnabled,
              themeMode,
              language,
              locale: locale.trim(),
              timezone: timezone.trim(),
            },
            "Zapisano ustawienia użytkownika.",
          );
        }}
      >
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Nazwa wyświetlana</span>
          <input
            className={inputClass}
            value={displayName}
            maxLength={50}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Motyw</span>
          <select
            className={inputClass}
            value={themeMode}
            onChange={(e) => setThemeMode(e.target.value as UserThemeMode)}
          >
            <option value="system">Systemowy</option>
            <option value="light">Jasny</option>
            <option value="dark">Ciemny</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Język</span>
          <select
            className={inputClass}
            value={language}
            onChange={(e) => setLanguage(e.target.value as UserLanguage)}
          >
            <option value="system">Systemowy</option>
            <option value="pl">Polski</option>
            <option value="en">Angielski</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Locale</span>
          <input
            className={inputClass}
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Strefa czasowa</span>
          <input
            className={inputClass}
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">
            Godzina powiadomień
          </span>
          <select
            className={inputClass}
            value={notificationHour}
            onChange={(e) => setNotificationHour(Number(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <option key={hour} value={hour}>
                {String(hour).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2 text-sm text-zinc-700 md:col-span-2 xl:col-span-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
            Powiadomienia włączone
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={automaticTasksEnabled}
              onChange={(e) => setAutomaticTasksEnabled(e.target.checked)}
            />
            Automatyczne zadania
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tutorialsEnabled}
              onChange={(e) => setTutorialsEnabled(e.target.checked)}
            />
            Samouczki
          </label>
        </div>
        <div className="flex justify-end md:col-span-2 xl:col-span-3">
          <button type="submit" className={primaryButtonClass} disabled={isPending}>
            Zapisz
          </button>
        </div>
      </form>
    </section>
  );
}
