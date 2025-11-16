// components/paddock-builder/map-display/map-overlay-controls.tsx
'use client'

import { Card, Chip, DatePicker, DateValue, Slider } from '@heroui/react'
import { isSameDay, parseDate } from '@internationalized/date'
import { CircleX } from 'lucide-react'
import { useMemo } from 'react'

import Typography from '@/components/ui/typography'

import {
  OverlayMetric,
  usePaddockBuilderStore,
} from '@/store/use-paddock-builder-store'

const OVERLAY_INDICES: { id: OverlayMetric; label: string }[] = [
  { id: 'BIOMASS_T_HA', label: '🌱 Biomass' },
  { id: 'N_UPTAKE_KG_HA', label: '🧪 Nitrogen' },
  { id: 'NDVI', label: '🌿 NDVI' },
  { id: 'VEG_WATER_PCT', label: '💧 Veg Water' },
  { id: 'CRUDE_PROTEIN_PCT', label: '💪 Crude Protein' },
]

export function MapOverlayControls() {
  const { overlay, setOverlay } = usePaddockBuilderStore()

  const handleMetricChange = (value: string) => {
    // ToggleGroup trả về chuỗi rỗng khi bỏ chọn
    setOverlay({ activeMetric: (value as OverlayMetric) || null })
  }

  const handleDateChange = (date: DateValue | null) => {
    if (date) {
      // `date` là đối tượng DateValue, có các thuộc tính year, month, day
      const year = date.year

      // Thêm '0' vào trước nếu tháng < 10
      const month = String(date.month).padStart(2, '0')

      // Thêm '0' vào trước nếu ngày < 10
      const day = String(date.day).padStart(2, '0')

      // Ghép lại thành định dạng 'YYYYMMDD'
      const formattedDate = `${year}${month}${day}`

      // Bây giờ `formattedDate` có dạng '20251014'
      setOverlay({ selectedDate: formattedDate })
    } else {
      // Xử lý trường hợp ngày bị xóa (nếu cần)
      setOverlay({ selectedDate: undefined })
    }
  }

  // --- Hàm helper để format YYYYMMDD sang YYYY-MM-DD ---
  const dateValue = useMemo(() => {
    const selectedDateString = overlay.selectedDate
    if (selectedDateString && selectedDateString.length === 8) {
      try {
        // Chuyển '20251014' -> '2025-10-14'
        const formattedStr = `${selectedDateString.slice(0, 4)}-${selectedDateString.slice(4, 6)}-${selectedDateString.slice(6, 8)}`

        // Parse thành đối tượng DateValue
        return parseDate(formattedStr)
      } catch {
        return null
      }
    }
    return null
  }, [overlay.selectedDate])

  const availableDates = overlay.availableDates.map((dateStr) => {
    // Chuyển '20251014' -> '2025-10-14'
    const formattedStr = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`

    // Parse chuỗi đã định dạng
    return parseDate(formattedStr)
  })

  // 3. Tạo hàm callback
  const isDateUnavailable = (dateValue: DateValue) => {
    // Kiểm tra xem `dateValue` (từ lịch) có tồn tại
    // trong mảng `availableDates` của chúng ta không
    const isAvailable = availableDates.some((availableDate) =>
      isSameDay(dateValue, availableDate),
    )

    // Prop này muốn biết ngày nào "KHÔNG có sẵn" (unavailable)
    // Vì vậy, chúng ta đảo ngược logic:
    // Nếu KHÔNG tìm thấy (isAvailable = false) -> return true (để vô hiệu hóa ngày đó)
    return !isAvailable
  }

  return (
    <Card className='absolute bottom-4 left-4 z-[49] p-3.5 w-[350px] space-y-3'>
      {/* 1. Opacity & Intensity */}
      <div className='space-y-2'>
        <div className='grid grid-cols-5 items-center gap-2'>
          <Typography className='font-semibold col-span-1' size='xs'>
            Opacity
          </Typography>
          <Slider
            id='opacity-slider'
            className='col-span-4'
            value={overlay.opacity}
            onChange={(val) =>
              setOverlay({
                opacity: typeof val === 'number' ? Number(val) : undefined,
              })
            }
            minValue={0}
            maxValue={1}
            step={0.05}
            size='sm'
          />
        </div>
        <div className='grid grid-cols-5 items-center gap-2'>
          <Typography className='font-semibold col-span-1' size='xs'>
            Intensity
          </Typography>
          <Slider
            id='intensity-slider'
            className='col-span-4'
            value={overlay.intensity}
            onChange={(val) =>
              setOverlay({
                intensity: typeof val === 'number' ? Number(val) : undefined,
              })
            }
            minValue={0.2}
            maxValue={1.4}
            step={0.05}
            size='sm'
          />
        </div>
      </div>
      {/* 2. Metric buttons */}
      <div className='grid grid-cols-5 items-center gap-2'>
        <Typography className='font-semibold col-span-1' size='xs'>
          Indices
        </Typography>
        <div className='flex flex-wrap justify-start gap-1 col-span-4'>
          {OVERLAY_INDICES.map((item) => (
            <Chip
              key={item.id}
              size='sm'
              className='cursor-pointer'
              classNames={{ content: 'flex items-center justify-center' }}
              variant={overlay.activeMetric === item.id ? 'solid' : 'bordered'}
              color={overlay.activeMetric === item.id ? 'secondary' : 'default'}
              onClick={() => handleMetricChange(item.id)}
              endContent={
                overlay.activeMetric === item.id && (
                  <CircleX
                    className='h-3.5 w-3.5 ml-1'
                    onClick={(e) => {
                      e.stopPropagation()
                      setOverlay({ activeMetric: null })
                    }}
                  />
                )
              }
            >
              {item.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* 3. Date controls */}
      <div className='grid grid-cols-5 items-center gap-2'>
        <Typography className='font-semibold col-span-1' size='xs'>
          Date
        </Typography>
        <div className='col-span-4'>
          <DatePicker
            value={dateValue}
            isDateUnavailable={isDateUnavailable}
            onChange={handleDateChange}
            showMonthAndYearPickers
            variant='bordered'
            className='w-full'
            firstDayOfWeek='mon'
          />
        </div>
      </div>
    </Card>
  )
}
