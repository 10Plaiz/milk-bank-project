import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  onClick?: () => void
}

interface PageHeaderProps {
  crumbs: Crumb[]
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ crumbs, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-7">
      <nav className="flex items-center gap-1 mb-2.5" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-[#D1D5DB]" />}
            {crumb.onClick ? (
              <button
                onClick={crumb.onClick}
                className="text-[11px] text-[#9CA3AF] hover:text-[#7C5CFC] transition-colors"
                style={{ fontFamily: 'var(--font-family-mono)' }}
              >
                {crumb.label}
              </button>
            ) : (
              <span
                className="text-[11px] text-[#9CA3AF]"
                style={{ fontFamily: 'var(--font-family-mono)' }}
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl text-[#1A1A1A]"
            style={{ fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-[#6B7280] leading-relaxed">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
