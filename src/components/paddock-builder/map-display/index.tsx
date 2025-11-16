'use client'

import { Button } from '@heroui/react'
import L, {
  FeatureGroup as LeafletFeatureGroup,
  LatLngExpression,
} from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { FeatureGroup, ImageOverlay, MapContainer, useMap } from 'react-leaflet'
import 'leaflet-defaulticon-compatibility'

// CSS
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'

import { PaddockFeature } from '@/lib/types'

import BaseMapManager from '@/components/paddock-builder/map-display/base-map-manager'
import LegendOverlay from '@/components/paddock-builder/map-display/legend-overlay'

// Store & Types
import { usePaddockBuilderStore } from '@/store/use-paddock-builder-store'

// Components con
import { MapOverlayControls } from './map-overlay-controls'

// Định nghĩa kiểu
interface PaddockLayer extends L.Polygon {
  feature?: PaddockFeature
}

/**
 * Component con quản lý đồng bộ state paddocks (từ store)
 * VÀO trong FeatureGroup (của bản đồ).
 * Đây là phần phức tạp nhất.
 */

function PaddockLayerManager({
  showPaddockNames,
}: {
  showPaddockNames: boolean
}) {
  const map = useMap()
  const { paddocks } = usePaddockBuilderStore()

  // Lấy ref của FeatureGroup từ <EditControl>
  const featureGroupRef = useRef<LeafletFeatureGroup>(null)

  // Ref để tránh việc chạy lại useEffect[paddocks] khi ta tự cập nhật
  const isInternalUpdate = useRef(false)

  // --- 1. Nạp Paddock TỪ STORE vào BẢN ĐỒ ---
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    const fg = featureGroupRef.current
    if (!fg) return

    fg.clearLayers()
    paddocks.features.forEach((feature) => {
      // 1. Tạo nhóm layer
      const geoJsonGroup = L.geoJSON(feature, {
        style: {
          color: feature.properties.color || '#3b82f6',
          // Thêm style từ file HTML gốc
          weight: 2,
          fillOpacity: 0.3,
        },
      })

      // 2. Lấy layer con
      const layer = geoJsonGroup.getLayers()[0] as PaddockLayer

      if (layer) {
        layer.feature = feature

        // layer.on('dblclick', () => {
        //   setPaddockToRename(feature)
        // })

        // 3. THÊM TOOLTIP CÓ ĐIỀU KIỆN
        if (showPaddockNames) {
          layer.bindTooltip(
            feature.properties.name || 'Unnamed', // Hiển thị tên
            {
              permanent: true,
              direction: 'center',
              className: 'paddock-label',
            },
          )
        }

        fg.addLayer(layer)
      }
    })
  }, [paddocks, map, showPaddockNames]) // Chỉ chạy khi paddocks từ store thay đổi

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
  }, [paddocks, map])

  return <FeatureGroup ref={featureGroupRef} />
}

/**
 * Component con quản lý LỚP PHỦ VỆ TINH (Image Overlays)
 */
function MapOverlayManager() {
  const { overlay } = usePaddockBuilderStore()
  const overlayRef = useRef<L.ImageOverlay | null>(null)

  const [overlayData, setOverlayData] = useState<{
    imageUrl: string
    bounds: L.LatLngBoundsExpression
  } | null>(null)

  // --- 1. Logic Fetch Dữ liệu (ĐÃ CẬP NHẬT) ---
  useEffect(() => {
    // Nếu không có metric HOẶC không có ngày, xóa overlay
    if (!overlay.activeMetric || !overlay.selectedDate) {
      setOverlayData(null)
      return
    }

    const metric = overlay.activeMetric
    const ymd = overlay.selectedDate // <-- Lấy YYYYMMDD từ store

    const baseFileName = `${metric}_${ymd}`

    // Đường dẫn công khai đến file data (ví dụ: /overlays/BIOMASS_T_HA/BIOMASS_T_HA_20230717.json)
    const jsonUrl = `/overlays/${metric}/${baseFileName}.json`
    const imageUrl = `/overlays/${metric}/${baseFileName}.png`

    // Gọi fetch để lấy file .json (lấy bounds)
    fetch(jsonUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Data not found: ${jsonUrl}`)
        }
        return res.json()
      })
      .then((data) => {
        // Dữ liệu trả về: { imageUrl: "...", bounds: [[...], [...]] }
        setOverlayData({
          imageUrl: imageUrl,
          bounds: data.bounds,
        })
      })
      .catch(() => {
        setOverlayData(null) // Xóa nếu fetch lỗi
      })

    // Chạy lại khi metric hoặc date thay đổi
  }, [overlay.activeMetric, overlay.selectedDate])

  // --- 2. Logic Cập nhật Style (Opacity & Intensity) ---
  // (Giữ nguyên, không thay đổi)
  useEffect(() => {
    if (!overlayRef.current) return
    const element = overlayRef.current.getElement()
    if (element) {
      element.style.opacity = String(overlay.opacity)
      const s = overlay.intensity
      element.style.filter = `saturate(${s}) contrast(1.05) brightness(1.03)`
    }
  }, [overlay.opacity, overlay.intensity, overlayData])

  // --- 3. Logic Render ---
  // (Giữ nguyên, không thay đổi)
  if (!overlay.activeMetric || !overlayData) {
    return null
  }

  return (
    <ImageOverlay
      ref={overlayRef}
      url={overlayData.imageUrl}
      bounds={overlayData.bounds}
      opacity={overlay.opacity}
      zIndex={400}
    />
  )
}

// --- Component MapDisplay chính (đã rút gọn) ---

export function MapDisplay() {
  const defaultCenter: LatLngExpression = [-25.3, 135.1] // Tọa độ Úc
  const [showPaddockNames, setShowPaddockNames] = useState(false)

  return (
    <div className='h-full w-full relative'>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className='rounded-md border z-0'
      >
        {/* 1. Quản lý TileLayer (hybrid, satellite) */}
        <BaseMapManager />

        {/* 2. Quản lý Lớp phủ (Biomass, NDVI...) */}
        <MapOverlayManager />

        {/* 3. Quản lý Paddocks (Vẽ, Sửa, Xóa, Tải) */}
        <PaddockLayerManager showPaddockNames={showPaddockNames} />
      </MapContainer>

      {/* 4. Bộ điều khiển Lớp phủ (UI) */}
      <MapOverlayControls />

      {/* 5. Hiển thị legends (UI) */}
      <LegendOverlay />

      {/* 6. THÊM NÚT BẤM "SHOW LABELS" */}
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
