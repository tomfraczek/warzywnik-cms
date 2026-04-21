import { apiClient, unwrapData } from "@/app/api/axios";
import type {
  ActionTemplate,
  ActionTemplateListItem,
  Article,
  ArticleListItem,
  ArticleStatus,
  ArticleSeason,
  ArticleContext,
  MediaLibraryResponse,
  CreateDiseasePayload,
  CreatePestPayload,
  CreateActionTemplatePayload,
  CreateVegetablePayload,
  Disease,
  ListResponse,
  Pest,
  CreateArticlePayload,
  UpdateArticlePayload,
  UpdateActionTemplatePayload,
  UpdateDiseasePayload,
  UpdatePestPayload,
  UpdateVegetablePayload,
  Vegetable,
  VegetableListResponse,
  DemandLevel,
  SunExposure,
  ActionTemplateTarget,
  ActionTemplateEnvironment,
  ActionTemplateType,
  DeleteManyDto,
  AnalyticsDashboard,
  AnalyticsVegetablesPopularResponse,
  AnalyticsArticlesPopularResponse,
  AnalyticsVegetablesPopularSort,
  AnalyticsArticlesPopularSort,
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

export const deleteManyVegetables = async (
  payload: DeleteManyDto,
): Promise<void> => {
  await apiClient.delete("/vegetables", {
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const uploadVegetableImage = async (
  id: string,
  file: File,
): Promise<Vegetable> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<Vegetable>(
    `/uploads/vegetables/${id}/image`,
    formData,
  );
  return data;
};

export const deleteVegetableImage = async (id: string): Promise<void> => {
  await apiClient.delete(`/uploads/vegetables/${id}/image`);
};

export const resetVegetableCustomization = async (
  id: string,
): Promise<Vegetable> => {
  const { data } = await apiClient.patch<Vegetable>(`/vegetables/${id}`, {
    isCustomized: false,
  });
  return data;
};

export const getPests = async (
  params: { page?: number; limit?: number; q?: string } = {},
): Promise<ListResponse<{ id: string; name: string; slug: string | null }>> => {
  const { data } = await apiClient.get<
    ListResponse<{ id: string; name: string; slug: string | null }>
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

export const deleteManyPests = async (
  payload: DeleteManyDto,
): Promise<void> => {
  await apiClient.delete("/pests", {
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getDiseases = async (
  params: { page?: number; limit?: number; q?: string } = {},
): Promise<ListResponse<{ id: string; name: string; slug: string | null }>> => {
  const { data } = await apiClient.get<
    ListResponse<{ id: string; name: string; slug: string | null }>
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

export const deleteManyDiseases = async (
  payload: DeleteManyDto,
): Promise<void> => {
  await apiClient.delete("/diseases", {
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getActionTemplates = async (
  params: {
    page?: number;
    limit?: number;
    q?: string;
    target?: ActionTemplateTarget;
    environment?: ActionTemplateEnvironment;
    type?: ActionTemplateType;
  } = {},
): Promise<ListResponse<ActionTemplateListItem>> => {
  const { data } = await apiClient.get<ListResponse<ActionTemplateListItem>>(
    "/action-templates",
    { params },
  );
  return data;
};

export const getActionTemplate = async (
  id: string,
): Promise<ActionTemplate> => {
  const { data } = await apiClient.get<ActionTemplate>(
    `/action-templates/${id}`,
  );
  return data;
};

export const createActionTemplate = async (
  payload: CreateActionTemplatePayload,
): Promise<ActionTemplate> => {
  const { data } = await apiClient.post<ActionTemplate>(
    "/action-templates",
    payload,
  );
  return data;
};

export const updateActionTemplate = async (
  id: string,
  payload: UpdateActionTemplatePayload,
): Promise<ActionTemplate> => {
  const normalizedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as UpdateActionTemplatePayload;

  const { data } = await apiClient.patch<ActionTemplate>(
    `/action-templates/${id}`,
    normalizedPayload,
  );
  return data;
};

export const deleteActionTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`/action-templates/${id}`);
};

export const deleteManyActionTemplates = async (
  payload: DeleteManyDto,
): Promise<void> => {
  await apiClient.delete("/action-templates", {
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
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

export const getArticle = async (id: string): Promise<Article> => {
  const { data } = await apiClient.get<Article>(`/articles/${id}`);
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

export const deleteManyArticles = async (
  payload: DeleteManyDto,
): Promise<void> => {
  await apiClient.delete("/articles", {
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const uploadArticleCoverAnonymous = async (
  file: File,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ url: string }>(
    `/uploads/articles/cover`,
    formData,
  );
  return data.url;
};

export const uploadArticleCover = async (
  id: string,
  file: File,
): Promise<Article> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<Article>(
    `/uploads/articles/${id}/cover`,
    formData,
  );
  return data;
};

export const deleteArticleCover = async (id: string): Promise<void> => {
  await apiClient.delete(`/uploads/articles/${id}/cover`);
};

export type GetMediaLibraryParams = {
  limit?: number;
  cursor?: string | null;
};

export const getVegetablesMediaLibrary = async (
  params: GetMediaLibraryParams = {},
): Promise<MediaLibraryResponse> => {
  const { data } = await apiClient.get<MediaLibraryResponse>(
    "/media-library/vegetables",
    { params },
  );
  return data;
};

export const getArticlesMediaLibrary = async (
  params: GetMediaLibraryParams = {},
): Promise<MediaLibraryResponse> => {
  const { data } = await apiClient.get<MediaLibraryResponse>(
    "/media-library/articles",
    { params },
  );
  return data;
};

export const unwrap = unwrapData;

// ─── Analytics ────────────────────────────────────────────────────────────────

const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;

const adminHeaders = () => (adminToken ? { "x-admin-token": adminToken } : {});

export const getAnalyticsDashboard = async (
  top = 10,
): Promise<AnalyticsDashboard> => {
  const { data } = await apiClient.get<AnalyticsDashboard>(
    "/v1/cms/analytics/dashboard",
    { params: { top }, headers: adminHeaders() },
  );
  return data;
};

export type GetAnalyticsVegetablesPopularParams = {
  limit?: number;
  sort?: AnalyticsVegetablesPopularSort;
  windowDays?: number;
};

export const getAnalyticsVegetablesPopular = async (
  params: GetAnalyticsVegetablesPopularParams = {},
): Promise<AnalyticsVegetablesPopularResponse> => {
  const { data } = await apiClient.get<AnalyticsVegetablesPopularResponse>(
    "/v1/cms/analytics/vegetables/popular",
    { params, headers: adminHeaders() },
  );
  return data;
};

export type GetAnalyticsArticlesPopularParams = {
  limit?: number;
  sort?: AnalyticsArticlesPopularSort;
};

export const getAnalyticsArticlesPopular = async (
  params: GetAnalyticsArticlesPopularParams = {},
): Promise<AnalyticsArticlesPopularResponse> => {
  const { data } = await apiClient.get<AnalyticsArticlesPopularResponse>(
    "/v1/cms/analytics/articles/popular",
    { params, headers: adminHeaders() },
  );
  return data;
};
