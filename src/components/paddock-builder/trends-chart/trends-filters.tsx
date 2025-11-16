// components/paddock-builder/trends-chart/trends-filters.tsx
'use client'

import {
  Button,
  Card,
  CardBody,
  Checkbox,
  DatePicker,
  Input,
  Select,
  SelectItem,
} from '@heroui/react'
import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
} from '@internationalized/date'
import { useMemo, useState } from 'react'

import { colorFromName } from '@/lib/paddock-utils'
import { cn } from '@/lib/utils'

import { usePaddockBuilderStore } from '@/store/use-paddock-builder-store'

type Props = {
  allPaddocks: string[]
}

export function TrendsFilters({ allPaddocks }: Props) {
  const {
    rawStats,
    trendsFilters,
    setTrendMetric,
    toggleTrendPaddock,
    setTrendDateRange,
  } = usePaddockBuilderStore()

  const [search, setSearch] = useState('')
  const filteredPaddocks = allPaddocks.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  )

  const allMetrics = useMemo(() => {
    return [...new Set(rawStats.map((r) => r.index))].sort()
  }, [rawStats])

  const { minFromDate, maxToDate } = useMemo(() => {
    const dates = [
      ...new Set(
        rawStats
          .map((r) => r.date_int)
          .filter(Boolean)
          .sort(),
      ),
    ]

    if (!dates.length) return { from: null, to: null }

    try {
      const fromDateString = String(dates[0])
      const toDateString = String(dates[dates.length - 1])

      const fromDateFormattedStr = `${fromDateString.slice(0, 4)}-${fromDateString.slice(4, 6)}-${fromDateString.slice(6, 8)}`
      const toDateFormattedStr = `${toDateString.slice(0, 4)}-${toDateString.slice(4, 6)}-${toDateString.slice(6, 8)}`

      return {
        minFromDate: parseDate(fromDateFormattedStr),
        maxToDate: parseDate(toDateFormattedStr),
      }
    } catch {
      return {
        minFromDate: null,
        maxToDate: null,
      }
    }
  }, [rawStats])

  const fromDate = useMemo(() => {
    const jsDate = trendsFilters.dateRange.from
    if (jsDate) {
      const dateValue = new CalendarDate(
        jsDate.getFullYear(),
        jsDate.getMonth() + 1, // +1 vì tháng của JS (0-11), CalendarDate (1-12)
        jsDate.getDate(),
      )
      return dateValue
    }
    return undefined
  }, [trendsFilters.dateRange.from])

  const toDate = useMemo(() => {
    const jsDate = trendsFilters.dateRange.to
    if (jsDate) {
      const dateValue = new CalendarDate(
        jsDate.getFullYear(),
        jsDate.getMonth() + 1, // +1 vì tháng của JS (0-11), CalendarDate (1-12)
        jsDate.getDate(),
      )
      return dateValue
    }
    return undefined
  }, [trendsFilters.dateRange.to])

  return (
    <Card className='p-2'>
      <CardBody className='grid grid-cols-1 md:grid-cols-6 gap-6 p-4'>
        {/* Cột 1: Filters */}
        <div className='space-y-4 md:col-span-2'>
          <Select
            labelPlacement='outside'
            value={trendsFilters.selectedMetric}
            onChange={(e) => setTrendMetric(e.target.value)}
            label='Metric'
            placeholder='Select a metric'
          >
            {allMetrics.map((metric) => (
              <SelectItem key={metric}>{metric}</SelectItem>
            ))}
          </Select>

          <DatePicker
            label='From'
            labelPlacement='outside'
            firstDayOfWeek='mon'
            showMonthAndYearPickers
            value={fromDate}
            onChange={(date) => {
              const localTimeZone = getLocalTimeZone()
              setTrendDateRange({ from: date?.toDate(localTimeZone) })
            }}
            minValue={minFromDate}
            maxValue={maxToDate}
          />

          <DatePicker
            label='To'
            labelPlacement='outside'
            firstDayOfWeek='mon'
            showMonthAndYearPickers
            value={toDate}
            onChange={(date) => {
              const localTimeZone = getLocalTimeZone()
              setTrendDateRange({ to: date?.toDate(localTimeZone) })
            }}
            minValue={minFromDate}
            maxValue={maxToDate}
          />

          <div className='flex gap-4 justify-between'>
            <Checkbox isDisabled size='sm'>
              Farm average
            </Checkbox>
            <Checkbox isDisabled size='sm'>
              3-point smoothing
            </Checkbox>
          </div>
        </div>

        {/* Cột 2 & 3: Paddock List */}
        <div className='md:col-span-4 space-y-2'>
          <div className='flex gap-2 items-end'>
            <Input
              label='Paddocks'
              labelPlacement='outside'
              placeholder='Filter paddocks...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              isClearable
              onClear={() => setSearch('')}
            />
            <Button
              variant='bordered'
              onPress={() => allPaddocks.forEach((p) => toggleTrendPaddock(p))}
            >
              All
            </Button>
            <Button
              variant='bordered'
              onPress={() =>
                trendsFilters.selectedPaddocks.forEach((p) =>
                  toggleTrendPaddock(p),
                )
              }
            >
              None
            </Button>
          </div>
          <div className='max-h-48 overflow-y-auto overflow-x-hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-2 pl-0'>
            {filteredPaddocks.map((name) => (
              <Checkbox
                key={name}
                id={name}
                classNames={{
                  base: cn(
                    'inline-flex w-full max-w-full bg-content1',
                    'hover:bg-content2 items-center justify-start',
                    'cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent',
                  ),
                  label: 'w-full',
                }}
                className='bg-white shadow-sm p-2 pl-3 m-0 min-w-0 flex-shrink-0 transition-colors hover:bg-gray-50'
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: colorFromName(name),
                }}
                isSelected={trendsFilters.selectedPaddocks.has(name)}
                onValueChange={() => toggleTrendPaddock(name)}
                size='sm'
                title={name}
              >
                <div className='max-w-11/12 font-medium truncate overflow-hidden'>
                  {name}
                </div>
              </Checkbox>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
