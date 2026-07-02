"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { VegetableForm } from "@/app/components/VegetableForm";
import { useCreateVegetable } from "@/app/api/mutations/vegetables/useCreateVegetable";
import { useUploadVegetableImage } from "@/app/api/mutations/vegetables/useUploadVegetableImage";
import type { CreateVegetablePayload } from "@/app/api/api.types";

export default function NewVegetablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suggestedName = searchParams.get("suggestedName") ?? undefined;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreateVegetable();
  const uploadMutation = useUploadVegetableImage();

  const handleSubmit = async (
    payload: CreateVegetablePayload,
    imageFile: File | null,
  ) => {
    setErrorMessage(null);
    try {
      const result = await createMutation.mutateAsync(payload);
      if (imageFile) {
        await uploadMutation.mutateAsync({
          id: result.id,
          file: imageFile,
        });
      }
      router.push(`/vegetables/${result.id}`);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setErrorMessage("Rekord o tej nazwie już istnieje.");
          return;
        }
        if (error.response.status === 400) {
          const backendMessage =
            typeof error.response.data === "object" &&
            error.response.data &&
            typeof (error.response.data as { message?: unknown }).message ===
              "string"
              ? String((error.response.data as { message?: string }).message)
              : null;

          if (backendMessage) {
            setErrorMessage(backendMessage);
            return;
          }

          setErrorMessage(
            "Błąd walidacji danych (np. limity, nieistniejący actionTemplateSlug lub brak everyNDays).",
          );
          return;
        }
      }
      setErrorMessage("Nie udało się zapisać warzywa.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Warzywa
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Nowe warzywo</h1>
        <p className="text-base text-zinc-600">
          Uzupełnij dane i zapisz nowe warzywo w bazie.
        </p>
      </header>
      <VegetableForm
        submitLabel="Utwórz warzywo"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || uploadMutation.isPending}
        errorMessage={errorMessage}
        initialValues={suggestedName ? { name: suggestedName } : undefined}
      />
    </section>
  );
}
