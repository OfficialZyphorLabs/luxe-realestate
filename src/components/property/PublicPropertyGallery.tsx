'use client'

/**
 * PublicPropertyGallery — main image + thumbnail strip for a public listing.
 * Clicking a thumbnail swaps the main image. Falls back to a placeholder when
 * the listing has no photos. Client component (needs selection state).
 */
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function PublicPropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-surface-container md:h-[420px]">
        <span className="material-symbols-outlined text-[40px] text-secondary" aria-hidden="true">
          image
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-72 overflow-hidden rounded-2xl bg-surface-container md:h-[460px]">
        <Image
          src={images[active]}
          alt={`${title} — photo ${active + 1}`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === active}
              className={cn(
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container transition-all',
                i === active ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
