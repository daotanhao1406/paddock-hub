'use client'

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
} from '@heroui/react'
import { Input } from '@heroui/react'

import { usePaddockStore } from '@/store/use-paddock-store'

// Component này nhận mapComponent như một prop
type Step3Props = {
  mapComponent: React.ReactNode
}

export function Step3Draw({ mapComponent }: Step3Props) {
  const {
    paddocks,
    nextPaddockName,
    setNextPaddockName,
    showLabels,
    setShowLabels,
    baseLayerType,
    setBaseLayerType,
  } = usePaddockStore()

  return (
    <Card className='p-3'>
      <CardHeader className='font-semibold'>3. Draw your paddocks</CardHeader>
      <CardBody className='space-y-4 overflow-hidden'>
        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <ol className='list-decimal list-inside space-y-1 text-sm text-muted-foreground'>
              <li>
                Click{' '}
                <Chip
                  className='mx-0.5'
                  radius='md'
                  size='sm'
                  variant='bordered'
                >
                  Polygon
                </Chip>{' '}
                on the map controls (top-left).
              </li>
              <li>Click to place corner points around your paddock.</li>
              <li>Double-click to finish. It will use the name below.</li>
              <li>Repeat. Use edit/trash tools to adjust.</li>
            </ol>
            <div className='mt-2 p-3 rounded-md border-dashed border border-amber-500 bg-amber-50 text-amber-800 text-sm'>
              Tip: If you have a single farm boundary, draw it too and name it
              “Farm Boundary”.
            </div>
          </div>
          <div className='space-y-4'>
            <div className='flex flex-wrap items-end gap-2'>
              <div className='space-y-2 flex-grow'>
                <Input
                  label='Next paddock name'
                  labelPlacement='outside'
                  placeholder='e.g. Mid North'
                  value={nextPaddockName}
                  onChange={(e) => setNextPaddockName(e.target.value)}
                />
              </div>
              <Button variant='bordered' onPress={() => setNextPaddockName('')}>
                Clear
              </Button>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-medium'>Paddocks:</span>
              <Chip color='secondary' size='sm'>
                {paddocks.length}
              </Chip>
            </div>
          </div>
        </div>

        {/* Vị trí render bản đồ */}
        <div className='pt-2'>
          <div className='flex flex-wrap items-center gap-2 mb-2'>
            <Button
              variant={baseLayerType === 'hybrid' ? 'solid' : 'bordered'}
              color={baseLayerType === 'hybrid' ? 'secondary' : 'default'}
              size='sm'
              onPress={() => setBaseLayerType('hybrid')}
            >
              🗺️ Satellite + labels
            </Button>
            <Button
              variant={baseLayerType === 'satellite' ? 'solid' : 'bordered'}
              color={baseLayerType === 'satellite' ? 'secondary' : 'default'}
              size='sm'
              onPress={() => setBaseLayerType('satellite')}
            >
              🛰️ Imagery only
            </Button>
            <div className='flex-grow'></div>
            <Checkbox
              size='sm'
              isSelected={showLabels}
              onValueChange={setShowLabels}
            >
              Show labels
            </Checkbox>
          </div>
          {mapComponent}
        </div>
      </CardBody>
    </Card>
  )
}
