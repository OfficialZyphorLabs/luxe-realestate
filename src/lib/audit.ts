/**
 * audit.ts — Fire-and-forget helper that writes an AuditLog row.
 *
 * Called from every mutation (Server Actions, Route Handlers). Failures are
 * swallowed — audit logging must never break the main operation or surface
 * errors to the user.
 *
 * Callers pass typed `AuditAction` strings so the log stays consistent and
 * the audit-log page can filter/group by action type.
 */
import { prisma } from '@/lib/prisma'

export type AuditAction =
  | 'member.invited'
  | 'member.role_changed'
  | 'member.removed'
  | 'member.invite_cancelled'
  | 'org.settings_updated'
  | 'org.suspended'
  | 'org.reactivated'
  | 'org.deleted'
  | 'org.plan_changed'
  | 'user.superadmin_granted'
  | 'user.superadmin_revoked'
  | 'impersonation.started'
  | 'impersonation.ended'
  // Phase 4 — properties
  | 'property.created'
  | 'property.updated'
  | 'property.deleted'
  | 'property.published'
  | 'property.unpublished'
  // Phase 4 — leads
  | 'lead.created'
  | 'lead.status_changed'
  | 'lead.assigned'
  | 'lead.note_added'
  // Phase 5 — billing
  | 'billing.checkout_started'
  | 'billing.portal_opened'
  | 'billing.subscription_updated'

export interface LogActionParams {
  actorId: string
  actorType: 'USER' | 'SUPERADMIN' | 'SYSTEM'
  organizationId?: string
  action: AuditAction
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}

export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorType: params.actorType,
        organizationId: params.organizationId ?? null,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        metadata: params.metadata ?? null,
      },
    })
  } catch {
    // Intentional: audit log writes are best-effort
  }
}
