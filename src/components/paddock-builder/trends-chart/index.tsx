'use client'

import { Card, CardBody, CardHeader } from '@heroui/react'
import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend, // Import trực tiếp từ recharts
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip, // Import trực tiếp từ recharts
  XAxis,
  YAxis,
} from 'recharts'

import { toISODateFlexible } from '@/lib/paddock-utils'

import { TrendsFilters } from '@/components/paddock-builder/trends-chart/trends-filters'

import { usePaddockBuilderStore } from '@/store/use-paddock-builder-store'

// Sử dụng một bảng màu (palette) cứng thay vì các biến CSS của shadcn
const PALETTE = [
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#ef4444', // red-500
  '#eab308', // yellow-500
  '#a855f7', // purple-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
]

export function TrendsChart() {
  const { rawStats, trendsFilters } = usePaddockBuilderStore()

  // 1. Xử lý và lọc dữ liệu (giống logic PDK.draw)
  const chartData = useMemo(() => {
    const { selectedMetric, selectedPaddocks, dateRange } = trendsFilters

    const allPaddockNames = [...new Set(rawStats.map((r) => r.paddock_name))]
    const paddocksToDraw =
      selectedPaddocks.size > 0
        ? Array.from(selectedPaddocks) // Dùng Array.from để an toàn với downlevelIteration
        : allPaddockNames.slice(0, 5) // Lấy 5 paddock đầu làm mặc định

    // Lọc data theo metric và ngày
    const filteredStats = rawStats.filter((r) => {
      if (r.index !== selectedMetric) return false
      // Giả định toISODateFlexible trả về YYYY-MM-DD
      const date = new Date(toISODateFlexible(r.date_int))
      if (dateRange.from && date < dateRange.from) return false
      if (dateRange.to && date > dateRange.to) return false
      return true
    })

    // Gom nhóm data theo ngày
    const dataByDate = new Map()
    for (const row of filteredStats) {
      if (!paddocksToDraw.includes(row.paddock_name)) continue

      const dateStr = toISODateFlexible(row.date_int)
      if (!dateStr) continue

      const entry = dataByDate.get(dateStr) || { date: dateStr }
      entry[row.paddock_name] = row.value
      dataByDate.set(dateStr, entry)
    }

    return {
      data: Array.from(dataByDate.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
      paddocks: paddocksToDraw,
    }
  }, [rawStats, trendsFilters])

  // 2. Render biểu đồ
  return (
    <div className='flex flex-col gap-4'>
      {/* Component Filters (không đổi) */}
      <TrendsFilters
        allPaddocks={[...new Set(rawStats.map((r) => r.paddock_name))]}
      />

      <Card className='min-h-100'>
        {chartData.data.length === 0 ? (
          <div className='flex flex-1 justify-center items-center'>
            <p className='text-muted-foreground'>
              No data for current selection.
            </p>
          </div>
        ) : (
          <>
            <CardHeader>{trendsFilters.selectedMetric}</CardHeader>
            <CardBody>
              <div className='h-[450px] w-full text-sm'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={chartData.data}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='hsl(var(--border))'
                    />
                    <XAxis
                      dataKey='date'
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('en-AU', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                      stroke='hsl(var(--muted-foreground))'
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke='hsl(var(--muted-foreground))'
                      tickLine={false}
                      axisLine={false}
                    />

                    {/* Sử dụng <Tooltip> gốc của recharts */}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '0.5rem', // var(--radius)
                      }}
                      labelStyle={{
                        color: 'hsl(var(--foreground))',
                      }}
                    />

                    {/* Sử dụng <Legend> gốc của recharts */}
                    <Legend />

                    {/* Lặp và tạo các đường Line */}
                    {chartData.paddocks.map((name, index) => (
                      <Line
                        key={name}
                        type='monotone'
                        dataKey={name}
                        stroke={PALETTE[index % PALETTE.length]} // Dùng palette mới
                        dot={false}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </>
        )}
      </Card>
    </div>
  )
}
