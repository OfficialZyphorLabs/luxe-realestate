/** Privacy Policy — static marketing page. */
import type { Metadata } from 'next'
import { LegalDocument } from '@/components/legal/LegalDocument'

export const metadata: Metadata = {
  title: 'Privacy Policy — LuxeReal',
  description: 'How LuxeReal collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      intro="This policy explains what data we collect, how we use it, and the choices you have."
      updated="July 2026"
      sections={[
        {
          heading: 'Information we collect',
          body: [
            'Account data you provide (name, email, organization details). Content you create (listings, images, inquiries). Usage and device data collected automatically to operate and secure the service. Payment data is handled by our payment processor; we do not store full card numbers.',
          ],
        },
        {
          heading: 'How we use information',
          body: [
            'To provide and improve the service, process transactions, send transactional email (invitations, lead notifications, password resets), enforce plan limits, prevent abuse, and comply with legal obligations.',
          ],
        },
        {
          heading: 'How we share information',
          body: [
            'We share data with service providers who help us run the platform (hosting, email delivery, payments, error monitoring) under contractual safeguards. We do not sell your personal information. Public listings you publish are, by design, visible to anyone with the link.',
          ],
        },
        {
          heading: 'Data retention',
          body: [
            'We retain data for as long as your account is active and as needed to provide the service, then delete or anonymize it unless a longer period is required by law.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'Depending on your jurisdiction (including the GDPR and CCPA), you may have rights to access, correct, export, or delete your personal data. To exercise these rights, contact privacy@luxereal.com.',
          ],
        },
        {
          heading: 'Security',
          body: [
            'We use industry-standard measures including encryption in transit, hashed credentials, role-based access controls, and tenant isolation. No method of transmission or storage is perfectly secure, but we work to protect your data.',
          ],
        },
        {
          heading: 'Contact',
          body: ['Privacy questions can be sent to privacy@luxereal.com.'],
        },
      ]}
    />
  )
}
