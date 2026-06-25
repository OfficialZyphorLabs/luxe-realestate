import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set — add it to .env.local before seeding')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...\n')

  // ── SuperAdmin ─────────────────────────────────────────────
  const superAdminHash = await bcrypt.hash('SuperAdmin@123!', 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@luxereal.com' },
    update: {},
    create: {
      email: 'admin@luxereal.com',
      name: 'Super Admin',
      passwordHash: superAdminHash,
      isSuperAdmin: true,
      emailVerified: new Date(),
    },
  })
  console.log(`✓ SuperAdmin: ${superAdmin.email}`)

  // ── Test organization ──────────────────────────────────────
  const testOrg = await prisma.organization.upsert({
    where: { slug: 'acme-realty' },
    update: {},
    create: {
      slug: 'acme-realty',
      name: 'Acme Realty',
      plan: 'STARTER',
      status: 'ACTIVE',
      settings: {
        create: { allowPublicListings: true },
      },
    },
  })
  console.log(`✓ Org: ${testOrg.name} (slug: ${testOrg.slug})`)

  // ── Org Admin ──────────────────────────────────────────────
  const orgAdminHash = await bcrypt.hash('OrgAdmin@123!', 12)
  const orgAdmin = await prisma.user.upsert({
    where: { email: 'orgadmin@acmerealty.com' },
    update: {},
    create: {
      email: 'orgadmin@acmerealty.com',
      name: 'Marcus Reeves',
      passwordHash: orgAdminHash,
      emailVerified: new Date(),
    },
  })
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: orgAdmin.id, organizationId: testOrg.id } },
    update: {},
    create: { userId: orgAdmin.id, organizationId: testOrg.id, role: 'ADMIN' },
  })
  console.log(`✓ Org Admin: ${orgAdmin.email}`)

  // ── Test Member ────────────────────────────────────────────
  const memberHash = await bcrypt.hash('Member@123!', 12)
  const member = await prisma.user.upsert({
    where: { email: 'agent@acmerealty.com' },
    update: {},
    create: {
      email: 'agent@acmerealty.com',
      name: 'Emily Chen',
      passwordHash: memberHash,
      emailVerified: new Date(),
    },
  })
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: member.id, organizationId: testOrg.id } },
    update: {},
    create: { userId: member.id, organizationId: testOrg.id, role: 'MEMBER' },
  })
  console.log(`✓ Member: ${member.email}`)

  // ── Trial subscription ─────────────────────────────────────
  await prisma.subscription.upsert({
    where: { organizationId: testOrg.id },
    update: {},
    create: {
      organizationId: testOrg.id,
      stripeCustomerId: `cus_seed_${testOrg.id}`,
      plan: 'STARTER',
      status: 'TRIALING',
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  })
  console.log('✓ Trial subscription (14-day)\n')

  console.log('Database seeded successfully!')
  console.log('')
  console.log('Test credentials:')
  console.log('  SuperAdmin:   admin@luxereal.com          / SuperAdmin@123!')
  console.log('  Org Admin:    orgadmin@acmerealty.com     / OrgAdmin@123!')
  console.log('  Agent/Member: agent@acmerealty.com        / Member@123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
