/**
 * route.ts — POST /api/org/[slug]/upload
 *
 * Authenticated image upload for a listing. The browser sends a single `file`
 * (multipart/form-data); we stream it to object storage and return the public
 * URL to store on the property. Requires a member who can create properties.
 * Returns 503 when storage isn't configured so the client can fall back to the
 * paste-a-URL flow.
 */
import { handleRoute, ok, fail, HttpError } from '@/lib/api'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { getOrgBySlug } from '@/lib/data/dashboard'
import { isStorageConfigured, uploadOrgImage, MAX_UPLOAD_BYTES } from '@/lib/storage'

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  return handleRoute(async () => {
    const { slug } = await params

    // AuthN + AuthZ — a member who may create listings for this org.
    const session = await auth()
    if (!session?.user) throw new HttpError(401, 'You must be signed in.', 'UNAUTHENTICATED')
    if (!can(session, 'properties:create', slug)) {
      throw new HttpError(403, 'You do not have permission to upload here.', 'FORBIDDEN')
    }

    if (!isStorageConfigured()) {
      return fail('Image uploads are not configured. Paste an image URL instead.', 503, {
        code: 'STORAGE_DISABLED',
      })
    }

    const org = await getOrgBySlug(slug)
    if (!org) throw new HttpError(404, 'Organization not found.', 'NOT_FOUND')

    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) throw new HttpError(400, 'No file provided.', 'BAD_REQUEST')
    if (file.size > MAX_UPLOAD_BYTES) {
      return fail('Image is too large (max 8 MB).', 413, { code: 'TOO_LARGE' })
    }

    const body = new Uint8Array(await file.arrayBuffer())
    const result = await uploadOrgImage({ orgId: org.id, body, contentType: file.type })
    if (!result.ok) return fail(result.error, 400, { code: 'UPLOAD_FAILED' })

    return ok({ url: result.url }, { status: 201 })
  })
}
