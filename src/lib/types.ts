import { Feature, FeatureCollection, Polygon } from 'geojson'
// --- Các kiểu dữ liệu chung ---
export interface Headline {
  date?: string
  overall?: string
  fPAR?: number
  LAI?: number
  Tmean_C?: number
  VPD_kPa?: number
  PAR_MJ_m2?: number
  Rain_mm?: number
  ET0_mm?: number
}

export interface OutlookRow {
  date: string
  sunlight: string
  rain: string
  drying: string
  aird: string
  overall: string
}

// --- /api/forecast ---
export interface SeriesData {
  dates: string[]
  growth: (number | null)[]
  rain_mm: (number | null)[]
  et0_mm: (number | null)[]
  headline: Headline
  outlook: OutlookRow[]
}

// --- /api/met_table ---

// Định nghĩa TẤT CẢ các key có thể có từ API.
// Dữ liệu có thể là string, number, hoặc null.
type MaybeNumStr = number | string | null | undefined

export interface MetRowRaw {
  date?: string
  Date?: string
  ds?: string
  ts?: string

  PAR_MJ_m2?: MaybeNumStr
  PAR?: MaybeNumStr
  par?: MaybeNumStr
  Sunlight?: MaybeNumStr
  sunlight?: MaybeNumStr

  fPAR?: MaybeNumStr
  fpar?: MaybeNumStr
  fAPAR?: MaybeNumStr
  FPAR?: MaybeNumStr
  fapar?: MaybeNumStr

  LAI?: MaybeNumStr
  lai?: MaybeNumStr
  LeafArea?: MaybeNumStr
  leaf_area?: MaybeNumStr

  APAR_MJ_m2?: MaybeNumStr
  APAR?: MaybeNumStr
  apar?: MaybeNumStr

  TMIN_C?: MaybeNumStr
  tmin?: MaybeNumStr
  Tmin_C?: MaybeNumStr

  TMAX_C?: MaybeNumStr
  tmax?: MaybeNumStr
  Tmax_C?: MaybeNumStr

  TMEAN_C?: MaybeNumStr
  tmean?: MaybeNumStr
  Tmean_C?: MaybeNumStr
  TAVG_C?: MaybeNumStr

  EA_KPA?: MaybeNumStr
  ea_kpa?: MaybeNumStr
  ea?: MaybeNumStr

  VPD_KPA?: MaybeNumStr
  vpd_kpa?: MaybeNumStr
  VPD?: MaybeNumStr
  vpd?: MaybeNumStr

  U2_MEAN?: MaybeNumStr
  wind?: MaybeNumStr
  U2?: MaybeNumStr

  RAIN_MM?: MaybeNumStr
  Rain_mm?: MaybeNumStr
  rain?: MaybeNumStr

  ET0_mm?: MaybeNumStr
  et0?: MaybeNumStr
  ET_mm?: MaybeNumStr
  ET?: MaybeNumStr
}

export interface MetData {
  rows: MetRowRaw[]
}

// Kiểu dữ liệu SẠCH sau khi đã được chuẩn hóa (normalize)
export interface MetRowNormalized {
  date: string | undefined
  PAR_MJ_m2: number | null
  APAR_MJ_m2: number | null
  TMIN_C: number | null
  TMAX_C: number | null
  TMEAN_C: number | null
  EA_KPA: number | null
  VPD_KPA: number | null
  U2_MEAN: number | null
  RAIN_MM: number | null
  ET0_mm: number | null
  fPAR: number | null
  LAI: number | null
}

// Định nghĩa 1 Paddock (thêm properties vào GeoJSON)
export type PaddockProperties = {
  name: string
  paddock_id: string
  color?: string
  area_ha?: number
}
export type PaddockFeature = Feature<Polygon, PaddockProperties>
export type PaddockCollection = FeatureCollection<Polygon, PaddockProperties>

// Dữ liệu thô từ file CSV (PapaParse)
export type RawStatRow = {
  paddock_name: string
  index: string // Tên metric (ví dụ: 'BIOMASS_T_HA_obs')
  date_yyyymmdd: number
  mean: number // Giá trị chính
  paddock_id?: string
  date_int: number // Đã xử lý
  value: number // Đã xử lý (alias của mean)
  [key: string]: unknown // CSV có thể có nhiều cột
}

// Dữ liệu cho Form Feed Planner
export type FeedPlannerInputs = {
  edibleFraction: number
  utilisation: number
  kgPerDseDay: number
  dsePerHead: number
  numHead: number
  targetDays: number
}

// Dữ liệu cho bảng kết quả Feed
export type FeedResultRow = {
  name: string
  status: { label: string; emoji: string; cls: string }
  area_ha: number
  biomass_t_ha: number
  cp_pct: number
  rwc_pct: number
  kg_per_dse_day_eff: number
  available_kg: number
  dse_days: number
  days_for_n_head: number | string
  head_capacity_for_target_days: number | string
}
