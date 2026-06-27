import { Reveal } from '@/components/ui/Reveal'

const OFFICES = [
  { city: 'New York', country: 'USA', address: '742 Madison Avenue, 4th Floor' },
  { city: 'London', country: 'UK', address: '25 Mayfair Square, Piccadilly' },
  { city: 'Dubai', country: 'UAE', address: 'DIFC Gate District, Level 12' },
  { city: 'Tokyo', country: 'Japan', address: 'Minato-ku, Roppongi Hills' },
  { city: 'Sydney', country: 'Australia', address: 'Level 40, Aurora Place' },
  { city: 'Paris', country: 'France', address: '24 Avenue Montaigne, 8e' },
]

export function GlobalReach() {
  return (
    <section className="bg-primary py-stack-lg">
      <div className="page-container">
        <Reveal>
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left: Text + offices */}
          <div className="flex-1">
            <span className="font-body text-label-md font-semibold uppercase tracking-widest text-on-primary/60">
              Our Presence
            </span>
            <h2 className="font-display text-headline-lg font-semibold text-on-primary mt-2 mb-4">
              Global Reach, Local Depth
            </h2>
            <p className="font-body text-body-md text-on-primary/70 mb-8 max-w-md">
              With offices on four continents, we connect ultra-high-net-worth investors from New York
              to Dubai. Our network spans the world&rsquo;s most exclusive markets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OFFICES.map((office) => (
                <div key={office.city} className="bg-primary-container/50 rounded-xl p-4">
                  <p className="font-display text-headline-md font-semibold text-on-primary">
                    {office.city}
                  </p>
                  <p className="font-body text-caption text-on-primary-container uppercase tracking-widest mt-0.5">
                    {office.country}
                  </p>
                  <p className="font-body text-body-md text-on-primary/60 mt-1 text-sm">
                    {office.address}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats */}
          <div className="lg:w-80 flex flex-col gap-6">
            <div className="bg-primary-container rounded-2xl p-8 text-center">
              <p className="font-display text-display-lg font-bold text-on-primary">30+</p>
              <p className="font-body text-body-md text-on-primary/70 mt-1">Years of Excellence</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-container rounded-2xl p-6 text-center">
                <p className="font-display text-headline-lg font-semibold text-on-primary">$4B+</p>
                <p className="font-body text-caption text-on-primary/60 mt-1">In Sales</p>
              </div>
              <div className="bg-primary-container rounded-2xl p-6 text-center">
                <p className="font-display text-headline-lg font-semibold text-on-primary">200+</p>
                <p className="font-body text-caption text-on-primary/60 mt-1">Active Listings</p>
              </div>
            </div>
            <div className="bg-primary-container rounded-2xl p-6 text-center">
              <p className="font-display text-headline-lg font-semibold text-on-primary">6</p>
              <p className="font-body text-caption text-on-primary/60 mt-1">Global Offices</p>
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
