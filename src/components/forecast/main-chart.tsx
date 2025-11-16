'use client'

import { Card, CardBody } from '@heroui/react'
import React from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TooltipContentProps } from 'recharts/types/component/Tooltip'

import Typography from '@/components/ui/typography'

// Kiểu dữ liệu cho mỗi hàng trong biểu đồ
interface ChartData {
  date: string
  growth: number | null
  rain: number | null
  et0: number | null
  net: number | null
}

interface MainChartProps {
  data: ChartData[]
  yAxisLabel: string
}

// Component Tooltip tùy chỉnh (để có style của shadcn)
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
          {payload.map((entry) => (
            <p
              key={entry.name}
              style={{ color: entry.color }}
              className='text-sm'
            >
              {`${entry.name}: ${typeof entry?.value === 'number' && entry?.value?.toFixed(1)}`}
            </p>
          ))}
        </CardBody>
      </Card>
    )
  }
  return null
}

export function MainChart({ data, yAxisLabel }: MainChartProps) {
  return (
    <>
      <ResponsiveContainer width='100%' height={360}>
        <ComposedChart data={data} margin={{ right: -12, left: -12 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
          <XAxis
            dataKey='date'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            // Chỉ hiển thị 5-6 mốc ngày để tránh rối
            interval={Math.floor(data.length / 6)}
            tickMargin={4}
          />
          <YAxis
            yAxisId='left'
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              offset: 20,
              fontSize: 12,
            }}
            stroke='hsl(var(--muted-foreground))'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            orientation='left'
          />
          <YAxis
            yAxisId='right'
            label={{
              value: 'Rain / Water loss (mm)',
              angle: 90,
              position: 'insideRight',
              offset: 20,
              fontSize: 12,
            }}
            stroke='hsl(var(--muted-foreground))'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            orientation='right'
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
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar
            dataKey='growth'
            yAxisId='left'
            name='Growth'
            fill='hsl(var(--heroui-success))'
            radius={4}
            maxBarSize={48}
          />
          <Line
            type='monotone'
            dataKey='rain'
            yAxisId='right'
            name='Rain (mm)'
            stroke='hsl(var(--heroui-primary))'
            strokeWidth={2}
            dot={false}
          />
          <Line
            type='monotone'
            dataKey='et0'
            yAxisId='right'
            name='Water loss (mm)'
            stroke='hsl(var(--heroui-danger))'
            strokeWidth={2}
            strokeDasharray='3 4'
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Typography type='secondary' size='sm' className='mt-2'>
        Bars = daily feed production (or carbon growth). Blue line = forecast
        rain (mm). Red line = water loss (evapotranspiration, mm). Net water =
        rain − water loss.
      </Typography>
    </>
  )
}
