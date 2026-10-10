import type { NormalizedProperty, SearchQuery } from "../types";

export function rankProperties(
  items: NormalizedProperty[],
  query: SearchQuery,
): NormalizedProperty[] {
  const unique = new Map<string, NormalizedProperty>();
  for (const item of items) {
    if (!unique.has(item.id)) unique.set(item.id, item);
  }
  const list = [...unique.values()];
  list.sort((a, b) => {
    if (query.sort === "price_asc") {
      return (a.priceAmount ?? Number.POSITIVE_INFINITY) - (b.priceAmount ?? Number.POSITIVE_INFINITY);
    }
    if (query.sort === "price_desc") {
      return (b.priceAmount ?? -1) - (a.priceAmount ?? -1);
    }
    const dist = (a.distanceMeters ?? 1_000_000) - (b.distanceMeters ?? 1_000_000);
    if (dist !== 0) return dist;
    if (a.intent !== b.intent) return a.intent === query.intent ? -1 : 1;
    if (query.category && a.category !== b.category) {
      return a.category === query.category ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });
  return list;
}
