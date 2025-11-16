'use client'

// Imports của React
// Imports của Turf.js (import riêng lẻ)
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import area from '@turf/area'
import centerOfMass from '@turf/center-of-mass'
// Imports của GeoJSON
import { Feature, Polygon } from 'geojson'
import L, { LatLngExpression } from 'leaflet'
import { useEffect, useState } from 'react'
// Imports của Leaflet & React-Leaflet
import {
  FeatureGroup,
  LayerGroup,
  MapContainer,
  Marker,
  useMap,
} from 'react-leaflet'
// Imports của Leaflet Draw & Wrapper
import { EditControl } from 'react-leaflet-draw'
import 'leaflet-defaulticon-compatibility'

import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
// Fix lỗi icon (rất quan trọng)
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'

import BaseMapManager from '@/components/paddock-builder/map-display/base-map-manager'
import Typography from '@/components/ui/typography'

import { usePaddockStore } from '@/store/use-paddock-store'

// --- Định nghĩa kiểu (Type) ---

// Gắn 'feature' tùy chỉnh vào L.Polygon để theo dõi
interface PaddockLayer extends L.Polygon {
  feature?: Feature<Polygon>
}

// --- Các component con nội bộ ---

/**
 * Component con thực thi các lệnh điều khiển map từ bên ngoài
 * (ví dụ: từ ô tìm kiếm).
 */
function MapCommandExecutor() {
  const map = useMap()
  const { mapCommand, clearMapCommand } = usePaddockStore()

  useEffect(() => {
    if (!mapCommand) return

    switch (mapCommand.id) {
      case 'setView':
        map.setView(mapCommand.payload.center, mapCommand.payload.zoom)
        break
      case 'fitBounds':
        map.fitBounds(mapCommand.payload)
        break
    }
    clearMapCommand() // Xóa lệnh sau khi thực thi
  }, [map, mapCommand, clearMapCommand])

  return null // Không render UI
}

/**
 * Component con render các nhãn (label) cho paddock.
 * EditControl không tự render label, nên ta phải làm thủ công
 * bằng cách đọc state từ Zustand.
 */
function PaddockLabelRenderer() {
  const { paddocks, showLabels } = usePaddockStore()

  if (!showLabels) {
    return null
  }

  return (
    // Đặt label vào 'overlayPane' để nó luôn ở trên
    <LayerGroup pane='overlayPane'>
      {paddocks.map((paddock) => {
        const id = paddock.properties?.paddock_id
        let centroid: LatLngExpression | null = null
        try {
          // Dùng hàm import riêng lẻ
          const c = centerOfMass(paddock).geometry.coordinates
          centroid = [c[1], c[0]] // Turf: [lng, lat], Leaflet: [lat, lng]
        } catch {
          addToast({
            description: `Failed to calculate centroid for ${id}`,
            color: 'danger',
          })
        }

        if (!centroid) return null

        return (
          <Marker
            key={id}
            position={centroid}
            interactive={false}
            icon={L.divIcon({
              className: 'paddock-label', // Style từ globals.css
              html: `<span style="display: block-inline">${paddock.properties?.name || 'Paddock'}</span>`,
            })}
          />
        )
      })}
    </LayerGroup>
  )
}

// --- Component MapDisplay chính ---

export function MapDisplay() {
  const {
    addPaddock,
    removePaddockById,
    updatePaddockById,
    nextPaddockName,
    setNextPaddockName, // Lấy hàm set cho logic modal
  } = usePaddockStore()

  // State cho modal nhập tên
  const [pendingPaddock, setPendingPaddock] = useState<PaddockLayer | null>(
    null,
  )
  const [modalPaddockName, setModalPaddockName] = useState('')

  const defaultCenter: LatLngExpression = [20, 0]

  // --- HÀM XỬ LÝ SỰ KIỆN CỦA LEAFLET-DRAW ---

  /**
   * Kích hoạt khi một shape được VẼ XONG.
   */
  const handleCreated = (e: L.DrawEvents.Created) => {
    const layer = e.layer as PaddockLayer
    const name = nextPaddockName.trim()

    if (name) {
      // TRƯỜNG HỢP 1: ĐÃ CÓ TÊN (từ input ở Step 3)
      const geoJSON = layer.toGeoJSON() as Feature<Polygon>
      const id = crypto.randomUUID()

      geoJSON.properties = {
        name: name,
        paddock_id: id,
        area_ha: +(area(geoJSON) / 10000).toFixed(4),
      }
      layer.feature = geoJSON // Gắn data vào layer để theo dõi
      addPaddock(geoJSON)

      // Xóa tên đã dùng, để lần vẽ sau sẽ hiện modal
      setNextPaddockName('')
    } else {
      // TRƯỜNG HỢP 2: CHƯA CÓ TÊN -> KÍCH HOẠT MODAL
      setPendingPaddock(layer)
    }
  }

  /**
   * Kích hoạt khi các shape được SỬA XONG.
   */
  const handleEdited = (e: L.DrawEvents.Edited) => {
    e.layers.eachLayer((layer) => {
      const pLayer = layer as PaddockLayer
      const id = pLayer.feature?.properties?.paddock_id
      if (!id) return

      const updatedGeoJSON = pLayer.toGeoJSON() as Feature<Polygon>

      // Giữ lại properties cũ, chỉ cập nhật diện tích
      updatedGeoJSON.properties = pLayer.feature?.properties || {}
      updatedGeoJSON.properties.area_ha = +(
        area(updatedGeoJSON) / 10000
      ).toFixed(4)

      // Gắn lại feature mới
      pLayer.feature = updatedGeoJSON
      updatePaddockById(id, updatedGeoJSON)
    })
  }

  /**
   * Kích hoạt khi các shape bị XÓA.
   */
  const handleDeleted = (e: L.DrawEvents.Deleted) => {
    e.layers.eachLayer((layer) => {
      const pLayer = layer as PaddockLayer
      const id = pLayer.feature?.properties?.paddock_id
      if (id) {
        removePaddockById(id)
      }
    })
  }

  // --- HÀM XỬ LÝ MODAL NHẬP TÊN ---

  /**
   * Kích hoạt khi nhấn nút "Save Paddock" trên modal.
   */
  const handleModalSave = () => {
    if (!pendingPaddock) return

    const layer = pendingPaddock
    const name = modalPaddockName.trim() || 'Paddock' // Tên mặc định

    // Hoàn tất logic tạo Paddock (giống handleCreated)
    const geoJSON = layer.toGeoJSON() as Feature<Polygon>
    const id = crypto.randomUUID()
    geoJSON.properties = {
      name: name,
      paddock_id: id,
      area_ha: +(area(geoJSON) / 10000).toFixed(4),
    }
    layer.feature = geoJSON
    addPaddock(geoJSON)

    // Dọn dẹp state
    setPendingPaddock(null)
    setModalPaddockName('')
  }

  /**
   * Kích hoạt khi Dialog bị đóng (bằng nút 'x' hoặc click bên ngoài).
   */
  const handleModalOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Nếu người dùng đóng modal mà không lưu
      if (pendingPaddock) {
        // Coi như họ đã hủy, xóa layer vừa vẽ khỏi bản đồ
        pendingPaddock.remove()
      }
      setPendingPaddock(null)
      setModalPaddockName('')
    }
  }

  // --- RENDER COMPONENT CHÍNH ---

  return (
    <MapContainer
      center={defaultCenter}
      zoom={2}
      style={{ height: '560px', width: '100%' }}
      className='rounded-md border z-0'
    >
      {/* 1. Component quản lý Base map (satellite, hybrid) */}
      <BaseMapManager />

      {/* 2. Component thực thi lệnh (setView, fitBounds) */}
      <MapCommandExecutor />

      {/* 3. Component render nhãn (labels) */}
      <PaddockLabelRenderer />

      {/* 4. Layer chứa các Paddock (do EditControl quản lý) */}
      <FeatureGroup>
        <EditControl
          position='topleft'
          onCreated={handleCreated}
          onEdited={handleEdited}
          onDeleted={handleDeleted}
          draw={{
            polygon: {
              allowIntersection: false,
              shapeOptions: {
                color: '#3b82f6', // Brand color
                fillOpacity: 0.3,
              },
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
          edit={{
            remove: true,
          }}
        />
      </FeatureGroup>

      {/* 5. Modal nhập tên Paddock (chỉ hiển thị khi pendingPaddock có giá trị) */}
      <Modal isOpen={!!pendingPaddock} onOpenChange={handleModalOpenChange}>
        <ModalContent>
          <ModalHeader className='flex flex-col'>
            <div>Name your Paddock</div>
            <Typography size='sm' type='secondary' className='font-normal'>
              Please enter a name for the new paddock you just drew.
            </Typography>
          </ModalHeader>

          <ModalBody className='flex flex-col justify-center items-center'>
            <Input
              variant='bordered'
              value={modalPaddockName}
              onChange={(e) => setModalPaddockName(e.target.value)}
              autoFocus
              placeholder='Enter paddock name...'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault() // Ngăn form submit
                  handleModalSave()
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={handleModalSave}>
              Save Paddock
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MapContainer>
  )
}
