import { localProvider } from "../providers/local";
import { getStayProvider } from "../providers/stayapi";
import { SEARCH_PAGE_SIZE } from "../constants";
import type { NormalizedProperty, SearchQuery, SearchResponse } from "../types";
import { rankProperties } from "./rank";

export async function searchProperties(query: SearchQuery, locationLabel: string): Promise<SearchResponse> {
  const stay = getStayProvider();
  const [local, external] = await Promise.all([
    localProvider.search(query),
    stay.search(query),
  ]);

  const ranked = rankProperties([...local.results, ...external.results], query);
  const start = (query.page - 1) * SEARCH_PAGE_SIZE;
  const pageRows = ranked.slice(start, start + SEARCH_PAGE_SIZE);

  return {
    results: pageRows,
    total: ranked.length,
    page: query.page,
    pageSize: SEARCH_PAGE_SIZE,
    providers: [local.status, external.status],
    location: { lat: query.lat, lng: query.lng, label: locationLabel },
  };
}

export async function getPropertyByCompositeId(
  id: string,
  extras?: { checkIn?: string; checkOut?: string; adults?: number },
): Promise<NormalizedProperty | null> {
  if (id.startsWith("local_")) return localProvider.getById(id);
  if (id.startsWith("mock_") || id.startsWith("stayapi-")) {
    return getStayProvider().getById(id, extras);
  }
  return localProvider.getById(id);
}
