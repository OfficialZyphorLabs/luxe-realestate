'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PropertyGalleryProps {
  images: string[]
  title: string
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const mainImage = images[0] ?? '/images/placeholder.jpg'
  const secondaryImages = images.slice(1, 3)

  return (
    <div className="grid grid-cols-12 gap-3 h-[480px] lg:h-[560px] overflow-hidden rounded-2xl">
      {/* Main large image */}
      <div className="col-span-12 lg:col-span-8 relative group overflow-hidden rounded-xl">
        <Image
          src={mainImage}
          alt={`${title} — main view`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        <div className="absolute bottom-4 left-4">
          <button className="flex items-center gap-2 bg-primary/80 backdrop-blur-sm text-white px-4 py-2 rounded-full font-body text-label-md hover:bg-primary transition-standard">
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            {images.length} Photos
          </button>
        </div>
      </div>

      {/* Secondary images */}
      <div className="hidden lg:flex lg:col-span-4 flex-col gap-3">
        {secondaryImages.map((img, i) => (
          <div
            key={i}
            className={cn(
              'relative flex-1 group overflow-hidden rounded-xl cursor-pointer',
              activeIndex === i && 'ring-2 ring-primary'
            )}
            onClick={() => setActiveIndex(activeIndex === i ? null : i)}
          >
            <Image
              src={img}
              alt={`${title} — view ${i + 2}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="33vw"
            />
            {i === secondaryImages.length - 1 && images.length > 3 && (
              <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="font-body text-on-primary font-semibold text-label-md">
                  +{images.length - 3} More
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
