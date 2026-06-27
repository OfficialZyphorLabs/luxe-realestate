import Image from 'next/image'
import { AgentGrid } from '@/components/about/AgentGrid'
import { GlobalReach } from '@/components/about/GlobalReach'
import { Reveal } from '@/components/ui/Reveal'

const CORE_VALUES = [
  {
    icon: 'handshake',
    title: 'Integrity',
    description:
      'Every recommendation, every negotiation, every relationship is guided by uncompromising honesty and ethical practice.',
  },
  {
    icon: 'lock',
    title: 'Discretion',
    description:
      'Your privacy is paramount. We treat every transaction with the confidentiality expected by our clientele.',
  },
  {
    icon: 'star',
    title: 'Excellence',
    description:
      'We hold ourselves to the highest standard — in properties we represent, in advice we give, and in service we deliver.',
  },
]

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen">
      {/* Our Story */}
      <section className="py-stack-lg">
        <div className="page-container">
          <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text */}
            <div className="lg:col-span-5">
              <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary-container">
                Since 1994
              </span>
              <h1 className="font-display text-display-lg font-bold text-primary mt-3 leading-tight">
                Defining the Standards of Modern Luxury.
              </h1>
              <p className="font-body text-body-lg text-secondary mt-6 leading-relaxed">
                For three decades, LuxeReal has stood at the intersection of architectural
                excellence and human aspiration. We were founded on a simple belief: that the most
                remarkable homes deserve the most dedicated representation.
              </p>
              <p className="font-body text-body-md text-secondary mt-4 leading-relaxed">
                From our first listing in Beverly Hills to our current portfolio spanning six
                continents, we have guided thousands of discerning buyers and sellers through the
                most significant transactions of their lives — with the care and precision each
                deserves.
              </p>

              {/* Stat card */}
              <div className="mt-8 bg-surface-container-low rounded-2xl p-6 inline-flex gap-8">
                <div>
                  <p className="font-display text-headline-lg font-semibold text-primary">30+</p>
                  <p className="font-body text-body-md text-secondary">Years</p>
                </div>
                <div className="w-px bg-outline-variant/30" />
                <div>
                  <p className="font-display text-headline-lg font-semibold text-primary">$4B+</p>
                  <p className="font-body text-body-md text-secondary">In Sales</p>
                </div>
                <div className="w-px bg-outline-variant/30" />
                <div>
                  <p className="font-display text-headline-lg font-semibold text-primary">2K+</p>
                  <p className="font-body text-body-md text-secondary">Clients</p>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="lg:col-span-7 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80"
                alt="Luxurious interior — LuxeReal story"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-surface-container-low py-stack-lg">
        <div className="page-container">
          <Reveal>
          <div className="text-center mb-12">
            <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary-container">
              What We Stand For
            </span>
            <h2 className="font-display text-headline-lg font-semibold text-primary mt-2">
              Our Core Values
            </h2>
            <p className="font-body text-body-md text-secondary mt-3 max-w-md mx-auto">
              The principles that guide every decision we make and every relationship we build.
            </p>
          </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_VALUES.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.1}>
                <div className="bg-surface-container-lowest rounded-2xl p-8 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-standard h-full">
                  <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px] text-on-tertiary-fixed">
                      {value.icon}
                    </span>
                  </div>
                  <h3 className="font-display text-headline-md font-semibold text-primary">
                    {value.title}
                  </h3>
                  <p className="font-body text-body-md text-secondary leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Agent grid */}
      <AgentGrid />

      {/* Global Reach */}
      <GlobalReach />
    </div>
  )
}
