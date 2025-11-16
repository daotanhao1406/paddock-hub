'use client'

import { Badge, Button } from '@heroui/react'
import { Download, LineChart, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

import { usePaddockBuilderStore } from '@/store/use-paddock-builder-store'

export function BuilderToolbar() {
  const { loadPaddocks, savePaddocks, paddocks, isLoading } =
    usePaddockBuilderStore()
  const paddockCount = paddocks.features.length

  const handleSave = () => {
    // Lưu ý: `savePaddocks` cần được cập nhật để lấy features từ
    // instance của `react-leaflet-draw` thay vì từ store.
    // Tạm thời, ta giả định nó lưu state của store.
    savePaddocks(paddocks.features).then(() => {
      // toast.success('Paddocks saved', { position: 'top-center' })
    })
  }

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-lg border p-4'>
      {/* Tên Paddock mới (từ file HTML) */}
      {/* <div className="flex flex-col">
        <Label htmlFor="paddockName" className="text-muted-foreground">New Paddock Name</Label>
        <Input id="paddockName" placeholder="e.g., Paddock 1A" className="w-[200px]" />
        <span className="text-xs text-muted-foreground">Tip: double-click a paddock to rename it.</span>
      </div> */}
      {/* (Đã chuyển logic Tên Paddock vào MapDisplay/Dialog) */}

      <Button
        variant='outline'
        onClick={loadPaddocks}
        disabled={isLoading.paddocks}
      >
        {isLoading.paddocks ? (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <Download className='mr-2 h-4 w-4' />
        )}
        Load Paddocks
      </Button>

      <Button onClick={handleSave} disabled={isLoading.saving}>
        {isLoading.saving ? (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <Save className='mr-2 h-4 w-4' />
        )}
        Save Paddocks
        <Badge variant='secondary' className='ml-2'>
          {paddockCount}
        </Badge>
      </Button>

      <div className='flex-grow' />

      <Button asChild variant='secondary'>
        <Link href='/paddock/forecast'>
          <LineChart className='mr-2 h-4 w-4' />
          Forecasts
        </Link>
      </Button>
    </div>
  )
}
