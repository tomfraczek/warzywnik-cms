import { apiClient, unwrapData } from "@/app/api/axios";
import type {
  CreateDiseasePayload,
  CreatePestPayload,
  CreateVegetablePayload,
  Disease,
  ListResponse,
  Pest,
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

export const createVegetable = async (
  payload: CreateVegetablePayload,
): Promise<Vegetable> => {
  const { data } = await apiClient.post<Vegetable>("/vegetables", payload);
  return data;
};

export const updateVegetable = async (
  id: string,
  payload: UpdateVegetablePayload,
): Promise<Vegetable> => {
  const { data } = await apiClient.patch<Vegetable>(
    `/vegetables/${id}`,
    payload,
  );
  return data;
};

export const deleteVegetable = async (id: string): Promise<void> => {
  await apiClient.delete(`/vegetables/${id}`);
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
  const { data } = await apiClient.patch<Pest>(`/pests/${id}`, payload);
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
  const { data } = await apiClient.patch<Disease>(`/diseases/${id}`, payload);
  return data;
};

export const deleteDisease = async (id: string): Promise<void> => {
  await apiClient.delete(`/diseases/${id}`);
};

export const unwrap = unwrapData;
