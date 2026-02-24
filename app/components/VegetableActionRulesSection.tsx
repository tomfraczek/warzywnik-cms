"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ActionRuleSchedule,
  ActionRuleTrigger,
  ActionTemplate,
  PlantingStartMethod,
} from "@/app/api/api.types";
import {
  actionRuleScheduleOptions,
  actionRuleTriggerOptions,
  plantingStartMethodOptions,
} from "@/app/api/api.types";
import { useGetActionTemplates } from "@/app/api/queries/action-templates/useGetActionTemplates";
import { useGetActionTemplatesByIds } from "@/app/api/queries/action-templates/useGetActionTemplatesByIds";

export type VegetableActionRuleFormValue = {
  uid: string;
  actionTemplateId: string;
  trigger: ActionRuleTrigger;
  offsetDays: string;
  schedule: ActionRuleSchedule;
  everyNDays: string;
  occurrencesLimit: string;
  applyIfStartMethod: PlantingStartMethod[];
  enabled: boolean;
};

const makeUid = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const createEmptyVegetableActionRule = (
  trigger: ActionRuleTrigger = "ON_SOWED",
): VegetableActionRuleFormValue => ({
  uid: makeUid(),
  actionTemplateId: "",
  trigger,
  offsetDays: "0",
  schedule: "ONCE",
  everyNDays: "",
  occurrencesLimit: "",
  applyIfStartMethod: [],
  enabled: true,
});

const triggerLabels: Record<ActionRuleTrigger, string> = {
  ON_SOWED: "Siew zakończony",
  AFTER_SOWING_DAYS: "Po X dniach od siewu",
  BEFORE_TRANSPLANT_DAYS: "X dni przed przesadzeniem",
  ON_TRANSPLANTED: "Przesadzenie zakończone",
  AFTER_TRANSPLANT_DAYS: "Po X dniach od przesadzenia",
  ON_HARVEST_WINDOW_START: "Początek okna zbioru",
  BEFORE_HARVEST_WINDOW_START_DAYS: "X dni przed oknem zbioru",
  ON_HARVEST_CONFIRMED: "Zbiór potwierdzony",
  AFTER_HARVEST_DAYS: "Po X dniach od zbioru",
};

const scheduleLabels: Record<ActionRuleSchedule, string> = {
  ONCE: "Jednorazowo",
  EVERY_N_DAYS: "Co N dni",
};

const startMethodLabels: Record<PlantingStartMethod, string> = {
  DIRECT_SOW: "Siew bezpośredni",
  TRANSPLANT: "Rozsada/przesadzenie",
};

const groupedTriggers: Array<{
  key: string;
  title: string;
  subtitle?: string;
  triggers: ActionRuleTrigger[];
}> = [
  {
    key: "sowing",
    title: "Po siewie",
    triggers: ["ON_SOWED", "AFTER_SOWING_DAYS"],
  },
  {
    key: "transplant",
    title: "Po przesadzeniu",
    triggers: [
      "BEFORE_TRANSPLANT_DAYS",
      "ON_TRANSPLANTED",
      "AFTER_TRANSPLANT_DAYS",
    ],
  },
  {
    key: "harvest-window",
    title: "Okno zbioru",
    triggers: ["ON_HARVEST_WINDOW_START", "BEFORE_HARVEST_WINDOW_START_DAYS"],
  },
  {
    key: "post-harvest-proposals",
    title: "Po zbiorze: propozycje",
    subtitle: "pokazane w oknie modalnym",
    triggers: ["ON_HARVEST_CONFIRMED"],
  },
  {
    key: "post-harvest-auto",
    title: "Po zbiorze: automatyczne",
    subtitle: "tworzone automatycznie po zbiorze",
    triggers: ["AFTER_HARVEST_DAYS"],
  },
];

type RuleRowProps = {
  rule: VegetableActionRuleFormValue;
  selectedTemplateName: string;
  onUpdate: (next: VegetableActionRuleFormValue) => void;
  onDelete: () => void;
};

const RuleRow = ({
  rule,
  selectedTemplateName,
  onUpdate,
  onDelete,
}: RuleRowProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const { data: templatesData, isFetching } = useGetActionTemplates({
    page: 1,
    limit: 20,
    q: debouncedQuery || undefined,
    scope: "planting",
  });

  const options = templatesData?.items ?? [];

  const selectedOptionMissing =
    Boolean(rule.actionTemplateId) &&
    !options.some((item) => item.id === rule.actionTemplateId);

  const toggleStartMethod = (method: PlantingStartMethod) => {
    const next = rule.applyIfStartMethod.includes(method)
      ? rule.applyIfStartMethod.filter((item) => item !== method)
      : [...rule.applyIfStartMethod, method];

    onUpdate({
      ...rule,
      applyIfStartMethod: next,
    });
  };

  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Szablon zabiegu</span>
          <input
            className="rounded-lg border border-zinc-200 px-3 py-2"
            placeholder="Szukaj szablonów zabiegów"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2"
            value={rule.actionTemplateId}
            onChange={(event) =>
              onUpdate({
                ...rule,
                actionTemplateId: event.target.value,
              })
            }
          >
            <option value="">Wybierz szablon</option>
            {selectedOptionMissing && (
              <option value={rule.actionTemplateId}>
                {selectedTemplateName}
              </option>
            )}
            {options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.type})
              </option>
            ))}
          </select>
          {isFetching && <span className="text-zinc-500">Ładowanie…</span>}
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Trigger</span>
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2"
            value={rule.trigger}
            onChange={(event) =>
              onUpdate({
                ...rule,
                trigger: event.target.value as ActionRuleTrigger,
              })
            }
          >
            {actionRuleTriggerOptions.map((trigger) => (
              <option key={trigger} value={trigger}>
                {triggerLabels[trigger]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Opóźnienie (dni)</span>
          <input
            type="number"
            min={0}
            step={1}
            className="rounded-lg border border-zinc-200 px-3 py-2"
            value={rule.offsetDays}
            onChange={(event) =>
              onUpdate({
                ...rule,
                offsetDays: event.target.value,
              })
            }
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Harmonogram</span>
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2"
            value={rule.schedule}
            onChange={(event) => {
              const schedule = event.target.value as ActionRuleSchedule;
              onUpdate({
                ...rule,
                schedule,
                everyNDays: schedule === "EVERY_N_DAYS" ? rule.everyNDays : "",
              });
            }}
          >
            {actionRuleScheduleOptions.map((schedule) => (
              <option key={schedule} value={schedule}>
                {scheduleLabels[schedule]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Co ile dni</span>
          <input
            type="number"
            min={1}
            step={1}
            className="rounded-lg border border-zinc-200 px-3 py-2"
            value={rule.everyNDays}
            onChange={(event) =>
              onUpdate({
                ...rule,
                everyNDays: event.target.value,
              })
            }
            disabled={rule.schedule !== "EVERY_N_DAYS"}
            placeholder={
              rule.schedule === "EVERY_N_DAYS"
                ? "wymagane"
                : "tylko dla trybu 'Co N dni'"
            }
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Limit powtórzeń</span>
          <input
            type="number"
            min={1}
            step={1}
            className="rounded-lg border border-zinc-200 px-3 py-2"
            value={rule.occurrencesLimit}
            onChange={(event) =>
              onUpdate({
                ...rule,
                occurrencesLimit: event.target.value,
              })
            }
            placeholder="opcjonalnie"
          />
        </label>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Dotyczy metody rozpoczęcia</span>
          <div className="flex gap-3 rounded-lg border border-zinc-200 px-3 py-2">
            {plantingStartMethodOptions.map((method) => (
              <label key={method} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={rule.applyIfStartMethod.includes(method)}
                  onChange={() => toggleStartMethod(method)}
                />
                {startMethodLabels[method]}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={(event) =>
                onUpdate({
                  ...rule,
                  enabled: event.target.checked,
                })
              }
            />
            Aktywna
          </label>

          <button
            type="button"
            className="rounded-lg border border-red-200 px-3 py-2 text-red-600"
            onClick={onDelete}
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

export type VegetableActionRulesSectionProps = {
  rulesVersion?: number | null;
  rules: VegetableActionRuleFormValue[];
  onChange: (next: VegetableActionRuleFormValue[]) => void;
};

export const VegetableActionRulesSection = ({
  rulesVersion,
  rules,
  onChange,
}: VegetableActionRulesSectionProps) => {
  const selectedIds = useMemo(
    () => rules.map((rule) => rule.actionTemplateId).filter(Boolean),
    [rules],
  );

  const { data: selectedTemplates } = useGetActionTemplatesByIds(selectedIds);

  const selectedTemplateMap = useMemo(() => {
    const map = new Map<string, string>();

    (selectedTemplates ?? []).forEach((item: ActionTemplate) => {
      map.set(item.id, `${item.name} (${item.type})`);
    });

    return map;
  }, [selectedTemplates]);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-zinc-900">
          Reguły zabiegów dla warzywa
        </h2>
        <p className="text-xs text-zinc-500">
          Istniejące nasadzenia zachowują swoją wersję reguł
          (appliedRulesVersion). Możesz przeliczyć reguły z poziomu aplikacji
          mobilnej lub panelu admina.
        </p>
        <p className="text-xs text-zinc-500">
          Dla triggerów BEFORE_* podawaj dodatni &quot;Opóźnienie (dni)&quot; —
          backend odejmie tę wartość od daty referencyjnej.
        </p>
        <p className="text-xs text-zinc-600">
          Wersja reguł:{" "}
          <span className="font-medium">{rulesVersion ?? "-"}</span>
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {groupedTriggers.map((group) => {
          const groupRules = rules.filter((rule) =>
            group.triggers.includes(rule.trigger),
          );

          return (
            <div
              key={group.key}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {group.title}
                  </h3>
                  {group.subtitle && (
                    <p className="text-xs text-zinc-500">{group.subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs"
                  onClick={() =>
                    onChange([
                      ...rules,
                      createEmptyVegetableActionRule(group.triggers[0]),
                    ])
                  }
                >
                  Dodaj regułę
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {groupRules.length === 0 && (
                  <p className="text-xs text-zinc-500">
                    Brak reguł w tej grupie.
                  </p>
                )}

                {groupRules.map((rule) => (
                  <RuleRow
                    key={rule.uid}
                    rule={rule}
                    selectedTemplateName={
                      selectedTemplateMap.get(rule.actionTemplateId) ??
                      rule.actionTemplateId
                    }
                    onUpdate={(nextRule) =>
                      onChange(
                        rules.map((current) =>
                          current.uid === rule.uid ? nextRule : current,
                        ),
                      )
                    }
                    onDelete={() =>
                      onChange(
                        rules.filter((current) => current.uid !== rule.uid),
                      )
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Dostępne triggery: {actionRuleTriggerOptions.join(", ")}
      </p>
    </section>
  );
};
