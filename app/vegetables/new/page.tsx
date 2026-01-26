"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { VegetableForm } from "@/app/components/VegetableForm";
import { useCreateVegetable } from "@/app/api/mutations/vegetables/useCreateVegetable";
import { useUploadVegetableImage } from "@/app/api/mutations/vegetables/useUploadVegetableImage";
import type { CreateVegetablePayload } from "@/app/api/api.types";

export default function NewVegetablePage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreateVegetable();
  const uploadMutation = useUploadVegetableImage();
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;

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
          adminToken,
        });
      }
      router.push(`/vegetables/${result.id}`);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setErrorMessage("Slug jest zajęty");
          return;
        }
        if (error.response.status === 400) {
          setErrorMessage("Błąd walidacji danych.");
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
      />
    </section>
  );
}
