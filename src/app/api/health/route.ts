/**
 * route.ts — GET /api/health
 *
 * Lightweight uptime/health probe for monitoring. Always returns 200 when the
 * app process is serving requests; reports database reachability as a field
 * rather than failing the endpoint, so a DB blip doesn't trip a bare 200 check
 * while still surfacing degradation to a smarter monitor. force-dynamic so it's
 * never statically cached.
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  let database: 'up' | 'down' = 'down'
  try {
    await prisma.$queryRaw`SELECT 1`
    database = 'up'
  } catch {
    database = 'down'
  }

  return NextResponse.json({
    status: 'ok',
    database,
    uptime: Math.round(process.uptime()),
  })
}
