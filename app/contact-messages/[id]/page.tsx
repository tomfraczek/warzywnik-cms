"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { useGetContactMessage } from "@/app/api/queries/contact-messages/useGetContactMessage";
import { useDeleteContactMessage } from "@/app/api/mutations/contact-messages/useDeleteContactMessage";
import { contactMessageCategoryLabels } from "@/app/utils/labels";
import ConfirmDeleteDialog from "@/app/components/ConfirmDeleteDialog";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function ContactMessageDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetContactMessage(params?.id);
  const deleteMutation = useDeleteContactMessage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!data) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(data.id);
      router.push("/contact-messages?deleted=true");
    } catch {
      setDeleteError("Nie udało się usunąć wiadomości.");
    }
  };

  const notFound =
    error instanceof AxiosError && error.response?.status === 404;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (notFound) {
    return <p className="text-sm text-red-500">Nie znaleziono wiadomości.</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/contact-messages"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Wróć do listy
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Wiadomości
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-zinc-900">
              {data.title}
            </h1>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
              {contactMessageCategoryLabels[data.category]}
            </span>
          </div>
          <button
            type="button"
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            Usuń
          </button>
        </div>
      </header>

      {deleteError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {deleteError}
        </div>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Nadawca</h2>
        <div className="mt-4 space-y-2 text-sm text-zinc-600">
          <p>
            <span className="font-medium text-zinc-900">
              Imię i nazwisko:
            </span>{" "}
            {data.userDisplayName || "—"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">E-mail:</span>{" "}
            {data.userEmail || "—"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">ID użytkownika:</span>{" "}
            {data.userId || "—"}
          </p>
          <p>
            <span className="font-medium text-zinc-900">Data wysłania:</span>{" "}
            {formatDate(data.createdAt)}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Wiadomość</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-600">
          {data.content}
        </p>
      </section>

      {showDeleteDialog && (
        <ConfirmDeleteDialog
          title="Usuń wiadomość?"
          description="Ta operacja jest nieodwracalna. Wiadomość zostanie trwale usunięta."
          isPending={deleteMutation.isPending}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </section>
  );
}
