import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight transition-all duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright ' +
  'disabled:cursor-not-allowed disabled:opacity-55 select-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-void hover:bg-brand-bright shadow-[0_10px_30px_-14px_rgb(34_197_94_/_0.85)] hover:shadow-[0_14px_34px_-12px_rgb(34_197_94_/_0.95)]',
  secondary: 'bg-brand/12 text-mint border border-brand/35 hover:bg-brand/20 hover:border-brand/60',
  outline: 'border border-line-strong text-ink hover:border-mint/50 hover:text-mint bg-transparent',
  ghost: 'text-muted hover:text-ink hover:bg-white/5',
  danger: 'bg-rose/12 text-rose border border-rose/40 hover:bg-rose/20',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  trailing?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
      {trailing}
    </button>
  )
}

export interface ButtonLinkProps {
  to?: string
  href?: string
  variant?: Variant
  size?: Size
  icon?: ReactNode
  trailing?: ReactNode
  className?: string
  children: ReactNode
  target?: string
  rel?: string
  onClick?: () => void
  'aria-label'?: string
}

/** Same visual language as <Button>, but renders a router link or anchor. */
export function ButtonLink({
  to,
  href,
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  className,
  children,
  target,
  rel,
  onClick,
  ...aria
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...aria}>
        {icon}
        {children}
        {trailing}
      </Link>
    )
  }

  return (
    <a
      href={href ?? '#'}
      className={classes}
      target={target}
      rel={target === '_blank' ? (rel ?? 'noopener noreferrer') : rel}
      onClick={onClick}
      {...aria}
    >
      {icon}
      {children}
      {trailing}
    </a>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  )
}
