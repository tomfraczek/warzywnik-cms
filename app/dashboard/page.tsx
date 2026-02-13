"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Przegląd warzywnika
          </h1>
          <p className="text-base text-zinc-600">
            Szybki podgląd najważniejszych danych z upraw i stanu gleby.
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Aktywne grządki</p>
          <p className="mt-2 text-2xl font-semibold">12</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Warzywa w sezonie</p>
          <p className="mt-2 text-2xl font-semibold">8</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Wilgotność gleby</p>
          <p className="mt-2 text-2xl font-semibold">38%</p>
        </div>
      </div>
    </section>
  );
}
