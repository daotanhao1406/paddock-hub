import { TileLayer } from 'react-leaflet'

import { usePaddockStore } from '@/store/use-paddock-store'
/**
 * Component con quản lý lớp bản đồ nền (Base Map).
 * Render có điều kiện các <TileLayer> dựa trên state.
 */
export default function BaseMapManager() {
  const { baseLayerType } = usePaddockStore()
  return (
    <>
      <TileLayer
        url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        attribution='Imagery © Esri, Maxar'
        maxZoom={19}
      />
      {baseLayerType === 'hybrid' && (
        <TileLayer
          url='https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
          attribution='Labels © Esri'
          pane='overlayPane'
        />
      )}
    </>
  )
}
