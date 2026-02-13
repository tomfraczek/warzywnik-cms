"use client";

import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArticleForm,
  type ArticleFormValues,
} from "@/app/components/ArticleForm";
import { useGetArticle } from "@/app/api/queries/articles/useGetArticle";
import { useUpdateArticle } from "@/app/api/mutations/articles/useUpdateArticle";
import { useUploadArticleCover } from "@/app/api/mutations/articles/useUploadArticleCover";
import { useDeleteArticleCover } from "@/app/api/mutations/articles/useDeleteArticleCover";
import { articleKeys } from "@/app/api/queries/articles/useGetArticles";
import type { Article, CreateArticlePayload } from "@/app/api/api.types";

const mapArticleToFormValues = (data: Article): ArticleFormValues => ({
  title: data.title,
  slug: data.slug,
  excerpt: data.excerpt,
  content: data.content,
  coverImageUrl: data.coverImageUrl ?? "",
  months: data.months ?? [],
  seasons: data.seasons ?? [],
  contexts: data.contexts ?? [],
  priority: data.priority ?? 3,
  status: data.status,
  relatedVegetableIds: data.relatedVegetableIds ?? [],
  relatedSoilIds: data.relatedSoilIds ?? [],
  relatedFertilizerIds: data.relatedFertilizerIds ?? [],
  relatedDiseaseIds: data.relatedDiseaseIds ?? [],
  relatedPestIds: data.relatedPestIds ?? [],
  publishedAt: data.publishedAt,
});

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useGetArticle(params?.id);
  const updateMutation = useUpdateArticle();
  const uploadCoverMutation = useUploadArticleCover();
  const deleteCoverMutation = useDeleteArticleCover();

  const initialValues = useMemo(
    () => (data ? mapArticleToFormValues(data) : undefined),
    [data],
  );

  const handleSubmit = async (payload: CreateArticlePayload) => {
    if (!data) return;
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({ id: data.id, payload });
      await queryClient.invalidateQueries({ queryKey: ["articles"] });
      const status = payload.status ? `&status=${payload.status}` : "";
      router.push(`/articles?notice=updated${status}`);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 409) {
          setErrorMessage("Slug jest zajęty.");
          return;
        }
        if (err.response.status === 400) {
          setErrorMessage("Błąd walidacji danych.");
          return;
        }
        if (err.response.status === 404) {
          setErrorMessage("Nie znaleziono artykułu.");
          return;
        }
      }
      setErrorMessage("Nie udało się zapisać zmian.");
    }
  };

  const handleUploadCover = async (file: File) => {
    if (!data) return null;
    const result = await uploadCoverMutation.mutateAsync({
      id: data.id,
      file,
    });
    await queryClient.invalidateQueries({ queryKey: ["articles"] });
    await queryClient.invalidateQueries({
      queryKey: articleKeys.detail(data.id),
    });
    return result.coverImageUrl ?? null;
  };

  const handleDeleteCover = async () => {
    if (!data) return;
    await deleteCoverMutation.mutateAsync({ id: data.id });
    await queryClient.invalidateQueries({ queryKey: ["articles"] });
    await queryClient.invalidateQueries({
      queryKey: articleKeys.detail(data.id),
    });
  };

  const handleAssignCoverFromLibrary = async (url: string) => {
    if (!data) return;
    await updateMutation.mutateAsync({
      id: data.id,
      payload: { coverImageUrl: url },
    });
    await queryClient.invalidateQueries({ queryKey: ["articles"] });
    await queryClient.invalidateQueries({
      queryKey: articleKeys.detail(data.id),
    });
  };

  const handleUploadContentImage = async (file: File) => {
    if (!data) return null;
    const previousCover = data.coverImageUrl ?? null;
    const result = await uploadCoverMutation.mutateAsync({
      id: data.id,
      file,
    });
    const url = result.coverImageUrl ?? null;
    if (previousCover !== result.coverImageUrl) {
      await updateMutation.mutateAsync({
        id: data.id,
        payload: { coverImageUrl: previousCover },
      });
    }
    await queryClient.invalidateQueries({ queryKey: ["articles"] });
    await queryClient.invalidateQueries({
      queryKey: articleKeys.detail(data.id),
    });
    return url;
  };

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Ładowanie...</p>;
  }

  if (error instanceof AxiosError && error.response?.status === 404) {
    return <p className="text-sm text-red-500">Nie znaleziono artykułu.</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  if (!data || !initialValues) {
    return <p className="text-sm text-red-500">Nie udało się pobrać danych.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Artykuły
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">Edytuj artykuł</h1>
      </header>
      <ArticleForm
        initialValues={initialValues}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={errorMessage}
        onUploadCover={handleUploadCover}
        onDeleteCover={handleDeleteCover}
        onAssignCoverFromLibrary={handleAssignCoverFromLibrary}
        onUploadContentImage={handleUploadContentImage}
      />
    </section>
  );
}
