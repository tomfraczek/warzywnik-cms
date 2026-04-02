"use client";

import { useMemo, useState } from "react";
import { useGetWarningRuleCodes } from "@/app/api/queries/warning-rules/useGetWarningRuleCodes";
import type { CreateWarningRulePayload } from "@/app/warning-rules/api/api.types";
import {
  warningCodeOptions,
  warningRuleDayPartOptions,
  warningRuleHorizonOptions,
  warningSeverityOptions,
} from "@/app/warning-rules/api/api.types";

export type WarningRuleFormValues = {
  slug: string;
  code: CreateWarningRulePayload["code"] | "";
  category: string;
  horizon: NonNullable<CreateWarningRulePayload["horizon"]> | "";
  dayPart: NonNullable<CreateWarningRulePayload["dayPart"]> | "";
  generatesTask: boolean;
  enabled: boolean;
  severity: CreateWarningRulePayload["severity"] | "";
  title: string;
  messageTemplate: string;
  hintTemplate: string;
  blocking: boolean;
  cooldownDays: string;
};

const defaultValues: WarningRuleFormValues = {
  slug: "",
  code: "",
  category: "SEED_ONLY",
  horizon: "RADAR",
  dayPart: "ANY",
  generatesTask: false,
  enabled: true,
  severity: "",
  title: "",
  messageTemplate: "",
  hintTemplate: "",
  blocking: false,
  cooldownDays: "",
};

const severityLabels = {
  INFO: "Informacja",
  WARNING: "Ostrzeżenie",
  CRITICAL: "Krytyczny",
} as const;

const codeLabels: Record<string, string> = {
  SOIL_NOT_RECOMMENDED: "Gleba niezalecana",
  PH_OUT_OF_RANGE: "pH poza zakresem",
  DEPTH_TOO_SMALL: "Zbyt mała głębokość",
  NPK_TOO_LOW: "Za niski poziom NPK",
  ROTATION_RISK: "Ryzyko płodozmianu",
  WATER_RETENTION_MISMATCH: "Niedopasowana retencja wody",
  DRAINAGE_MISMATCH: "Niedopasowany drenaż",
  FAMILY_REPETITION: "Powtórzenie tej samej rodziny botanicznej",
  HARVEST_WINDOW_MISSED: "Przekroczone okno zbioru",
  SUBOPTIMAL_SOWING_TIME: "Niekorzystny termin siewu",
  EXPERIMENTAL_SETUP: "Konfiguracja eksperymentalna",
};

const horizonLabels: Record<string, string> = {
  RADAR: "Radar",
  OPERATIONAL: "Operacyjne",
};

const dayPartLabels: Record<string, string> = {
  ANY: "Dowolna pora",
  DAY: "Dzień",
  NIGHT: "Noc",
};

const placeholderTokens = [
  "{vegetableName}",
  "{bedName}",
  "{measuredPh}",
  "{recommendedPhMin}",
  "{recommendedPhMax}",
  "{requiredDepthCm}",
  "{bedDepthCm}",
  "{nutrient}",
  "{needLevel}",
  "{measuredLevel}",
  "{deficit}",
  "{familyName}",
  "{harvestEndDate}",
  "{plannedStartDate}",
  "{sowingStartMonth}",
  "{sowingEndMonth}",
  "{direction}",
  "{directionText}",
  "{phThreshold}",
  "{phDelta}",
];

const toNumberOrNull = (value: string) => {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export type WarningRuleFormProps = {
  formId?: string;
  initialValues?: Partial<WarningRuleFormValues>;
  onSubmit: (payload: CreateWarningRulePayload) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  isCodeLocked?: boolean;
};

export const WarningRuleForm = ({
  formId,
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
  isCodeLocked = false,
}: WarningRuleFormProps) => {
  const { data: backendCodes } = useGetWarningRuleCodes();

  const [values, setValues] = useState<WarningRuleFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [clientError, setClientError] = useState<string | null>(null);

  const availableCodeOptions = useMemo(() => {
    const options = [
      ...(backendCodes ?? []),
      ...warningCodeOptions,
      ...(values.code ? [values.code] : []),
    ];
    return [...new Set(options)];
  }, [backendCodes, values.code]);

  const updateValue = <K extends keyof WarningRuleFormValues>(
    key: K,
    value: WarningRuleFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setClientError(null);

    if (!values.code) {
      setClientError("Kod reguły jest wymagany.");
      return;
    }

    if (!values.severity) {
      setClientError("Wybierz poziom ważności.");
      return;
    }

    if (!values.category.trim()) {
      setClientError("Kategoria jest wymagana.");
      return;
    }

    if (!values.horizon) {
      setClientError("Wybierz horyzont.");
      return;
    }

    if (!values.dayPart) {
      setClientError("Wybierz porę dnia.");
      return;
    }

    if (values.title.trim().length < 1 || values.title.trim().length > 120) {
      setClientError("Tytuł musi mieć 1-120 znaków.");
      return;
    }

    if (values.messageTemplate.trim().length < 1) {
      setClientError("Treść komunikatu jest wymagana.");
      return;
    }

    const cooldownDays = toNumberOrNull(values.cooldownDays);
    if (cooldownDays !== null && cooldownDays < 0) {
      setClientError("Cooldown musi być >= 0.");
      return;
    }

    const payload: CreateWarningRulePayload = {
      slug: values.slug.trim() || null,
      code: values.code,
      enabled: values.enabled,
      severity: values.severity,
      category: values.category.trim(),
      horizon: values.horizon,
      dayPart: values.dayPart,
      generatesTask: values.generatesTask,
      title: values.title.trim(),
      messageTemplate: values.messageTemplate.trim(),
      hintTemplate: values.hintTemplate.trim() || null,
      blocking: values.blocking,
      cooldownDays,
    };

    onSubmit(payload);
  };

  return (
    <form id={formId} className="space-y-6" onSubmit={handleSubmit}>
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Slug</span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.slug}
              onChange={(event) => updateValue("slug", event.target.value)}
              placeholder="np. ph-out-of-range"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Kod</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.code}
              onChange={(event) =>
                updateValue(
                  "code",
                  event.target.value as WarningRuleFormValues["code"],
                )
              }
              required
              disabled={isCodeLocked}
            >
              <option value="">Wybierz</option>
              {availableCodeOptions.map((option) => (
                <option key={option} value={option}>
                  {codeLabels[option] ?? option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Ważność</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.severity}
              onChange={(event) =>
                updateValue(
                  "severity",
                  event.target.value as WarningRuleFormValues["severity"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {warningSeverityOptions.map((option) => (
                <option key={option} value={option}>
                  {severityLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Kategoria</span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.category}
              onChange={(event) => updateValue("category", event.target.value)}
              placeholder="np. SEED_ONLY"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Horyzont</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.horizon}
              onChange={(event) =>
                updateValue(
                  "horizon",
                  event.target.value as WarningRuleFormValues["horizon"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {warningRuleHorizonOptions.map((option) => (
                <option key={option} value={option}>
                  {horizonLabels[option] ?? option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Pora dnia</span>
            <select
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.dayPart}
              onChange={(event) =>
                updateValue(
                  "dayPart",
                  event.target.value as WarningRuleFormValues["dayPart"],
                )
              }
              required
            >
              <option value="">Wybierz</option>
              {warningRuleDayPartOptions.map((option) => (
                <option key={option} value={option}>
                  {dayPartLabels[option] ?? option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Tytuł</span>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2"
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
              required
            />
          </label>

          <div className="flex flex-col gap-3 text-sm">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300"
                checked={values.enabled}
                onChange={(event) =>
                  updateValue("enabled", event.target.checked)
                }
              />
              <span className="font-medium">Włączona</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300"
                checked={values.blocking}
                onChange={(event) =>
                  updateValue("blocking", event.target.checked)
                }
              />
              <span className="font-medium">Blokująca</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300"
                checked={values.generatesTask}
                onChange={(event) =>
                  updateValue("generatesTask", event.target.checked)
                }
              />
              <span className="font-medium">Generuje zadanie</span>
            </label>
          </div>
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Treść komunikatu</span>
          <textarea
            className="min-h-32 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.messageTemplate}
            onChange={(event) =>
              updateValue("messageTemplate", event.target.value)
            }
            required
          />
        </label>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Podpowiedź (opcjonalnie)</span>
          <textarea
            className="min-h-24 rounded-lg border border-zinc-200 px-3 py-2"
            value={values.hintTemplate}
            onChange={(event) =>
              updateValue("hintTemplate", event.target.value)
            }
          />
        </label>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Cooldown (dni)</span>
          <input
            className="rounded-lg border border-zinc-200 px-3 py-2"
            type="number"
            min={0}
            value={values.cooldownDays}
            onChange={(event) =>
              updateValue("cooldownDays", event.target.value)
            }
            placeholder="Opcjonalnie"
          />
        </label>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">
          Available placeholders
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {placeholderTokens.map((token) => (
            <span
              key={token}
              className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-mono text-zinc-700 select-all"
            >
              {token}
            </span>
          ))}
        </div>
      </section>

      {(clientError || errorMessage) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {clientError || errorMessage}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Zapisywanie..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
