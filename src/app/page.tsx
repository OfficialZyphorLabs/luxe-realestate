import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedListings } from '@/components/home/FeaturedListings'
import { ValuePillars } from '@/components/home/ValuePillars'
import { TestimonialSection } from '@/components/home/TestimonialSection'
import { CTABanner } from '@/components/home/CTABanner'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedListings />
      <ValuePillars />
      <TestimonialSection />
      <CTABanner />
    </>
  )
}
