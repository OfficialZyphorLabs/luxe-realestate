import { Reveal } from '@/components/ui/Reveal'

const PILLARS = [
  {
    icon: 'verified_user',
    title: 'Uncompromising Integrity',
    description:
      "Every transaction is built on trust, transparency, and decades of earned reputation among the world's most discerning clients.",
  },
  {
    icon: 'insights',
    title: 'Market Expertise',
    description:
      'Deep local knowledge combined with global market intelligence. We price, position, and negotiate with precision.',
  },
  {
    icon: 'concierge',
    title: 'Premium Service',
    description:
      'White-glove concierge support from first showing to final key — and long after. You are never just a transaction.',
  },
]

export function ValuePillars() {
  return (
    <section className="bg-surface-container-low py-stack-lg">
      <div className="page-container">
        <Reveal>
          <div className="text-center mb-12">
            <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary-container">
              Why LuxeReal
            </span>
            <h2 className="font-display text-headline-lg font-semibold text-primary mt-2">
              The LuxeReal Distinction
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.1}>
              <div className="bg-surface-container-lowest rounded-2xl p-8 flex flex-col items-start gap-4 hover:-translate-y-2 transition-standard group h-full">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-on-tertiary-fixed">
                  {pillar.icon}
                </span>
              </div>
              <h3 className="font-display text-headline-md font-semibold text-primary">
                {pillar.title}
              </h3>
              <p className="font-body text-body-md text-secondary leading-relaxed">
                {pillar.description}
              </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
