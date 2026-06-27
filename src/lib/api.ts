/**
 * api.ts — Shared helpers for JSON route handlers.
 *
 * Centralizes response shape and error handling so every endpoint returns a
 * consistent `{ ok, ... }` envelope, never leaks internals (stack traces, Prisma
 * error text) to clients, and maps validation/known errors to the right status.
 */
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/** Success envelope. */
export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, ...data }, init)
}

/** Error envelope with an optional machine-readable `code` and field errors. */
export function fail(
  message: string,
  status = 400,
  extra?: { code?: string; fieldErrors?: Record<string, string[]> }
): NextResponse {
  return NextResponse.json({ ok: false, message, ...extra }, { status })
}

/** A thrown error that carries an HTTP status — caught by `handleRoute`. */
export class HttpError extends Error {
  status: number
  code?: string
  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

/**
 * Wraps a route handler body so thrown errors become clean JSON responses:
 *  - ZodError      → 400 with per-field messages
 *  - HttpError     → its status + message
 *  - anything else → 500 with a generic message (details logged server-side only)
 */
export async function handleRoute(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof ZodError) {
      return fail('Validation failed', 400, {
        code: 'VALIDATION_ERROR',
        fieldErrors: err.flatten().fieldErrors as Record<string, string[]>,
      })
    }
    if (err instanceof HttpError) {
      return fail(err.message, err.status, { code: err.code })
    }
    // Never surface raw error details to the client.
    console.error('[api] Unhandled route error:', err)
    return fail('Something went wrong. Please try again.', 500, { code: 'INTERNAL_ERROR' })
  }
}
