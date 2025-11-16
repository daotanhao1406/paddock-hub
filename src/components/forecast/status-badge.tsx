// components/Badge.tsx
'use client'
import { Chip } from '@heroui/react'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

// Mở rộng props của shadcn/ui Badge
export interface BadgeProps {
  text: string | undefined | null
}

const badgeVariants = cva(
  // Base styles (ít dùng vì shadcn đã có)
  '',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        good: 'border-transparent bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-50',
        fair: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-800 dark:text-yellow-50',
        poor: 'border-transparent bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export default function StatusBadge({ text }: BadgeProps) {
  const safeText = text || 'Fair'
  let variant: VariantProps<typeof badgeVariants>['variant'] = 'fair'

  switch (safeText.toLowerCase()) {
    case 'good':
      variant = 'good'
      break
    case 'fair':
      variant = 'fair'
      break
    case 'poor':
      variant = 'poor'
      break
    default:
      variant = 'default'
  }

  return (
    <Chip size='sm' className={badgeVariants({ variant })}>
      {safeText}
    </Chip>
  )
}
