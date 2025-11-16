'use client'
import { Card } from '@heroui/react'
import Image from 'next/image'
import { useMemo } from 'react'

import Typography from '@/components/ui/typography'

import { usePaddockBuilderStore } from '@/store/use-paddock-builder-store'

export default function LegendOverlay() {
  const { overlay } = usePaddockBuilderStore()
  const legendImgUrl = useMemo(() => {
    switch (overlay.activeMetric) {
      case 'BIOMASS_T_HA':
        return '/images/legends/legend_biomass.png'
      case 'N_UPTAKE_KG_HA':
        return '/images/legends/legend_n.png'
      case 'NDVI':
        return '/images/legends/legend_ndvi.png'
      case 'VEG_WATER_PCT':
        return '/images/legends/legend_vwc.png'
      case 'CRUDE_PROTEIN_PCT':
        return '/images/legends/legend_cp.png'
      default:
        return '/images/legends/legend_biomass.png'
    }
  }, [overlay])

  const legendTitle = useMemo(() => {
    switch (overlay.activeMetric) {
      case 'BIOMASS_T_HA':
        return 'Biomass (t/ha)'
      case 'N_UPTAKE_KG_HA':
        return 'Nitrogen (kg/ha)'
      case 'NDVI':
        return 'NDVI'
      case 'VEG_WATER_PCT':
        return 'Veg Water (%)'
      case 'CRUDE_PROTEIN_PCT':
        return 'Crude Protein (%)'
      default:
        return null
    }
  }, [overlay])

  if (!overlay.activeMetric) return null
  return (
    <Card className='absolute top-4 right-4 z-[49] p-3.5 flex flex-col'>
      <Typography size='sm' className='font-semibold'>
        {legendTitle}
      </Typography>

      <Image alt='Legend image' src={legendImgUrl} height={200} width={100} />
    </Card>
  )
}
