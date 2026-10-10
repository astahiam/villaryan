import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getEnv, objectStorageConfigured } from "../env";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../constants";

export function assertImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Each photo must be 6 MB or smaller.");
  }
}

function extensionFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function storeImage(file: File): Promise<string> {
  assertImageFile(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(file.type)}`;

  if (objectStorageConfigured()) {
    const env = getEnv();
    const client = new S3Client({
      region: env.OBJECT_STORAGE_REGION,
      endpoint: env.OBJECT_STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: env.OBJECT_STORAGE_ACCESS_KEY,
        secretAccessKey: env.OBJECT_STORAGE_SECRET_KEY,
      },
      forcePathStyle: true,
    });
    await client.send(
      new PutObjectCommand({
        Bucket: env.OBJECT_STORAGE_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      }),
    );
    const base = env.OBJECT_STORAGE_PUBLIC_BASE_URL.replace(/\/$/, "");
    return `${base}/${filename}`;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${filename}`;
}
