import Link from 'next/link'

/**
 * Reusable Button component
 * variant: 'primary' | 'secondary' | 'outline' | 'outline-white'
 * size: 'sm' | 'md' | 'lg'
 * as: 'button' | 'link' (uses Next Link if href provided)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  ...props
}) {
  const base = `btn-${variant}${size === 'sm' ? ' btn-sm' : size === 'lg' ? ' btn-lg' : ''} ${className}`

  if (href) {
    return (
      <Link href={href} className={base} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={base} {...props}>
      {children}
    </button>
  )
}
