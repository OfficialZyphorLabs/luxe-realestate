/** Terms of Service — static marketing page. */
import type { Metadata } from 'next'
import { LegalDocument } from '@/components/legal/LegalDocument'

export const metadata: Metadata = {
  title: 'Terms of Service — LuxeReal',
  description: 'The terms governing your use of the LuxeReal platform.',
}

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      intro="These terms govern your access to and use of the LuxeReal platform and services."
      updated="July 2026"
      sections={[
        {
          heading: '1. Acceptance of terms',
          body: [
            'By creating an account or using LuxeReal, you agree to be bound by these Terms of Service and our Privacy Policy. If you are using the service on behalf of an organization, you represent that you have authority to bind that organization.',
          ],
        },
        {
          heading: '2. Your account',
          body: [
            'You are responsible for safeguarding your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use. Organizations are responsible for the conduct of the members they invite.',
          ],
        },
        {
          heading: '3. Acceptable use',
          body: [
            'You agree not to misuse the service: no unlawful, infringing, or fraudulent listings; no attempts to disrupt or gain unauthorized access to the platform; and no use that violates fair housing or anti-discrimination laws.',
          ],
        },
        {
          heading: '4. Subscriptions and billing',
          body: [
            'Paid plans are billed in advance on a recurring basis through our payment processor. Plan limits apply as described at signup. You may cancel at any time; access continues through the end of the current billing period. Fees are non-refundable except where required by law.',
          ],
        },
        {
          heading: '5. Content ownership',
          body: [
            'You retain ownership of the listings, images, and other content you submit. You grant LuxeReal a limited license to host and display that content for the purpose of operating the service, including on your organization’s public catalog.',
          ],
        },
        {
          heading: '6. Termination',
          body: [
            'We may suspend or terminate access for violations of these terms. You may close your account at any time. Certain provisions survive termination, including ownership, disclaimers, and limitations of liability.',
          ],
        },
        {
          heading: '7. Disclaimers and liability',
          body: [
            'The service is provided “as is” without warranties of any kind. To the fullest extent permitted by law, LuxeReal is not liable for indirect or consequential damages arising from your use of the service.',
          ],
        },
        {
          heading: '8. Contact',
          body: ['Questions about these terms can be sent to legal@luxereal.com.'],
        },
      ]}
    />
  )
}
