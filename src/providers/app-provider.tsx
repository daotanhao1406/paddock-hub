'use client'

import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

declare module '@react-types/shared' {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>['push']>[1]
    >
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  return (
    <HeroUIProvider locale='en-GB' navigate={router.push}>
      <ToastProvider placement='top-center' />
      {children}
    </HeroUIProvider>
  )
}
