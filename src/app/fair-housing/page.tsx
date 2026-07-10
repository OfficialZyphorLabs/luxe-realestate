/** Fair Housing statement — static marketing page (important for real estate). */
import type { Metadata } from 'next'
import { LegalDocument } from '@/components/legal/LegalDocument'

export const metadata: Metadata = {
  title: 'Fair Housing — LuxeReal',
  description: 'LuxeReal’s commitment to fair housing and equal opportunity.',
}

export default function FairHousingPage() {
  return (
    <LegalDocument
      title="Fair Housing Commitment"
      intro="LuxeReal is committed to equal opportunity in housing and to the principles of the Fair Housing Act."
      updated="July 2026"
      sections={[
        {
          heading: 'Equal Housing Opportunity',
          body: [
            'LuxeReal supports the letter and spirit of fair housing laws. We do not permit listings, marketing, or lead handling that discriminate on the basis of race, color, religion, sex, disability, familial status, national origin, or any other class protected by applicable federal, state, or local law.',
          ],
        },
        {
          heading: 'Expectations of organizations and agents',
          body: [
            'Organizations and agents using LuxeReal must comply with all applicable fair housing and anti-discrimination laws. Listing descriptions, imagery, and communications must not express — directly or indirectly — any preference, limitation, or discrimination based on a protected class.',
          ],
        },
        {
          heading: 'Reporting a concern',
          body: [
            'If you believe a listing or interaction on the platform violates fair housing principles, contact us at trust@luxereal.com. We review reports and may remove content or suspend accounts that violate these standards.',
          ],
        },
        {
          heading: 'Accessibility',
          body: [
            'We strive to make LuxeReal usable by everyone, including people who rely on assistive technologies, and we welcome feedback on how to improve accessibility.',
          ],
        },
      ]}
    />
  )
}
