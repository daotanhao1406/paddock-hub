// store/use-paddock-builder-store.ts
import Papa from 'papaparse'
import { create } from 'zustand'

import {
  calculateFeedFallback,
  grazeRecommendation,
  normalizeFeedData,
  parseDisplayMap,
  parsePaddocks,
} from '@/lib/paddock-utils'
import {
  FeedPlannerInputs,
  FeedResultRow,
  PaddockCollection,
  PaddockFeature,
  RawStatRow,
} from '@/lib/types'

// --- State cho Overlay ---
export type OverlayMetric =
  | 'BIOMASS_T_HA'
  | 'N_UPTAKE_KG_HA'
  | 'NDVI'
  | 'VEG_WATER_PCT'
  | 'CRUDE_PROTEIN_PCT'

const OVERLAY_CATALOG: Record<OverlayMetric, string[]> = {
  BIOMASS_T_HA: ['20251014', '20230717'],
  CRUDE_PROTEIN_PCT: ['20251014', '20230717'],
  NDVI: ['20251014', '20230717'],
  N_UPTAKE_KG_HA: ['20251014', '20230717'],
  VEG_WATER_PCT: ['20251014', '20230717'],
}

type OverlayState = {
  activeMetric: OverlayMetric | null
  selectedDate: string
  opacity: number
  intensity: number
  availableDates: string[]
}
// -------------------------

type TrendsFilterState = {
  selectedMetric: string
  selectedPaddocks: Set<string>
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

type PaddockBuilderState = {
  farmId: string | null
  paddocks: PaddockCollection
  rawStats: RawStatRow[]
  displayNameMap: {
    by_id: Record<string, string>
    by_csv_name: Record<string, string>
  }

  feedInputs: FeedPlannerInputs
  feedResults: FeedResultRow[] | null

  trendsFilters: TrendsFilterState
  overlay: OverlayState

  isLoading: {
    paddocks: boolean
    stats: boolean
    feed: boolean
    saving: boolean
  }

  // Actions
  initialize: (farmId: string) => Promise<void>
  loadPaddocks: () => Promise<void>
  savePaddocks: (features: PaddockFeature[]) => Promise<void> // <-- Action mới
  loadStats: () => Promise<void>
  runFeedPlanner: () => Promise<void>
  setFeedInput: (key: keyof FeedPlannerInputs, value: number) => void

  // Trend Actions
  setTrendMetric: (metric: string) => void
  toggleTrendPaddock: (paddockName: string) => void
  setTrendDateRange: (range: { from?: Date; to?: Date }) => void

  // Overlay Actions
  setOverlay: (settings: Partial<OverlayState>) => void
}

export const usePaddockBuilderStore = create<PaddockBuilderState>(
  (set, get) => ({
    farmId: null,
    paddocks: { type: 'FeatureCollection', features: [] },
    rawStats: [],
    displayNameMap: { by_id: {}, by_csv_name: {} },

    feedInputs: {
      edibleFraction: 0.85,
      utilisation: 0.4,
      kgPerDseDay: 1.25,
      dsePerHead: 1,
      numHead: 0,
      targetDays: 20,
    },
    feedResults: null,

    trendsFilters: {
      selectedMetric: 'BIOMASS_T_HA_obs',
      selectedPaddocks: new Set(),
      dateRange: { from: undefined, to: undefined },
    },

    overlay: {
      activeMetric: null,
      selectedDate: '',
      opacity: 0.7,
      intensity: 0.85,
      availableDates: [],
    },

    isLoading: { paddocks: false, stats: false, feed: false, saving: false },

    setFeedInput: (key, value) => {
      set((state) => ({
        feedInputs: { ...state.feedInputs, [key]: value },
      }))
    },

    initialize: async (farmId) => {
      set({
        farmId,
        paddocks: { type: 'FeatureCollection', features: [] },
        rawStats: [],
        feedResults: null,
      })
      await Promise.all([get().loadPaddocks(), get().loadStats()])
    },

    loadPaddocks: async () => {
      const farmId = get().farmId
      if (!farmId) return
      set((state) => ({ isLoading: { ...state.isLoading, paddocks: true } }))
      try {
        const res = await fetch(`/api/paddocks/${farmId}`)
        const data = await res.json()
        set({ paddocks: parsePaddocks(data) })
      } catch {
        // console.error('Failed to load paddocks', e);
      } finally {
        set((state) => ({
          isLoading: { ...state.isLoading, paddocks: false },
        }))
      }
    },

    // --- ACTION MỚI ---
    savePaddocks: async (features) => {
      const farmId = get().farmId
      if (!farmId) return
      set((state) => ({ isLoading: { ...state.isLoading, saving: true } }))
      try {
        const collection: PaddockCollection = {
          type: 'FeatureCollection',
          features,
        }
        const res = await fetch(`/api/paddocks/${farmId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(collection),
        })
        if (!res.ok) throw new Error('Save failed')
        // const data = await res.json();
        // Tải lại paddock từ server để đồng bộ (hoặc chỉ cần set state)
        set({ paddocks: collection })
      } catch {
        // console.error('Failed to save paddocks', e);
      } finally {
        set((state) => ({ isLoading: { ...state.isLoading, saving: false } }))
      }
    },

    loadStats: async () => {
      const farmId = get().farmId
      if (!farmId) return
      set((state) => ({ isLoading: { ...state.isLoading, stats: true } }))
      try {
        const res = await fetch(`/api/paddock-stats`)
        const csvText = await res.text()

        const parsed = await new Promise<Papa.ParseResult<RawStatRow>>(
          (resolve, reject) => {
            Papa.parse(csvText, {
              header: true,
              dynamicTyping: true,
              skipEmptyLines: true,
              // Bỏ qua logic transform phức tạp, chỉ lấy type cơ bản
              complete: (results) =>
                resolve(results as Papa.ParseResult<RawStatRow>),
              error: (err: unknown) => reject(err),
            })
          },
        )

        const processedRows = parsed.data.map(
          (r): RawStatRow => ({
            ...r,
            paddock_name: String(r.paddock_name).trim(),
            index: String(r.index),
            date_yyyymmdd: Number(r.date_yyyymmdd),
            value: Number(r.mean),
            date_int: Number(String(r.date_yyyymmdd).slice(0, 8)),
          }),
        )

        set({ rawStats: processedRows })

        const mapRes = await fetch(`/api/paddock_display_map/${farmId}`)
        const mapData = await mapRes.json()
        set({ displayNameMap: parseDisplayMap(mapData) })
      } catch {
        // console.error('Failed to load stats CSV', e);
      } finally {
        set((state) => ({ isLoading: { ...state.isLoading, stats: false } }))
      }
    },

    runFeedPlanner: async () => {
      const { farmId, feedInputs, rawStats, paddocks, displayNameMap } = get()
      if (!farmId) return

      // Xóa kết quả cũ và bật loading
      set((state) => ({
        isLoading: { ...state.isLoading, feed: true },
        feedResults: null,
      }))

      try {
        // 1. Tạo query params từ state `feedInputs`
        const params = new URLSearchParams({
          edible_fraction: String(feedInputs.edibleFraction),
          utilisation: String(feedInputs.utilisation),
          kg_per_dse_day: String(feedInputs.kgPerDseDay),
          dse_per_head: String(feedInputs.dsePerHead),
          n_head: String(feedInputs.numHead),
          target_days: String(feedInputs.targetDays),
        })

        // 2. Gọi API (luồng chính) - (sử dụng API giả lập ta đã tạo)
        const res = await fetch(
          `/api/stocking-capacity/${farmId}?${params.toString()}`,
        )

        if (!res.ok) {
          // Nếu API lỗi, ném lỗi để kích hoạt `catch` (luồng fallback)
          throw new Error(`API failed with status ${res.status}`)
        }

        const resultsJson = await res.json()

        // 3. Chuẩn hóa dữ liệu JSON từ API
        const { paddocks: apiPaddocks } = normalizeFeedData(resultsJson)

        if (!apiPaddocks || apiPaddocks.length === 0) {
          throw new Error('API returned no paddocks, trying fallback')
        }

        // 4. Tính toán điểm 'status' (giống như fallback)
        // Chúng ta cần truyền kiểu 'any' vì apiPaddocks chưa có 'status'
        const finalResults = apiPaddocks.map((r) => ({
          ...r,
          status: grazeRecommendation(r, apiPaddocks),
        }))

        set({ feedResults: finalResults })
        // console.log('Feed planner success via API');
      } catch {
        // --- LUỒNG DỰ PHÒNG (FALLBACK) ---
        // console.warn(
        //   'API feed planner failed, running local fallback...',
        //   (e as Error).message,
        // );
        try {
          const fallbackResults = calculateFeedFallback(
            paddocks,
            rawStats,
            feedInputs,
            displayNameMap,
          )

          if (fallbackResults.length === 0) {
            set({ feedResults: [] }) // Trả về mảng rỗng để hiện "No data"
            return
          }

          set({ feedResults: fallbackResults })
        } catch {
          // console.error('Fallback logic failed', fallbackError);
          set({ feedResults: [] }) // Trả về mảng rỗng
        }
      } finally {
        // Tắt loading
        set((state) => ({ isLoading: { ...state.isLoading, feed: false } }))
      }
    },

    // Trend Actions
    setTrendMetric: (metric) =>
      set((state) => ({
        trendsFilters: { ...state.trendsFilters, selectedMetric: metric },
      })),

    toggleTrendPaddock: (paddockName) =>
      set((state) => {
        const newSet = new Set(state.trendsFilters.selectedPaddocks)
        if (newSet.has(paddockName)) newSet.delete(paddockName)
        else newSet.add(paddockName)
        return {
          trendsFilters: { ...state.trendsFilters, selectedPaddocks: newSet },
        }
      }),

    setTrendDateRange: (range) =>
      set((state) => ({
        trendsFilters: {
          ...state.trendsFilters,
          dateRange: { ...state.trendsFilters.dateRange, ...range },
        },
      })),

    // Overlay Actions
    setOverlay: (settings) =>
      set((state) => {
        const newState = { ...state.overlay, ...settings }

        // LOGIC MỚI: Nếu người dùng thay đổi Metric
        if (
          settings.activeMetric &&
          settings.activeMetric !== state.overlay.activeMetric
        ) {
          const dates = OVERLAY_CATALOG[settings.activeMetric] || []
          newState.availableDates = dates.sort((a, b) => b.localeCompare(a)) // Sắp xếp (ngày mới nhất lên đầu)
          // Tự động chọn ngày mới nhất
          newState.selectedDate =
            dates.length > 0 ? newState.availableDates[0] : ''
        }

        // Nếu người dùng tắt Metric
        if (settings.activeMetric === null) {
          newState.availableDates = []
          newState.selectedDate = ''
        }

        return { overlay: newState }
      }),
  }),
)
