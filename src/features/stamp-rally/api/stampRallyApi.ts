import apiClient from "@/lib/api/apiClient";
import type { RallyViewResponse } from "@/features/stamp-rally/api/stampRallyTypes";

export async function fetchMyRally(): Promise<RallyViewResponse> {
  const res = await apiClient.get<RallyViewResponse>("/stamp-rallies/me");
  return res.data;
}

export async function checkInToday(): Promise<RallyViewResponse> {
  const res = await apiClient.post<RallyViewResponse>("/stamp-rallies/me/check-ins");
  return res.data;
}
