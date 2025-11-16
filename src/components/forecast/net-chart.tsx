'use client'

import { Card, CardBody } from '@heroui/react'
import React from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'

import Typography from '@/components/ui/typography'

interface ChartData {
  date: string
  growth: number | null
  rain: number | null
  et0: number | null
  net: number | null
}

interface NetChartProps {
  data: ChartData[]
}

// Component Tooltip tùy chỉnh
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipContentProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <Card className='p-3 shadow-lg'>
        <CardBody className='p-0'>
          <p className='font-medium'>{label}</p>
          <p style={{ color: payload[0].stroke }} className='text-sm'>
            {`Net Water: ${payload[0].value.toFixed(1)} mm`}
          </p>
        </CardBody>
      </Card>
    )
  }
  return null
}

export function NetChart({ data }: NetChartProps) {
  return (
    <>
      <ResponsiveContainer width='100%' height={380}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: -24, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='hsl(var(--heroui-foreground-100))'
          />
          <XAxis
            dataKey='date'
            stroke='hsl(var(--heroui-foreground))'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(data.length / 6)}
          />

          <Tooltip
            content={
              <CustomTooltip
                activeIndex='0'
                active={false}
                payload={[]}
                coordinate={{ x: 0, y: 0 }}
                accessibilityLayer={false}
              />
            }
          />
          <YAxis
            label={{
              value: 'mm/day',
              angle: -90,
              position: 'insideLeft',
              offset: 28,
              fontSize: 12,
            }}
            stroke='hsl(var(--heroui-foreground))'
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          {/* Đường tham chiếu tại mốc 0 */}
          <ReferenceLine
            y={0}
            stroke='hsl(var(--heroui-foreground))'
            strokeDasharray='3 3'
          />
          <Line
            type='monotone'
            dataKey='net'
            name='Net Water (mm)'
            stroke='hsl(var(--heroui-primary))'
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <Typography type='secondary' size='sm' className='mt-2'>
        Net water = rain − water loss.
      </Typography>
    </>
  )
}
