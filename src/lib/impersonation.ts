/**
 * impersonation.ts — shared impersonation constant.
 *
 * Lives in a plain (non-`'use server'`) module because a Server Actions file may
 * only export async functions — exporting this constant from superadmin.ts broke
 * that module's compilation. Both the actions file and the org layout import it
 * from here.
 */

/** Cookie name signaling that a SuperAdmin is viewing an org as its admin. */
export const IMPERSONATION_COOKIE = 'luxe-impersonation'
