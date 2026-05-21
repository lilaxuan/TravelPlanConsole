import { config } from './config';

export interface StatsResponse {
  totalUsers: number;
}

export async function fetchStats(signal?: AbortSignal): Promise<StatsResponse> {
  if (!config.apiBaseUrl) {
    throw new Error('VITE_GONOW_API_BASE_URL is not set');
  }
  const res = await fetch(`${config.apiBaseUrl}/stats`, { signal });
  if (!res.ok) throw new Error(`GET /stats → ${res.status}`);
  return (await res.json()) as StatsResponse;
}
