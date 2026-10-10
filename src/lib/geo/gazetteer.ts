export type Place = {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  aliases: string[];
};

export const GAZETTEER: Place[] = [
  { id: "ubud", name: "Ubud", region: "Bali", country: "Indonesia", latitude: -8.5069, longitude: 115.2625, aliases: ["ubud bali"] },
  { id: "canggu", name: "Canggu", region: "Bali", country: "Indonesia", latitude: -8.6478, longitude: 115.1385, aliases: ["canggu bali"] },
  { id: "seminyak", name: "Seminyak", region: "Bali", country: "Indonesia", latitude: -8.691, longitude: 115.157, aliases: [] },
  { id: "sanur", name: "Sanur", region: "Bali", country: "Indonesia", latitude: -8.678, longitude: 115.263, aliases: [] },
  { id: "uluwatu", name: "Uluwatu", region: "Bali", country: "Indonesia", latitude: -8.829, longitude: 115.084, aliases: [] },
  { id: "denpasar", name: "Denpasar", region: "Bali", country: "Indonesia", latitude: -8.65, longitude: 115.2167, aliases: [] },
  { id: "kuta", name: "Kuta", region: "Bali", country: "Indonesia", latitude: -8.723, longitude: 115.176, aliases: [] },
  { id: "jimbaran", name: "Jimbaran", region: "Bali", country: "Indonesia", latitude: -8.7906, longitude: 115.1603, aliases: [] },
  { id: "nusa-dua", name: "Nusa Dua", region: "Bali", country: "Indonesia", latitude: -8.8005, longitude: 115.231, aliases: [] },
  { id: "jakarta", name: "Jakarta", region: "DKI Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456, aliases: ["dki"] },
  { id: "bandung", name: "Bandung", region: "West Java", country: "Indonesia", latitude: -6.9175, longitude: 107.6191, aliases: [] },
  { id: "yogyakarta", name: "Yogyakarta", region: "Yogyakarta", country: "Indonesia", latitude: -7.7956, longitude: 110.3695, aliases: ["jogja", "yogya"] },
  { id: "labuan-bajo", name: "Labuan Bajo", region: "East Nusa Tenggara", country: "Indonesia", latitude: -8.4539, longitude: 119.889, aliases: ["bajo"] },
  { id: "lombok", name: "Lombok", region: "West Nusa Tenggara", country: "Indonesia", latitude: -8.65, longitude: 116.324, aliases: ["kuta lombok", "senggigi"] },
  { id: "surabaya", name: "Surabaya", region: "East Java", country: "Indonesia", latitude: -7.2575, longitude: 112.7521, aliases: [] },
  { id: "ubud-north", name: "Tegallalang", region: "Bali", country: "Indonesia", latitude: -8.431, longitude: 115.279, aliases: ["tegallalang"] },
];

export function searchGazetteer(query: string, limit = 6): Place[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return GAZETTEER.filter((place) => {
    const hay = `${place.name} ${place.region} ${place.aliases.join(" ")}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, limit);
}

export function formatPlaceLabel(place: Place): string {
  return `${place.name}, ${place.region}`;
}
