import { Feature, FeatureCollection, Polygon } from 'geojson'
import { create } from 'zustand'

type FarmDetails = {
  farmName: string
  farmType: string
  farmerName: string
  farmerEmail: string
}

type SetViewPayload = {
  center: [number, number] // [lat, lng]
  zoom: number
}

type FitBoundsPayload = [
  [number, number], // [south, west]
  [number, number], // [north, east]
]

// 2. Định nghĩa các command cụ thể
type SetViewCommand = {
  id: 'setView'
  payload: SetViewPayload
}

type FitBoundsCommand = {
  id: 'fitBounds'
  payload: FitBoundsPayload
}

// 3. Gộp các command lại
export type MapCommand = SetViewCommand | FitBoundsCommand | null

export type BaseLayerType = 'hybrid' | 'satellite'

type PaddockState = {
  farmDetails: FarmDetails
  paddocks: Feature<Polygon>[]
  nextPaddockName: string
  showLabels: boolean
  mapCommand: MapCommand
  baseLayerType: BaseLayerType

  setFarmDetails: (details: Partial<FarmDetails>) => void
  addPaddock: (paddock: Feature<Polygon>) => void
  removePaddockById: (id: string) => void
  updatePaddockById: (id: string, updatedFeature: Feature<Polygon>) => void
  setNextPaddockName: (name: string) => void
  setShowLabels: (show: boolean) => void
  setMapCommand: (command: MapCommand) => void
  clearMapCommand: () => void
  setBaseLayerType: (type: BaseLayerType) => void

  getFeatureCollection: () => FeatureCollection
}

// Helper để tạo màu ngẫu nhiên (như code gốc của bạn)
const colorFor = (seed: string) => {
  let h = 5381
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) + h + seed.charCodeAt(i)
  }
  const hue = (h >>> 0) % 360
  return `hsl(${hue} 65% 45%)`
}

export const usePaddockStore = create<PaddockState>((set, get) => ({
  farmDetails: {
    farmName: '',
    farmType: 'livestock',
    farmerName: '',
    farmerEmail: '',
  },
  paddocks: [],
  nextPaddockName: '',
  showLabels: true,
  mapCommand: null,
  baseLayerType: 'hybrid',

  setFarmDetails: (details) =>
    set((state) => ({
      farmDetails: { ...state.farmDetails, ...details },
    })),

  addPaddock: (paddock) =>
    set((state) => {
      paddock.properties = paddock.properties || {}
      paddock.properties.color = colorFor(
        paddock.properties.name || paddock.properties.paddock_id,
      )
      return { paddocks: [...state.paddocks, paddock] }
    }),

  removePaddockById: (id) =>
    set((state) => ({
      paddocks: state.paddocks.filter((p) => p.properties?.paddock_id !== id),
    })),

  updatePaddockById: (id, updatedFeature) =>
    set((state) => ({
      paddocks: state.paddocks.map((p) =>
        p.properties?.paddock_id === id ? updatedFeature : p,
      ),
    })),

  setNextPaddockName: (name) => set({ nextPaddockName: name }),
  setShowLabels: (show) => set({ showLabels: show }),
  setMapCommand: (command) => set({ mapCommand: command }),
  clearMapCommand: () => set({ mapCommand: null }),
  setBaseLayerType: (type) => set({ baseLayerType: type }),

  getFeatureCollection: () => {
    const { paddocks } = get()
    return {
      type: 'FeatureCollection',
      features: paddocks,
    }
  },
}))
