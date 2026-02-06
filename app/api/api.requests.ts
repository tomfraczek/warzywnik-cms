import { apiClient, unwrapData } from "@/app/api/axios";
import type {
  Article,
  ArticleListItem,
  ArticleStatus,
  ArticleSeason,
  ArticleContext,
  MediaItem,
  CreateDiseasePayload,
  CreatePestPayload,
  CreateVegetablePayload,
  Disease,
  ListResponse,
  Pest,
  CreateArticlePayload,
  UpdateArticlePayload,
  UpdateDiseasePayload,
  UpdatePestPayload,
  UpdateVegetablePayload,
  Vegetable,
  VegetableListResponse,
  DemandLevel,
  SunExposure,
} from "@/app/api/api.types";

export type GetVegetablesParams = {
  page?: number;
  limit?: number;
  q?: string;
  sunExposure?: SunExposure;
  waterDemand?: DemandLevel;
  nutrientDemand?: DemandLevel;
};

export const getVegetables = async (
  params: GetVegetablesParams = {},
): Promise<VegetableListResponse> => {
  const { data } = await apiClient.get<VegetableListResponse>("/vegetables", {
    params,
  });
  return data;
};

export const getVegetable = async (id: string): Promise<Vegetable> => {
  const { data } = await apiClient.get<Vegetable>(`/vegetables/${id}`);
  return data;
};

const normalizePatchPayload = <T extends Record<string, unknown>>(
  payload: T,
) => {
  const cleaned: Record<string, unknown> = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value === "")
    ) {
      return;
    }
    cleaned[key] = value;
  });

  return cleaned as Partial<T>;
};

const normalizeVegetablePayload = (
  payload: CreateVegetablePayload | UpdateVegetablePayload,
) => normalizePatchPayload(payload);

export const createVegetable = async (
  payload: CreateVegetablePayload,
): Promise<Vegetable> => {
  const normalizedPayload = normalizeVegetablePayload(payload);
  const { data } = await apiClient.post<Vegetable>(
    "/vegetables",
    normalizedPayload,
  );
  return data;
};

export const updateVegetable = async (
  id: string,
  payload: UpdateVegetablePayload,
): Promise<Vegetable> => {
  const normalizedPayload = normalizeVegetablePayload(payload);

  const { data } = await apiClient.patch<Vegetable>(
    `/vegetables/${id}`,
    normalizedPayload,
  );

  return data;
};

export const deleteVegetable = async (id: string): Promise<void> => {
  await apiClient.delete(`/vegetables/${id}`);
};

export const uploadVegetableImage = async (
  id: string,
  file: File,
  adminToken?: string,
): Promise<Vegetable> => {
  const formData = new FormData();
  formData.append("file", file);
  const headers: Record<string, string> = {};
  if (adminToken) {
    headers["X-Admin-Token"] = adminToken;
  }

  const { data } = await apiClient.post<Vegetable>(
    `/uploads/vegetables/${id}/image`,
    formData,
    {
      headers,
    },
  );
  return data;
};

export const deleteVegetableImage = async (
  id: string,
  adminToken?: string,
): Promise<void> => {
  const headers: Record<string, string> = {};
  if (adminToken) {
    headers["X-Admin-Token"] = adminToken;
  }

  await apiClient.delete(`/uploads/vegetables/${id}/image`, {
    headers,
  });
};

export const getPests = async (
  params: { page?: number; limit?: number; q?: string } = {},
): Promise<ListResponse<{ id: string; slug: string; name: string }>> => {
  const { data } = await apiClient.get<
    ListResponse<{ id: string; slug: string; name: string }>
  >("/pests", { params });
  return data;
};

export const getPest = async (id: string): Promise<Pest> => {
  const { data } = await apiClient.get<Pest>(`/pests/${id}`);
  return data;
};

export const createPest = async (payload: CreatePestPayload): Promise<Pest> => {
  const { data } = await apiClient.post<Pest>("/pests", payload);
  return data;
};

export const updatePest = async (
  id: string,
  payload: UpdatePestPayload,
): Promise<Pest> => {
  const normalizedPayload = normalizePatchPayload(payload);
  const { data } = await apiClient.patch<Pest>(
    `/pests/${id}`,
    normalizedPayload,
  );
  return data;
};

export const deletePest = async (id: string): Promise<void> => {
  await apiClient.delete(`/pests/${id}`);
};

export const getDiseases = async (
  params: { page?: number; limit?: number; q?: string } = {},
): Promise<ListResponse<{ id: string; slug: string; name: string }>> => {
  const { data } = await apiClient.get<
    ListResponse<{ id: string; slug: string; name: string }>
  >("/diseases", { params });
  return data;
};

export const getDisease = async (id: string): Promise<Disease> => {
  const { data } = await apiClient.get<Disease>(`/diseases/${id}`);
  return data;
};

export const createDisease = async (
  payload: CreateDiseasePayload,
): Promise<Disease> => {
  const { data } = await apiClient.post<Disease>("/diseases", payload);
  return data;
};

export const updateDisease = async (
  id: string,
  payload: UpdateDiseasePayload,
): Promise<Disease> => {
  const normalizedPayload = normalizePatchPayload(payload);
  const { data } = await apiClient.patch<Disease>(
    `/diseases/${id}`,
    normalizedPayload,
  );
  return data;
};

export const deleteDisease = async (id: string): Promise<void> => {
  await apiClient.delete(`/diseases/${id}`);
};

export type GetArticlesParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: ArticleStatus;
  month?: number;
  season?: ArticleSeason;
  context?: ArticleContext;
};

export const getArticles = async (
  params: GetArticlesParams = {},
): Promise<ListResponse<ArticleListItem>> => {
  const { data } = await apiClient.get<ListResponse<ArticleListItem>>(
    "/articles",
    { params },
  );
  return data;
};

export const getArticle = async (idOrSlug: string): Promise<Article> => {
  const { data } = await apiClient.get<Article>(`/articles/${idOrSlug}`);
  return data;
};

export const createArticle = async (
  payload: CreateArticlePayload,
): Promise<Article> => {
  const { data } = await apiClient.post<Article>("/articles", payload);
  return data;
};

export const updateArticle = async (
  id: string,
  payload: UpdateArticlePayload,
): Promise<Article> => {
  const normalizedPayload = normalizePatchPayload(payload);
  const { data } = await apiClient.patch<Article>(
    `/articles/${id}`,
    normalizedPayload,
  );
  return data;
};

export const deleteArticle = async (id: string): Promise<void> => {
  await apiClient.delete(`/articles/${id}`);
};

export type GetMediaLibraryParams = {
  page?: number;
  limit?: number;
  q?: string;
};

const mediaLibraryPath = "/media-library";

export const getMediaLibrary = async (
  params: GetMediaLibraryParams = {},
): Promise<ListResponse<MediaItem>> => {
  const { data } = await apiClient.get<ListResponse<MediaItem>>(
    mediaLibraryPath,
    { params },
  );
  return data;
};

export const uploadMedia = async (file: File): Promise<MediaItem> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<MediaItem>(
    `${mediaLibraryPath}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
};

export const unwrap = unwrapData;
