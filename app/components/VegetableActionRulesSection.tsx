"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActionTemplates } from "@/app/api/api.requests";
import type {
  ActionRuleSchedule,
  ActionRuleTrigger,
  ActionTemplateListItem,
  PlantingStartMethod,
} from "@/app/api/api.types";
import {
  actionRuleScheduleOptions,
  actionRuleTriggerOptions,
  plantingStartMethodOptions,
} from "@/app/api/api.types";

import {
  actionRuleScheduleLabels,
  actionRuleTriggerLabels,
  actionTemplateGenerationModeLabels,
  actionTemplatePriorityLabels,
  actionTemplateTargetLabels,
  actionTemplateTypeLabels,
  plantingStartMethodLabels,
} from "../utils/labels";

const MAX_TEMPLATE_PAGES = 500;

const fetchAllTemplatePages = async (params: { q?: string }) => {
  const firstPage = await getActionTemplates({ page: 1, ...params });
  const allItems: ActionTemplateListItem[] = [...firstPage.items];

  if (firstPage.limit <= 0 || firstPage.total <= firstPage.items.length) {
    return allItems;
  }

  const totalPages = Math.ceil(firstPage.total / firstPage.limit);
  const lastPage = Math.min(totalPages, MAX_TEMPLATE_PAGES);

  for (let page = 2; page <= lastPage; page += 1) {
    const nextPage = await getActionTemplates({ page, ...params });
    allItems.push(...nextPage.items);

    if (allItems.length >= firstPage.total) {
      break;
    }
  }

  return allItems;
};

const getTemplateRelationValue = (item: { id: string; slug?: string | null }) =>
  item.slug?.trim() || item.id;

export type VegetableActionRuleFormValue = {
  uid: string;
  actionTemplateSlug: string;
  trigger: ActionRuleTrigger;
  offsetDays: string;
  schedule: ActionRuleSchedule;
  everyNDays: string;
  occurrencesLimit: string;
  applyIfStartMethod: PlantingStartMethod[];
  isEnabled: boolean;
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
  actionTemplateSlug: "",
  trigger,
  offsetDays: "0",
  schedule: "ONCE",
  everyNDays: "",
  occurrencesLimit: "",
  applyIfStartMethod: [],
  isEnabled: true,
});

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
  onUpdate: (next: VegetableActionRuleFormValue) => void;
  onDelete: () => void;
};

const RuleRow = ({ rule, onUpdate, onDelete }: RuleRowProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const templateFilters = useMemo(
    () => ({
      q: debouncedQuery || undefined,
    }),
    [debouncedQuery],
  );

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["action-templates", "all-for-vegetable-rules", templateFilters],
    queryFn: () => fetchAllTemplatePages(templateFilters),
  });

  const selectedTemplate = useMemo(
    () =>
      options.find(
        (item) => getTemplateRelationValue(item) === rule.actionTemplateSlug,
      ),
    [options, rule.actionTemplateSlug],
  );

  const occurrencesLimitParsed = Number(rule.occurrencesLimit);
  const isHighOccurrencesLimit =
    rule.schedule === "EVERY_N_DAYS" &&
    Number.isFinite(occurrencesLimitParsed) &&
    occurrencesLimitParsed > 6;

  const resolvedNames = useMemo(() => {
    const next: Record<string, string> = {};
    for (const item of options) {
      const value = getTemplateRelationValue(item);
      next[value] = `${item.name} · ${value}`;
    }
    return next;
  }, [options]);

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
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Szablon zabiegu</span>
          <div className="relative" ref={comboboxRef}>
            <input
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 pr-8"
              placeholder="Szukaj szablonów zabiegów…"
              value={
                isOpen
                  ? query
                  : (resolvedNames[rule.actionTemplateSlug] ??
                    rule.actionTemplateSlug ??
                    "")
              }
              onFocus={() => setIsOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsOpen(true);
              }}
            />
            {isFetching && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">
                …
              </span>
            )}
            {isOpen && (
              <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
                {options.length === 0 && !isFetching && (
                  <li className="px-3 py-2 text-zinc-500">Brak wyników.</li>
                )}
                {options.map((item) => {
                  const value = getTemplateRelationValue(item);
                  const isSelected = rule.actionTemplateSlug === value;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`w-full text-left px-3 py-2 hover:bg-zinc-50 ${
                          isSelected ? "bg-zinc-100 font-medium" : ""
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onUpdate({ ...rule, actionTemplateSlug: value });
                          setIsOpen(false);
                          setQuery("");
                        }}
                      >
                        <div className="font-medium text-zinc-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          slug/id: {value}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {item.name} —{" "}
                          {item.generationMode
                            ? (actionTemplateGenerationModeLabels[
                                item.generationMode
                              ] ?? item.generationMode)
                            : "-"}
                          {" / "}
                          {actionTemplateTargetLabels[item.target] ??
                            item.target}
                          {" / "}
                          {actionTemplateTypeLabels[item.type] ?? item.type}
                          {item.priority
                            ? ` / ${actionTemplatePriorityLabels[item.priority] ?? item.priority}`
                            : ""}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {rule.actionTemplateSlug && !isOpen && (
            <button
              type="button"
              className="self-start text-xs text-zinc-400 hover:text-zinc-600"
              onClick={() => {
                onUpdate({ ...rule, actionTemplateSlug: "" });
                setQuery("");
              }}
            >
              Wyczyść
            </button>
          )}
        </div>

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
                {actionRuleTriggerLabels[trigger]}
              </option>
            ))}
          </select>
        </label>

        {rule.trigger === "ON_HARVEST_CONFIRMED" && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 md:col-span-2 xl:col-span-4">
            Ten trigger nie tworzy zwykłego automatycznego zadania. Backend
            obsługuje go jako prompt/sugestię po potwierdzeniu zbioru.
          </p>
        )}

        {selectedTemplate?.generationMode === "MANUAL_ONLY" && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 md:col-span-2 xl:col-span-4">
            Ten szablon jest oznaczony jako tylko ręczny. Nie powinien być
            używany w automatycznych regułach.
          </p>
        )}

        {selectedTemplate?.generationMode === "SUGGESTION" && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 md:col-span-2 xl:col-span-4">
            Ten szablon powinien działać jako sugestia, a nie jako automatyczne
            zadanie.
          </p>
        )}

        {selectedTemplate?.generationMode === "POST_HARVEST_PROMPT" && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 md:col-span-2 xl:col-span-4">
            Ten szablon jest przeznaczony do sugestii po zbiorze.
          </p>
        )}

        {selectedTemplate?.generationMode === "WEATHER_TRIGGERED" && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 md:col-span-2 xl:col-span-4">
            Ten szablon zwykle powinien być uruchamiany przez warunki pogodowe,
            nie przez zwykłą regułę warzywa.
          </p>
        )}

        {(selectedTemplate?.maxAutoOccurrencesPerPlanting != null ||
          selectedTemplate?.minDaysBetweenOccurrences != null) && (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 md:col-span-2 xl:col-span-4">
            Ograniczenia szablonu: max automatycznych wystąpień ={" "}
            {selectedTemplate?.maxAutoOccurrencesPerPlanting ?? "-"}, min odstęp
            (dni) = {selectedTemplate?.minDaysBetweenOccurrences ?? "-"}.
          </p>
        )}

        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Opóźnienie (dni)</span>
          <input
            type="number"
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
                {actionRuleScheduleLabels[schedule]}
              </option>
            ))}
          </select>
        </label>

        {rule.schedule === "EVERY_N_DAYS" && (
          <>
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
                placeholder="wymagane"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium">Limit wystąpień</span>
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
          </>
        )}

        {isHighOccurrencesLimit && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 md:col-span-2 xl:col-span-4">
            Wysoki limit może prowadzić do zbyt wielu zadań. Backend zastosuje
            limity anty-zalewowe, ale warto ograniczyć liczbę wystąpień.
          </p>
        )}

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
                {plantingStartMethodLabels[method]}
              </label>
            ))}
          </div>
          <p className="text-zinc-500">
            DIRECT_SOW — reguła będzie działać tylko dla upraw z siewu
            bezpośredniego. TRANSPLANT — reguła będzie działać tylko dla upraw
            przez rozsadę. Puste — reguła działa dla obu ścieżek.
          </p>
        </div>

        <div className="flex items-end justify-between gap-3 text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rule.isEnabled}
              onChange={(event) =>
                onUpdate({
                  ...rule,
                  isEnabled: event.target.checked,
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
      <p className="mt-1 text-xs text-zinc-500">
        Diagnostyka generowania zadań będzie dostępna w osobnym widoku.
      </p>
    </section>
  );
};
