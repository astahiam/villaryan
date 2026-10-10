import type { NormalizedProperty, ProviderStatus, SearchQuery } from "../types";

export interface InventoryProvider {
  id: string;
  label: string;
  search(query: SearchQuery): Promise<{
    results: NormalizedProperty[];
    status: ProviderStatus;
  }>;
  getById(id: string, query?: Pick<SearchQuery, "checkIn" | "checkOut" | "adults">): Promise<NormalizedProperty | null>;
}
