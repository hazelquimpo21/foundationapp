/**
 * 🎴 CARD COMPONENT
 * =================
 * Container component with consistent styling.
 *
 * Usage:
 *   <Card>Content here</Card>
 *   <Card variant="outlined" padding="lg">More content</Card>
 */

'use client'

import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: 'default' | 'outlined' | 'elevated'
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Whether the card is interactive (adds hover effects) */
  interactive?: boolean
}

export function Card({
  className,
  variant = 'default',
  padding = 'md',
  interactive = false,
  children,
  ...props
}: CardProps) {
  // Base styles
  const baseStyles = 'rounded-xl'

  // Variant styles
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-transparent border-2 border-gray-300',
    elevated: 'bg-white shadow-lg shadow-gray-200/50',
  }

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  }

  // Interactive styles
  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-300 active:scale-[0.99]'
    : ''

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        interactiveStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card Header
 */
export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-4 pb-4 border-b border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card Title
 */
export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

/**
 * Card Description
 */
export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-gray-500 mt-1', className)} {...props}>
      {children}
    </p>
  )
}

/**
 * Card Content
 */
export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Footer
 */
export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-gray-100 flex gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}
