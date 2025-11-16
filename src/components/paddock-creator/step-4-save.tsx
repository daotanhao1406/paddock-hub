'use client'

import { addToast, Button, Card, CardBody, CardHeader } from '@heroui/react'
import { useState } from 'react'

import { download } from '@/lib/utils'
import { useMailtoFallback } from '@/hooks/use-mailto-fallback'

import { usePaddockStore } from '@/store/use-paddock-store'

export function Step4Save() {
  const [isSaving, setIsSaving] = useState(false)
  const { getFeatureCollection, farmDetails, paddocks } = usePaddockStore()
  const { triggerMailtoFallback, FallbackComponent } = useMailtoFallback()

  const handleSave = async () => {
    // 1. Validation
    if (!farmDetails.farmName) {
      addToast({
        title: 'Missing Farm Name',
        description: 'Please enter a farm name in Step 1.',
        color: 'warning',
      })
      return
    }
    if (paddocks.length === 0) {
      addToast({
        title: 'No Paddocks Drawn',
        description: 'Please draw at least one paddock in Step 3.',
        color: 'danger',
      })
      return
    }

    setIsSaving(true)
    const fc = getFeatureCollection()
    const text = JSON.stringify(fc, null, 2)

    // 2. Download
    try {
      download('paddocks.geojson', text)

      addToast({
        title: 'Downloaded',
        description: 'paddocks.geojson has been saved to your computer.',
        color: 'success',
      })
    } catch {
      addToast({
        title: 'Download Failed',
        color: 'danger',
      })
      setIsSaving(false)
      return
    }

    // 3. Cloud Save (via API)
    try {
      addToast({ title: 'Saving to cloud...' })
      const cloudRes = await fetch('/api/save-paddocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_name: farmDetails.farmName,
          geojson_text: text,
        }),
      })
      if (!cloudRes.ok) throw new Error('Cloud save failed')
      addToast({
        title: '☁️ Saved to Cloud',
        description: 'Your paddocks are saved securely.',
        color: 'success',
      })
    } catch {
      addToast({
        title: 'Cloud Save Failed',
        description: 'Could not save to cloud.',
        color: 'danger',
      })
      // Tiếp tục gửi email dù lưu cloud thất bại
    }

    // 4. Email (via API)
    try {
      addToast({ title: 'Sending email...' })
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: {
            farm_name: farmDetails.farmName,
            farm_type: farmDetails.farmType,
            farmer_name: farmDetails.farmerName,
            farmer_email: farmDetails.farmerEmail,
            created_at: new Date().toISOString(),
          },
          geojson_text: text,
        }),
      })

      if (!emailRes.ok) throw new Error('Email send failed')

      addToast({
        title: '📬 Email Sent',
        description: 'A copy has been sent to info@aigorithm.com.au.',
        color: 'success',
      })
    } catch {
      // Thất bại -> Kích hoạt mailto fallback
      triggerMailtoFallback({
        farm_name: farmDetails.farmName,
        farm_type: farmDetails.farmType,
        farmer_name: farmDetails.farmerName,
        farmer_email: farmDetails.farmerEmail,
      })
    }

    setIsSaving(false)
  }

  return (
    <Card className='p-3'>
      <CardHeader className='font-semibold'>4. Save & Email</CardHeader>
      <CardBody>
        <div className='mb-4'>
          {' '}
          We'll download a .geojson for you. We'll also try to email a copy to{' '}
          <strong>info@aigorithm.com.au</strong> and save it securely on your
          side
        </div>
        <Button
          onPress={handleSave}
          color='primary'
          disabled={isSaving}
          size='lg'
        >
          {isSaving ? 'Saving...' : '💾 Save Paddocks & Try to Email'}
        </Button>
        {/* Đây là nơi Modal dự phòng sẽ render khi cần */}
        {FallbackComponent}
      </CardBody>
    </Card>
  )
}
