'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const PaddockCreator = dynamic(
  () =>
    import('@/components/paddock-creator').then((mod) => mod.PaddockCreator),
  {
    ssr: false,
    loading: () => <p className='text-center p-10'>Loading map...</p>,
  },
)

export default function PaddockCreatorPage() {
  return (
    <main className='container mx-auto max-w-5xl p-4 md:p-6'>
      <h1 className='text-3xl font-bold tracking-tight'>Paddock Creator</h1>
      <p className='text-muted-foreground'>
        Draw your paddocks, label them, download the GeoJSON, and (optionally)
        email us a copy. We’ll also save it securely on our side.
      </p>

      <Suspense fallback={<p>Loading component...</p>}>
        <PaddockCreator />
      </Suspense>
    </main>
  )
}
