"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { ArticleForm } from "@/app/components/ArticleForm";
import { useCreateArticle } from "@/app/api/mutations/articles/useCreateArticle";
import { useUploadArticleCoverAnonymous } from "@/app/api/mutations/articles/useUploadArticleCover";
import type { CreateArticlePayload } from "@/app/api/api.types";

export default function NewArticlePage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createMutation = useCreateArticle();
  const uploadCoverAnonymousMutation = useUploadArticleCoverAnonymous();

  const handleSubmit = async (payload: CreateArticlePayload) => {
    setErrorMessage(null);
    try {
      await createMutation.mutateAsync(payload);
      const status = payload.status ? `&status=${payload.status}` : "";
      router.push(`/articles?notice=created${status}`);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setErrorMessage("Rekord o tej nazwie już istnieje.");
          return;
        }
        if (error.response.status === 400) {
          setErrorMessage("Błąd walidacji danych.");
          return;
        }
      }
      setErrorMessage("Nie udało się zapisać artykułu.");
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Artykuły
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Nowy artykuł</h1>
      </header>
      <ArticleForm
        submitLabel="Utwórz artykuł"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        errorMessage={errorMessage}
        onUploadCover={async (file) => {
          return await uploadCoverAnonymousMutation.mutateAsync(file);
        }}
        onUploadContentImage={async (file) => {
          return await uploadCoverAnonymousMutation.mutateAsync(file);
        }}
      />
    </section>
  );
}
