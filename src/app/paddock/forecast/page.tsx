'use client'

import {
  Card,
  CardBody,
  CardHeader,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
} from '@heroui/react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  MetData,
  MetRowNormalized,
  PaddockFeature,
  SeriesData,
} from '@/lib/types'
import { GC_TO_KGDM_HA, isNum, normalizeMetRow } from '@/lib/utils'

import { MainChart } from '@/components/forecast/main-chart'
import { MetTable } from '@/components/forecast/met-table'
import { NetChart } from '@/components/forecast/net-chart'
import { OutlookTable } from '@/components/forecast/outlook-table'
import { StatusBox } from '@/components/forecast/status-box'

import { usePaddockBuilderStore } from '@/store/use-paddock-builder-store'

// Cần tạo một component skeleton (hoặc div) để hiển thị khi bản đồ đang tải
const MapLoadingSkeleton = () => (
  <div className='flex h-[600px] w-full items-center justify-center rounded-md border bg-gray-100'>
    <p>Loading map...</p>
  </div>
)

// DÙNG DYNAMIC IMPORT VỚI SSR: FALSE
const ForecastMapDisplay = dynamic(
  () =>
    import('@/components/forecast/forecast-map-display').then(
      (mod) => mod.ForecastMapDisplay,
    ),
  {
    ssr: false, // <-- Quan trọng nhất: Tắt Server-Side Rendering
    loading: () => <MapLoadingSkeleton />, // Hiển thị cái này trong khi tải
  },
)

// --- Hàm fetch API (wrapper) ---
async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) {
    const errorText = await r.text()
    // Ném lỗi để Promise.all có thể bắt được
    throw new Error(`Failed to fetch ${url}: ${r.status} ${errorText}`)
  }
  return r.json() as Promise<T>
}

// Định nghĩa kiểu cho chế độ biểu đồ
type ChartMode = 'feed' | 'growth'

export default function PaddockForecastPage() {
  // --- State Management ---
  const paddockFeatures = usePaddockBuilderStore((s) => s.paddocks)

  // 2. Trích xuất danh sách tên (chỉ chạy 1 lần)
  const allPaddockNames = useMemo(() => {
    return paddockFeatures.features.map((feature: PaddockFeature) => ({
      id: feature.properties.paddock_id,
      name: feature.properties.name,
    }))
  }, [paddockFeatures])

  const [selectedPaddock, setSelectedPaddock] = useState<{
    id: string
    name: string
  }>(allPaddockNames[0])
  const [chartMode, setChartMode] = useState<ChartMode>('growth')

  const [seriesData, setSeriesData] = useState<SeriesData | null>(null)
  const [metData, setMetData] = useState<MetData | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Data Fetching ---
  const loadData = useCallback(async (pid: string) => {
    if (!pid) return

    setLoading(true)
    setError(null)
    // Không reset data cũ để UI không bị giật
    // setSeriesData(null);
    // setMetData(null);

    try {
      // Gọi cả hai API song song
      const [series, met] = await Promise.all([
        fetchJSON<SeriesData>(
          `/api/forecast/${encodeURIComponent(pid)}?days=16`,
        ),
        fetchJSON<MetData>(`/api/met_table/${encodeURIComponent(pid)}?days=16`),
      ])

      setSeriesData(series)
      setMetData(met)
    } catch (err: unknown) {
      // Bắt lỗi kiểu 'unknown'
      if (err instanceof Error) {
        setError('Failed to load data.' + err.message)
      } else {
        setError('An unknown error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }, []) // useCallback không có dependency, hàm này ổn định

  // Effect để tải dữ liệu khi `selectedPid` thay đổi
  useEffect(() => {
    if (selectedPaddock) {
      loadData(selectedPaddock?.id)
    }
  }, [selectedPaddock, loadData])

  // --- Memoized Data Transformation (Tính toán lại khi data thay đổi) ---

  // Chuẩn hóa dữ liệu bảng Met
  const normalizedMetRows: MetRowNormalized[] = useMemo(() => {
    return (metData?.rows || []).map(normalizeMetRow)
  }, [metData])

  // Dữ liệu cho biểu đồ chính
  const chartData = useMemo(() => {
    if (!seriesData) return []

    return seriesData.dates.map((date, i) => {
      const rawGrowth = seriesData.growth[i]
      const growth =
        chartMode === 'feed' && isNum(rawGrowth)
          ? rawGrowth * GC_TO_KGDM_HA
          : rawGrowth

      const rain = seriesData.rain_mm[i]
      const et0 = seriesData.et0_mm[i]
      const net = isNum(rain) && isNum(et0) ? rain - et0 : null

      return {
        date,
        growth: growth,
        rain: rain,
        et0: et0,
        net: net,
      }
    })
  }, [seriesData, chartMode])

  const yAxisLabel = useMemo(() => {
    return chartMode === 'feed' ? 'Feed (kg DM/ha/day)' : 'Growth (gC/m²/day)'
  }, [chartMode])

  // --- Event Handlers (Cập nhật cho shadcn/ui) ---

  // Kiểu cho `onValueChange` của Select là `(value: string) => void`
  const handlePaddockChange = (value: string) => {
    const paddock = allPaddockNames.find(
      (p: { id: string; name: string }) => p.id === value,
    )
    if (!paddock) return
    setSelectedPaddock(paddock)
  }

  // Kiểu cho `onValueChange` của RadioGroup là `(value: string) => void`
  const handleModeChange = (value: string) => {
    // Ép kiểu an toàn
    if (value === 'feed' || value === 'growth') {
      setChartMode(value)
    }
  }

  if (error) return null

  // --- Render ---
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 xl:grid-cols-5 gap-4'>
        {/* CỘT BÊN TRAI */}
        <div className='xl:col-span-2 space-y-4'>
          <Card>
            <CardBody className='flex flex-wrap items-center gap-4 p-4'>
              <Select
                label='Choose paddock'
                labelPlacement='outside'
                placeholder='Select a paddock'
                value={selectedPaddock?.id}
                onChange={(e) => handlePaddockChange(e.target.value)}
                disabled={loading}
                defaultSelectedKeys={[selectedPaddock?.id]}
              >
                {allPaddockNames.map((p) => {
                  return (
                    <SelectItem id={p.id} key={p.id}>
                      {p.name}
                    </SelectItem>
                  )
                })}
              </Select>
            </CardBody>
          </Card>
          <StatusBox
            headline={seriesData?.headline}
            metRows={normalizedMetRows}
            isLoading={loading && !seriesData} // Chỉ loading khi chưa có data
          />

          <Card>
            <CardHeader>Net water</CardHeader>
            <CardBody
              className='min-h-90'
              style={{
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {loading && !seriesData ? (
                <p>Loading chart...</p>
              ) : (
                <NetChart data={chartData} />
              )}
            </CardBody>
          </Card>
        </div>

        {/* CỘT BÊN TRÁI */}
        <div className='xl:col-span-3 space-y-4'>
          <ForecastMapDisplay selectedPaddockName={selectedPaddock?.name} />

          <Card>
            <CardHeader className='flex justify-between'>
              Growth over the next two weeks
              <div>
                <RadioGroup
                  size='sm'
                  orientation='horizontal'
                  value={chartMode}
                  onValueChange={handleModeChange}
                >
                  <Radio value='feed'>Feed (kg/ha/day)</Radio>
                  <Radio value='growth'>Growth (gC/m²/day)</Radio>
                </RadioGroup>
              </div>
            </CardHeader>
            <CardBody
              className='min-h-90'
              style={{
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {loading && !seriesData ? (
                <p>Loading chart...</p>
              ) : (
                <MainChart data={chartData} yAxisLabel={yAxisLabel} />
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <MetTable rows={normalizedMetRows} />

      <div className='grid grid-cols-1 xl:grid-cols-5 gap-4'>
        {/* CỘT BÊN TRAI */}
        <div className='xl:col-span-2 space-y-4'>
          <Card>
            <CardHeader>
              What drives growth? (plain-English explainer)
            </CardHeader>
            <CardBody>
              <div>
                <Image
                  alt='Forecast vegetation growth diagram'
                  src='/images/forecast_vegetation_growth.png'
                  className='rounded-lg border'
                  height={320}
                  width={368}
                />
                <div className='mt-2'>
                  Plants grow when they have <b>sunlight</b>, enough{' '}
                  <b>leaf cover</b> to catch it, and enough <b>water</b>. Hot,
                  dry, windy weather increases <b>water loss</b> and slows
                  growth. We summarise each day as <b>Good / Fair / Poor</b> to
                  make decisions easy.
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* CỘT BÊN TRÁI */}
        <div className='xl:col-span-3 space-y-4'>
          <OutlookTable rows={seriesData?.outlook || []} />
        </div>
      </div>
    </div>
  )
}
