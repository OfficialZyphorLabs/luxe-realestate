'use client'

/**
 * UserMenu — avatar button with a dropdown (Profile, Sign out).
 * Sign-out uses NextAuth's client `signOut` and returns to /login.
 */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { MemberAvatar } from '@/components/dashboard/MemberAvatar'

interface UserMenuProps {
  name: string | null
  email: string
  avatarUrl: string | null
  profileHref: string
}

export function UserMenu({ name, email, avatarUrl, profileHref }: UserMenuProps) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-surface-container"
      >
        <MemberAvatar name={name} email={email} src={avatarUrl} size="sm" />
        <span className="hidden max-w-[8rem] truncate font-body text-label-md font-semibold text-on-surface sm:block">
          {name || email}
        </span>
        <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
          expand_more
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={reduce ? false : { opacity: 0, y: -8, scale: 0.97 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-surface-container-lowest py-1 shadow-[0_8px_40px_rgba(4,22,39,0.14),0_0_0_1px_rgba(4,22,39,0.07)]"
          >
            <div className="border-b border-outline-variant/20 px-4 py-3">
              <p className="truncate font-body text-label-md font-semibold text-on-surface">
                {name || 'Your account'}
              </p>
              <p className="truncate font-body text-caption text-secondary">{email}</p>
            </div>
            <Link
              href={profileHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 font-body text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
                person
              </span>
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-body-md text-error transition-colors hover:bg-error-container/40"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                logout
              </span>
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
