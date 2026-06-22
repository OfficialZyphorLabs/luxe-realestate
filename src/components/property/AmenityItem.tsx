interface AmenityItemProps {
  icon: string
  label: string
}

export function AmenityItem({ icon, label }: AmenityItemProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[18px] text-on-tertiary-fixed">{icon}</span>
      </div>
      <span className="font-body text-body-md text-on-surface">{label}</span>
    </div>
  )
}
