import { apiClient } from "@/app/api/axios";
import type {
  CreateSoilPayload,
  ListResponse,
  Soil,
  SoilListItem,
  UpdateSoilPayload,
} from "@/app/soils/api/api.types";

export type GetSoilsParams = {
  page?: number;
  limit?: number;
  q?: string;
};

export const getSoils = async (
  params: GetSoilsParams = {},
): Promise<ListResponse<SoilListItem>> => {
  const { data } = await apiClient.get<ListResponse<SoilListItem>>("/soils", {
    params,
  });
  return data;
};

export const getSoil = async (id: string): Promise<Soil> => {
  const { data } = await apiClient.get<Soil>(`/soils/${id}`);
  return data;
};

export const createSoil = async (payload: CreateSoilPayload): Promise<Soil> => {
  const { data } = await apiClient.post<Soil>("/soils", payload);
  return data;
};

export const updateSoil = async (
  id: string,
  payload: UpdateSoilPayload,
): Promise<Soil> => {
  const { data } = await apiClient.patch<Soil>(`/soils/${id}`, payload);
  return data;
};

export const deleteSoil = async (id: string): Promise<void> => {
  await apiClient.delete(`/soils/${id}`);
};
