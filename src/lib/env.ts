import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SESSION_SECRET: z.string().min(32),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  STAYAPI_API_KEY: z.string().optional().default(""),
  STAYAPI_BASE_URL: z.string().url().default("https://api.stayapi.com"),
  STAYAPI_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  MAP_PROVIDER: z.enum(["maplibre", "mapbox"]).default("maplibre"),
  MAP_PROVIDER_API_KEY: z.string().optional().default(""),
  OBJECT_STORAGE_ENDPOINT: z.string().optional().default(""),
  OBJECT_STORAGE_REGION: z.string().optional().default("auto"),
  OBJECT_STORAGE_BUCKET: z.string().optional().default(""),
  OBJECT_STORAGE_ACCESS_KEY: z.string().optional().default(""),
  OBJECT_STORAGE_SECRET_KEY: z.string().optional().default(""),
  OBJECT_STORAGE_PUBLIC_BASE_URL: z.string().optional().default(""),
  NOMINATIM_USER_AGENT: z
    .string()
    .default("VillaryanMVP/0.1 (contact@villaryan.id)"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function stayApiConfigured(): boolean {
  return Boolean(getEnv().STAYAPI_API_KEY.trim());
}

export function objectStorageConfigured(): boolean {
  const env = getEnv();
  return Boolean(
    env.OBJECT_STORAGE_ENDPOINT &&
      env.OBJECT_STORAGE_BUCKET &&
      env.OBJECT_STORAGE_ACCESS_KEY &&
      env.OBJECT_STORAGE_SECRET_KEY,
  );
}

export function mapboxGeocodingConfigured(): boolean {
  return Boolean(getEnv().MAP_PROVIDER_API_KEY.trim());
}
