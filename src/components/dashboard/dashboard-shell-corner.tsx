import { cn } from '@/lib/utils'

type DashboardShellCornerProps = {
  className?: string
}

/**
 * Concave fillet at the junction of sidebar (right edge) and header (bottom edge).
 * Transparent arc reveals the shell background; outer fill matches header/content.
 */
export function DashboardShellCorner({ className }: DashboardShellCornerProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute bottom-0 -left-6 z-10 size-6',
        'bg-[radial-gradient(circle_at_100%_0,transparent_22px,#fafafa_22px)]',
        'dark:bg-[radial-gradient(circle_at_100%_0,transparent_22px,#09090b_22px)]',
        className,
      )}
    />
  )
}
