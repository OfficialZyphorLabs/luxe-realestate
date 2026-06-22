import type { Property } from '@/types'

interface PropertySpecsProps {
  property: Property
}

export function PropertySpecs({ property }: PropertySpecsProps) {
  const specs = [
    { icon: 'bed', label: 'Bedrooms', value: `${property.beds}` },
    { icon: 'bathtub', label: 'Bathrooms', value: `${property.baths}` },
    { icon: 'square_foot', label: 'Living Area', value: `${property.sqft.toLocaleString()} sqft` },
    ...(property.lotSize
      ? [{ icon: 'landscape', label: 'Lot Size', value: `${property.lotSize.toLocaleString()} sqft` }]
      : []),
    ...(property.yearBuilt
      ? [{ icon: 'calendar_today', label: 'Year Built', value: `${property.yearBuilt}` }]
      : []),
    ...(property.garage !== undefined
      ? [{ icon: 'garage', label: 'Garage', value: `${property.garage} Cars` }]
      : []),
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-1"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">{spec.icon}</span>
          <p className="font-body text-caption text-secondary uppercase tracking-widest">{spec.label}</p>
          <p className="font-display text-headline-md font-semibold text-on-surface">{spec.value}</p>
        </div>
      ))}
    </div>
  )
}
