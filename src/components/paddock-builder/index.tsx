'use client'

import { Chip } from '@heroui/react'
import { ChartLine, NotepadText, ThermometerSun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { FeedPlanner } from '@/components/paddock-builder/feed-planner'
import { MapDisplay } from '@/components/paddock-builder/map-display'
import { TrendsChart } from '@/components/paddock-builder/trends-chart'
import CardNav, { CardNavItem } from '@/components/ui/card-nav'

import { usePaddockBuilderStore } from '@/store/use-paddock-builder-store'

import PaddockForecastPage from '@/app/paddock/forecast/page'

type PaddockBuilderProps = {
  farmId: string
}

const builderCardItems: CardNavItem[] = [
  {
    id: 'planner',
    label: 'Feed Planner',
    imageUrl: '/images/feed.jpg',
    textColor: '#fff',
    description: 'Calculate feed budgets & graze status.',
  },
  {
    id: 'trends',
    label: 'Paddock Trends',
    imageUrl: '/images/trend.jpg',
    textColor: '#fff',
    description: 'Track biomass & nitrogen levels over time.',
  },
  {
    id: 'forecasts',
    label: 'Forecasts',
    imageUrl: '/images/forecast2.jpg',
    textColor: '#fff',
    description: 'View 16-day rainfall & pasture growth.',
  },
]

export function PaddockBuilder({ farmId }: PaddockBuilderProps) {
  const initialize = usePaddockBuilderStore((s) => s.initialize)
  const isLoading = usePaddockBuilderStore((s) => s.isLoading)

  const [activeView, setActiveView] = useState<string>('planner')

  useEffect(() => {
    initialize(farmId)
  }, [farmId, initialize])

  if (isLoading.paddocks || isLoading.stats) {
    return <p className='text-center p-10'>Loading paddock data...</p>
  }

  const renderContent = () => {
    switch (activeView) {
      case 'planner':
        return (
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-4'>
              <FeedPlanner />
            </div>
            <div className='min-h-[600px]'>
              <MapDisplay />
            </div>
          </div>
        )
      case 'trends':
        return <TrendsChart />
      case 'forecasts':
        return <PaddockForecastPage />
      default:
        // Có thể hiển thị một lời chào hoặc không gì cả
        return 'planner'
    }
  }

  const renderIcon = () => {
    switch (activeView) {
      case 'planner':
        return <NotepadText className='h-5.5 w-5.5' />
      case 'trends':
        return <ChartLine className='h-5.5 w-5.5' />
      case 'forecasts':
        return <ThermometerSun className='h-5.5 w-5.5' />
      default:
        return null
    }
  }

  return (
    <div className='flex flex-col'>
      <CardNav
        title={
          <div className='flex gap-2 items-center'>
            {renderIcon()}{' '}
            {builderCardItems.find((item) => item.id === activeView)?.label}
          </div>
        }
        onItemClick={(id) => {
          setActiveView(id)
        }}
        renderAfter={
          <Chip color='secondary' variant='shadow'>
            {farmId}
          </Chip>
        }
        items={builderCardItems}
        ease='power3.out'
      />
      <div className='mt-24 w-full max-w-full'>{renderContent()}</div>
    </div>
  )
}
