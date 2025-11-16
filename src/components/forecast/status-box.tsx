// components/StatusBox.tsx
'use client'
import { Card, CardBody, CardHeader } from '@heroui/react'
import React from 'react'

import { Headline, MetRowNormalized } from '@/lib/types'
import { fmt, isNum, mostRecentWith } from '@/lib/utils'

import StatusBadge from '@/components/forecast/status-badge'

interface StatusBoxProps {
  headline: Headline | undefined | null
  metRows: MetRowNormalized[]
  isLoading: boolean
}

export function StatusBox({ headline, metRows, isLoading }: StatusBoxProps) {
  if (isLoading) {
    return (
      <Card className='p-1'>
        <CardHeader>Farm status (today)</CardHeader>
        <CardBody>
          <p>Loading…</p>
        </CardBody>
      </Card>
    )
  }

  if (!headline) {
    return null
  }

  const f = headline
  let fPAR = f.fPAR || null,
    LAI = f.LAI || null
  if (!isNum(fPAR) || !isNum(LAI)) {
    const latest = mostRecentWith(['fPAR', 'LAI'], metRows)
    if (latest) {
      fPAR = isNum(fPAR) ? fPAR : latest.fPAR
      LAI = isNum(LAI) ? LAI : latest.LAI
    }
  }

  return (
    <Card className='p-1'>
      <CardHeader>Farm status (today)</CardHeader>
      <CardBody className='pt-0'>
        <div className='grid grid-cols-[auto_1fr] gap-y-1.5 gap-x-6'>
          <div>
            <b>Date</b>
          </div>
          <div>{f.date || '-'}</div>
          <div>
            <b>Growth today</b>
          </div>
          <div>
            <StatusBadge text={f.overall} />
          </div>
          <div>
            <b>Leaf cover (LAI)</b>
          </div>
          <div>{fmt(LAI, 2)}</div>
          <div>
            <b>Light capture (fPAR)</b>
          </div>
          <div>{fmt(fPAR, 2)}</div>
          <div>
            <b>Mean temp</b>
          </div>
          <div>{fmt(f.Tmean_C, 1)} °C</div>
          <div>
            <b>Air dryness</b>
          </div>
          <div>{fmt(f.VPD_kPa, 2)} kPa</div>
          <div>
            <b>Sunlight</b>
          </div>
          <div>{fmt(f.PAR_MJ_m2, 1)} MJ/m²</div>
          <div>
            <b>Rain</b>
          </div>
          <div>{fmt(f.Rain_mm, 1)} mm</div>
          <div>
            <b>Water loss</b>
          </div>
          <div>{fmt(f.ET0_mm, 1)} mm</div>
        </div>
      </CardBody>
    </Card>
  )
}
