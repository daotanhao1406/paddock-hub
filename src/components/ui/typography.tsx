'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import React, { useMemo } from 'react'

import { cn } from '@/lib/utils'

// get type of sizes from TypographyVariants

export type TypographySize = VariantProps<typeof textBaseVariants>['size']
export type TypographyType = VariantProps<typeof textBaseVariants>['type']

const textBaseVariants = cva('', {
  variants: {
    size: {
      xxs: 'text-[8px] sm:text-[10px] lg:text-[10px]',
      xs: 'text-[10px] sm:text-xs lg:text-xs',
      sm: 'text-xs sm:text-sm lg:text-sm',
      md: 'text-sm sm:text-base lg:text-base',
      default: 'text-sm sm:text-base lg:text-base',
      lg: 'text-base sm:text-lg lg:text-lg',
      xl: 'text-lg sm:text-xl lg:text-2xl',
      xxl: 'text-xl sm:text-2xl lg:text-3xl',
      xll: 'text-2xl sm:text-3xl lg:text-4xl',
      xxxl: 'text-3xl sm:text-4xl lg:text-5xl',
      xxxxl: 'text-3xl sm:text-5xl lg:text-7xl',
    },
    type: {
      default: '',
      primary: 'text-primary-600',
      secondary: 'text-secondary-300',
      success: 'text-success-600',
      danger: 'text-danger-600',
      warning: 'text-warning-600',
    },
  },

  defaultVariants: {
    size: 'default',
    type: 'default',
  },
})

type TypographyElement =
  | 'span'
  | 'p'
  | 'blockquote'
  | 'code'
  | 'strong'
  | 'em'
  | 'sup'
  | 'sub'
  | 'small'
  | 'mark'
  | 'del'
  | 'ins'

interface TypographyProps
  extends VariantProps<typeof textBaseVariants>,
    React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  fallbackColor?: string
  transitionDuration?: number
  variant?: TypographyElement
}

export default function Typography({
  children,
  size,
  type,
  className,
  variant = 'span',
  ...rest
}: TypographyProps) {
  const textClassName = useMemo(
    () => cn(textBaseVariants({ size, type }), className),
    [size, type, className],
  )

  return React.createElement(
    variant,
    { className: textClassName, ...rest },
    children,
  )
}
