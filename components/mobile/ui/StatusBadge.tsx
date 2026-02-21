export default function StatusBadge({
    label,
    variant = 'neutral',
  }: {
    label: string
    variant?: 'success' | 'warning' | 'danger' | 'neutral'
  }) {
    const cls =
      variant === 'success'
        ? 'bg-emerald-100 text-emerald-800'
        : variant === 'warning'
        ? 'bg-amber-100 text-amber-800'
        : variant === 'danger'
        ? 'bg-red-100 text-red-800'
        : 'bg-slate-200 text-slate-800'
  
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>
  }
  