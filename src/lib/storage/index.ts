/**
 * storage/index.ts — object storage for property images, with graceful gating.
 *
 * S3-compatible, so it works with **Cloudflare R2** (recommended) or **AWS S3**
 * with only env changes. Like the Stripe/Redis integrations, it degrades
 * gracefully: when storage isn't configured, `isStorageConfigured()` is false
 * and the UI falls back to pasting image URLs — nothing breaks.
 *
 * Uploads are proxied through our API route (browser → server → bucket) so the
 * customer doesn't need to configure CORS on their bucket. Object keys are
 * namespaced per org; the returned URL is built from the configured public base.
 *
 * Required env (either set):
 *   Cloudflare R2:  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *                   R2_BUCKET_NAME, R2_PUBLIC_URL
 *   AWS S3:         AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 *                   S3_BUCKET_NAME, S3_PUBLIC_URL
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

interface StorageConfig {
  client: S3Client
  bucket: string
  publicBaseUrl: string
}

let cached: StorageConfig | null | undefined

/** Resolve storage config from env once (R2 preferred, then S3), or null. */
function getConfig(): StorageConfig | null {
  if (cached !== undefined) return cached

  // Cloudflare R2 (S3 API with a custom endpoint).
  if (
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  ) {
    cached = {
      client: new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      }),
      bucket: process.env.R2_BUCKET_NAME,
      publicBaseUrl: process.env.R2_PUBLIC_URL.replace(/\/$/, ''),
    }
    return cached
  }

  // AWS S3.
  if (
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME &&
    process.env.S3_PUBLIC_URL
  ) {
    cached = {
      client: new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }),
      bucket: process.env.S3_BUCKET_NAME,
      publicBaseUrl: process.env.S3_PUBLIC_URL.replace(/\/$/, ''),
    }
    return cached
  }

  cached = null
  return cached
}

/** True when object storage is configured (R2 or S3). */
export function isStorageConfigured(): boolean {
  return getConfig() !== null
}

/** Allowed image MIME types → file extension. */
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}

/** Max upload size (8 MB) — generous for photos, bounded against abuse. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

export type UploadResult = { ok: true; url: string } | { ok: false; error: string }

/**
 * Upload an image buffer for an org and return its public URL. Validates the
 * content type and size; keys are namespaced under the org id.
 */
export async function uploadOrgImage(params: {
  orgId: string
  body: Uint8Array
  contentType: string
}): Promise<UploadResult> {
  const config = getConfig()
  if (!config) return { ok: false, error: 'Image uploads are not configured.' }

  const ext = IMAGE_TYPES[params.contentType]
  if (!ext) return { ok: false, error: 'Only JPG, PNG, WebP, AVIF, or GIF images are allowed.' }
  if (params.body.byteLength > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'Image is too large (max 8 MB).' }
  }

  // A collision-resistant key without extra deps (time + random, hex-safe).
  const rand = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  const key = `orgs/${params.orgId}/${rand}.${ext}`

  try {
    await config.client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: params.body,
        ContentType: params.contentType,
      })
    )
    return { ok: true, url: `${config.publicBaseUrl}/${key}` }
  } catch (e) {
    console.error('[storage] upload failed:', e)
    return { ok: false, error: 'Upload failed. Please try again.' }
  }
}
