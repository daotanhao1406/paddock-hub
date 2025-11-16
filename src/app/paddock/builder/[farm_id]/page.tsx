'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { Suspense } from 'react'

// 1. Tải PaddockBuilder bằng dynamic import
const PaddockBuilder = dynamic(
  () =>
    import('@/components/paddock-builder').then((mod) => mod.PaddockBuilder),
  {
    ssr: false, // <-- RẤT QUAN TRỌNG
    loading: () => <p className='text-center p-10'>Loading Builder...</p>,
  },
)

export default function PaddockBuilderPage() {
  const params = useParams()
  const farmId = Array.isArray(params.farm_id)
    ? params.farm_id[0]
    : params.farm_id

  if (!farmId) {
    return <p>Missing Farm ID.</p>
  }

  return (
    <main className='container mx-auto p-4'>
      {/* 2. Dùng Suspense (mặc dù dynamic đã có loading) */}
      <Suspense fallback={<p>Loading...</p>}>
        <PaddockBuilder farmId={farmId} />
      </Suspense>
    </main>
  )
}
