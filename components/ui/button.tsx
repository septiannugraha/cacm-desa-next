'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useLayout } from '@/components/layouts/LayoutContext'
import { themes, ThemeKey } from '@/lib/themes'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        destructive: '',
        success: '',
        warning: '',
        info: '',
        outline: '',
        ghost: '',
        subtle: '',
        link: '',
        elevated: '',
        glass: '',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const { theme } = useLayout()
    const activeTheme = themes[theme as ThemeKey]
    const safeVariant = variant ?? 'default'

    const variantColorMap: Record<string, string> = {
      default: activeTheme.primary,
      secondary: activeTheme.secondary,
      destructive: activeTheme.destructive,
      success: activeTheme.success,
      warning: activeTheme.warning,
      info: activeTheme.info,
      outline: activeTheme.outline,
      ghost: activeTheme.ghost,
      subtle: activeTheme.subtle,
      link: activeTheme.link,
      elevated: activeTheme.elevated,
      glass: activeTheme.glass,
    }

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant: safeVariant, size }),
          variantColorMap[safeVariant],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }