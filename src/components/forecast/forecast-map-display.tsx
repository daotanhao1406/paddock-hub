// ./components/paddock-forecast/forecast-map-display.tsx
'use client'

import { Button } from '@heroui/react'
import L, {
  FeatureGroup as LeafletFeatureGroup,
  LatLngExpression,
} from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { FeatureGroup, MapContainer, useMap } from 'react-leaflet'
import 'leaflet-defaulticon-compatibility'

// CSS (chỉ cần các file cơ bản)
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'

import { PaddockFeature } from '@/lib/types'

import BaseMapManager from '@/components/paddock-builder/map-display/base-map-manager'

import { usePaddockBuilderStore } from '@/store/use-paddock-builder-store'

interface PaddockLayer extends L.Polygon {
  feature?: PaddockFeature
}

/**
 * Component con quản lý hiển thị paddock (chỉ đọc) cho trang Forecast.
 * Sẽ tô màu paddock được chọn và làm mờ (grey out) các paddock khác.
 */
function ForecastPaddockManager({
  selectedPaddockName,
  showPaddockNames,
}: {
  selectedPaddockName: string | undefined
  showPaddockNames: boolean
}) {
  const map = useMap()
  const { paddocks } = usePaddockBuilderStore() // Chỉ cần paddocks
  const featureGroupRef = useRef<LeafletFeatureGroup>(null)

  // --- 1. Nạp Paddock TỪ STORE vào BẢN ĐỒ (Đã cập nhật logic style) ---
  useEffect(() => {
    const fg = featureGroupRef.current
    if (!fg) return

    fg.clearLayers()
    paddocks.features.forEach((feature) => {
      // 1. Tạo nhóm layer VỚI STYLE ĐỘNG
      const geoJsonGroup = L.geoJSON(feature, {
        style: (feature) => {
          if (!feature) return {} // An toàn
          const isSelected = feature.properties.name === selectedPaddockName
          const showAll = selectedPaddockName === null

          // Nếu là "Hiển thị tất cả" HOẶC đây là paddock được chọn
          if (showAll || isSelected) {
            // Sử dụng style màu từ PaddockLayerManager (đã được gán màu forecast)
            return {
              color: feature.properties.color || '#3b82f6',
              weight: 2,
              fillOpacity: 0.4, // Hơi đậm hơn để nổi bật
            }
          } else {
            // Nếu là paddock khác, làm mờ nó đi
            return {
              color: '#9ca3af', // Xám
              weight: 1,
              fillOpacity: 0.1,
              fillColor: '#9ca3af',
            }
          }
        },
      })

      // 2. Lấy layer con
      const layer = geoJsonGroup.getLayers()[0] as PaddockLayer

      if (layer) {
        layer.feature = feature

        if (showPaddockNames) {
          layer.bindTooltip(feature.properties.name || 'Unnamed', {
            permanent: true,
            direction: 'center',
            className: 'paddock-label',
          })
        }
        fg.addLayer(layer)
      }
    })

    // --- 2. LOGIC TỰ ĐỘNG ZOOM (Giữ nguyên) ---
    // if (fg.getLayers().length > 0) {
    //   try {
    //     const bounds = fg.getBounds()
    //     map.fitBounds(bounds.pad(0.1))
    //   } catch {
    //     // Bỏ qua lỗi
    //   }
    // }
  }, [paddocks, map, selectedPaddockName, showPaddockNames])

  useEffect(() => {
    const fg = featureGroupRef.current
    // Chỉ zoom khi paddocks thay đổi (lần đầu tải)
    if (!fg || fg.getLayers().length === 0) return

    try {
      const bounds = fg.getBounds()
      map.fitBounds(bounds.pad(0.1))
    } catch {
      // Bỏ qua lỗi
    }
  }, [paddocks, map, selectedPaddockName])

  return <FeatureGroup ref={featureGroupRef} />
}

// --- Component ForecastMapDisplay chính ---

interface ForecastMapDisplayProps {
  selectedPaddockName: string | undefined
}

export function ForecastMapDisplay({
  selectedPaddockName,
}: ForecastMapDisplayProps) {
  const [showPaddockNames, setShowPaddockNames] = useState(false)
  const defaultCenter: LatLngExpression = [-25.3, 135.1] // Tọa độ Úc

  return (
    <div className='h-[446px] w-full relative'>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className='rounded-md border z-0'
      >
        {/* 1. Quản lý TileLayer (hybrid, satellite) */}
        <BaseMapManager />

        {/* 2. Quản lý Paddocks (Vẽ, Sửa, Xóa, Tải) */}
        <ForecastPaddockManager
          selectedPaddockName={selectedPaddockName}
          showPaddockNames={showPaddockNames}
        />
      </MapContainer>
      <div className='absolute top-2 right-2 z-[98]'>
        <Button
          className='bg-white shadow-md'
          variant='bordered'
          onPress={() => setShowPaddockNames(!showPaddockNames)}
        >
          {showPaddockNames ? 'Hide Labels' : 'Show Labels'}
        </Button>
      </div>
    </div>
  )
}
