'use client'

import { MapDisplay } from '@/components/paddock-creator/map-display'
import { Step1Details } from '@/components/paddock-creator/step-1-details'
import { Step2FindFarm } from '@/components/paddock-creator/step-2-find-farm'
import { Step3Draw } from '@/components/paddock-creator/step-3-draw'
import { Step4Save } from '@/components/paddock-creator/step-4-save'

export function PaddockCreator() {
  return (
    <div className='flex flex-col gap-4 mt-6'>
      <Step1Details />
      <Step2FindFarm />
      <Step3Draw mapComponent={<MapDisplay />} />

      <Step4Save />
    </div>
  )
}
