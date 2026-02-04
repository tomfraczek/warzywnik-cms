import { apiClient } from "@/app/api/axios";
import type {
  CreateFertilizerTypePayload,
  FertilizerListItem,
  FertilizerType,
  ListResponse,
  UpdateFertilizerTypePayload,
  FertilizerCategory,
} from "@/app/fertilizers/api/api.types";

export type GetFertilizersParams = {
  page?: number;
  limit?: number;
  q?: string;
  category?: FertilizerCategory;
  isActive?: boolean;
};

export const getFertilizers = async (
  params: GetFertilizersParams = {},
): Promise<ListResponse<FertilizerListItem>> => {
  const { data } = await apiClient.get<ListResponse<FertilizerListItem>>(
    "/fertilizers",
    { params },
  );
  return data;
};

export const getFertilizer = async (
  idOrSlug: string,
): Promise<FertilizerType> => {
  const { data } = await apiClient.get<FertilizerType>(
    `/fertilizers/${idOrSlug}`,
  );
  return data;
};

export const createFertilizer = async (
  payload: CreateFertilizerTypePayload,
): Promise<FertilizerType> => {
  const { data } = await apiClient.post<FertilizerType>(
    "/fertilizers",
    payload,
  );
  return data;
};

export const updateFertilizer = async (
  id: string,
  payload: UpdateFertilizerTypePayload,
): Promise<FertilizerType> => {
  const { data } = await apiClient.patch<FertilizerType>(
    `/fertilizers/${id}`,
    payload,
  );
  return data;
};

export const deleteFertilizer = async (id: string): Promise<void> => {
  await apiClient.delete(`/fertilizers/${id}`);
};
