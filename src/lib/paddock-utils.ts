import { FeatureCollection } from 'geojson'

import {
  FeedPlannerInputs,
  FeedResultRow,
  PaddockCollection,
  RawStatRow,
} from './types'

type DisplayMap = {
  by_id: Record<string, string>
  by_csv_name: Record<string, string>
}

type ApiFeedRow = {
  name: string
  paddock_name?: string
  paddock?: string
  area_ha: number
  biomass_t_ha: number
  cp_pct: number | string
  rwc_pct?: number
  kg_per_dse_day_eff: number
  available_kg: number
  dse_days: number
  days_for_n_head: number
  head_capacity_for_target_days: number
  latest_date?: string
}

// --- Logic Parser/Validator ---
export function parsePaddocks(data: unknown): PaddockCollection {
  const fc = data as FeatureCollection
  if (fc && fc.type === 'FeatureCollection' && Array.isArray(fc.features)) {
    return fc as PaddockCollection
  }
  return { type: 'FeatureCollection', features: [] }
}

export function parseDisplayMap(data: unknown): DisplayMap {
  const map = data as DisplayMap
  if (map && map.by_id && map.by_csv_name) {
    return map
  }
  return { by_id: {}, by_csv_name: {} }
}

// --- Logic Tính toán Feed (Từ file HTML) ---

export function normalizeCP(raw: number | string | null | undefined): number {
  let cp = Number(raw)
  if (!isFinite(cp)) return NaN
  if (cp > 0 && cp <= 1.0) cp *= 100 // fraction → %
  if (cp > 0 && cp <= 5.5) cp *= 6.25 // %N → CP%
  cp = Math.max(5, Math.min(30, cp))
  return cp
}

export function moistureBadge(pct: number) {
  if (!Number.isFinite(pct)) return { text: '—', emoji: '—', cls: 'rest' }
  if (pct < 45) return { text: 'Very dry', emoji: '🔥', cls: 'keep' }
  if (pct < 55) return { text: 'Dry', emoji: '💧', cls: 'rest' }
  if (pct < 70) return { text: 'OK', emoji: '💧💧', cls: 'next' }
  if (pct < 85) return { text: 'Wet', emoji: '💧💧💧', cls: 'ready' }
  return { text: 'Very wet', emoji: '🌧️', cls: 'ready' }
}

export function proteinBadge(cp: number) {
  if (!Number.isFinite(cp)) return { text: '—', emoji: '—', cls: 'rest' }
  if (cp < 7) return { text: `${cp.toFixed(1)}%`, cls: 'keep' }
  if (cp < 10) return { text: `${cp.toFixed(1)}%`, cls: 'rest' }
  if (cp <= 16) return { text: `${cp.toFixed(1)}%`, cls: 'ready' }
  if (cp <= 20) return { text: `${cp.toFixed(1)}%`, cls: 'next' }
  return { text: `${cp.toFixed(1)}%`, cls: 'rest' }
}

function percentileRank(value: number, arr: number[]): number {
  const valid = arr.filter((v) => Number.isFinite(v)).sort((x, y) => x - y)
  if (!valid.length || !Number.isFinite(value)) return 0
  const idx = valid.findIndex((v) => v >= value)
  const rankIdx = idx < 0 ? valid.length - 1 : idx
  return Math.round((rankIdx / (valid.length - 1 || 1)) * 100)
}

function grazeScore(row: FeedResultRow, peers: FeedResultRow[]): number {
  const bPct = percentileRank(
    row.biomass_t_ha,
    peers.map((p) => p.biomass_t_ha),
  )
  const mPct = percentileRank(
    row.rwc_pct,
    peers.map((p) => p.rwc_pct),
  )

  const cBasis = Number.isFinite(row.days_for_n_head)
    ? (row.days_for_n_head as number)
    : row.available_kg

  const cPct = percentileRank(
    cBasis,
    peers.map((p) =>
      Number.isFinite(p.days_for_n_head)
        ? (p.days_for_n_head as number)
        : p.available_kg,
    ),
  )

  const pPct = (function (cp) {
    if (!Number.isFinite(cp)) return 60
    if (cp >= 10 && cp <= 16) return 100
    if (cp < 10) return Math.max(0, (cp - 5) / (10 - 5)) * 100
    return Math.max(0, (22 - cp) / (22 - 16)) * 100
  })(row.cp_pct)

  return Math.round(0.35 * bPct + 0.25 * mPct + 0.2 * cPct + 0.2 * pPct)
}

export function grazeRecommendation(
  row: FeedResultRow,
  peers: FeedResultRow[],
): FeedResultRow['status'] {
  const hard =
    (row.biomass_t_ha ?? 0) < 1.2 ||
    (row.rwc_pct ?? 0) < 45 ||
    (row.cp_pct ?? 0) < 7
  if (hard) return { label: 'Keep off', emoji: '⛔️', cls: 'keep' }

  const score = grazeScore(row, peers)
  if (score >= 75) return { label: 'Ready now', emoji: '🟢', cls: 'ready' }
  if (score >= 50) return { label: 'Good next', emoji: '🔵', cls: 'next' }
  return { label: 'Rest / Building', emoji: '🟠', cls: 'rest' }
}

// --- Logic Fallback (Phần phức tạp nhất) ---

/**
 * Logic tính toán feed dự phòng (fallback) phía client
 * nếu API thất bại.
 */
export function calculateFeedFallback(
  paddocks: PaddockCollection,
  rawStats: RawStatRow[],
  inputs: FeedPlannerInputs,
  displayMap: DisplayMap,
): FeedResultRow[] {
  // 1. Xây dựng cache dữ liệu mới nhất từ rawStats
  const csvLatest = { biomass: new Map(), cp: new Map(), rwc: new Map() }
  const BIOMASS_IDX = new Set([
    'BIOMASS_T_HA_obs',
    'BIOMASS_T_HA',
    'BIOMASS_LAI_T_HA',
  ])

  for (const r of rawStats) {
    const name = String(r.paddock_name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
    if (!name || isNaN(r.date_int)) continue

    const rec = { date_int: r.date_int, value: Number(r.value) }
    if (!isFinite(rec.value)) continue

    const upsert = (map: Map<string, typeof rec>) => {
      const cur = map.get(name)
      if (!cur || r.date_int > cur.date_int) map.set(name, rec)
    }

    if (BIOMASS_IDX.has(r.index)) upsert(csvLatest.biomass)
    if (r.index === 'CRUDE_PROTEIN_PCT') upsert(csvLatest.cp)
    if (r.index === 'VEG_RWC_PCT') upsert(csvLatest.rwc)
  }

  // 2. Tính toán giá trị trung bình (median) của trang trại
  const farmMedian = (idxKey: string | Set<string>) => {
    const isSet = typeof idxKey !== 'string'
    const vals = rawStats
      .filter((r) =>
        isSet ? (idxKey as Set<string>).has(r.index) : r.index === idxKey,
      )
      .map((r) => r.value)
      .filter((v) => isFinite(v))
    if (!vals.length) return NaN
    vals.sort((a, b) => a - b)
    const mid = Math.floor(vals.length / 2)
    return vals.length % 2 !== 0 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2
  }

  const BIOMASS_FARM = farmMedian(BIOMASS_IDX) || 5.0 // 5.0 là default
  const CP_FARM = farmMedian('CRUDE_PROTEIN_PCT') || 10.0
  const RWC_FARM = farmMedian('VEG_RWC_PCT') || 65.0

  // 3. Lặp qua từng paddock (feature) để tính toán
  const results: FeedResultRow[] = []

  for (const paddock of paddocks.features) {
    const props = paddock.properties
    const area = props.area_ha
    if (!area || !isFinite(area) || area <= 0) continue

    const pid = String(props.paddock_id || '').trim()
    const rawName = (props.name || 'Paddock').trim()
    const displayName =
      displayMap.by_id[pid] ||
      displayMap.by_csv_name[rawName.toLowerCase()] ||
      rawName
    const key = displayName.toLowerCase().replace(/\s+/g, ' ')

    // Tìm giá trị (ưu tiên API cache, fallback về farm median)
    const biomass = csvLatest.biomass.get(key)?.value ?? BIOMASS_FARM
    const cpRaw = csvLatest.cp.get(key)?.value ?? CP_FARM
    const rwc = csvLatest.rwc.get(key)?.value ?? RWC_FARM

    const cp = normalizeCP(cpRaw)

    // Logic tính toán (từ file HTML)
    const kgPerDSE = inputs.kgPerDseDay // (Logic CP adjust đã bị xóa)
    const availKg =
      biomass * 1000 * area * inputs.edibleFraction * inputs.utilisation
    const dseDays = availKg / kgPerDSE
    const daysForN =
      inputs.numHead > 0 ? dseDays / (inputs.numHead * inputs.dsePerHead) : ''
    const headForT =
      inputs.targetDays > 0
        ? dseDays / (inputs.targetDays * inputs.dsePerHead)
        : ''

    results.push({
      name: displayName,
      area_ha: area,
      biomass_t_ha: biomass,
      cp_pct: isFinite(cp) ? +cp.toFixed(1) : NaN,
      rwc_pct: isFinite(rwc) ? +Number(rwc).toFixed(1) : NaN,
      kg_per_dse_day_eff: +kgPerDSE.toFixed(2),
      available_kg: Math.max(0, Math.round(availKg)),
      dse_days: Math.max(0, Math.round(dseDays)),
      days_for_n_head: daysForN === '' ? '' : Math.max(0, +daysForN.toFixed(1)),
      head_capacity_for_target_days:
        inputs.targetDays > 0
          ? Math.max(0, Math.round(headForT as number))
          : '',
      status: { label: '', emoji: '', cls: '' }, // Sẽ được tính sau
    })
  }

  // 4. Tính toán điểm 'status' (cần tất cả các row khác)
  const finalResults = results.map((row) => ({
    ...row,
    status: grazeRecommendation(row, results),
  }))

  return finalResults
}

// --- Logic Tiện ích khác ---

export function toISODateFlexible(v: number | string): string {
  const s = String(v || '')
    .replaceAll('-', '')
    .trim()
  if (/^\d{8}$/.test(s.slice(0, 8)))
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  if (s.length >= 6 && /^\d{6}$/.test(s.slice(0, 6)))
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-15` // Mặc định ngày 15
  return ''
}

// Hàm hash đơn giản từ file JS
function djb2(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) + h + str.charCodeAt(i)
  }
  return h >>> 0
}

// Dùng cho border của danh sách Paddock
export function colorFromName(name: string): string {
  const PALETTE = [
    '#2ecc71',
    '#e67e22',
    '#e74c3c',
    '#3498db',
    '#9b59b6',
    '#16a085',
    '#f1c40f',
    '#1abc9c',
    '#d35400',
    '#c0392b',
    '#2980b9',
    '#8e44ad',
  ]
  const seed = String(name || 'paddock')
  const idx = djb2(seed) % PALETTE.length
  return PALETTE[idx]
}

// Kiểu dữ liệu JSON trả về (bao gồm cả các cấu trúc khác nhau)
type ApiFeedResponse = {
  data?: {
    paddocks?: ApiFeedRow[] | Record<string, Omit<ApiFeedRow, 'name'>>
    rows?: ApiFeedRow[] | Record<string, Omit<ApiFeedRow, 'name'>>
    totals?: { available_kg: number; dse_days: number }
  }
  paddocks?: ApiFeedRow[] | Record<string, Omit<ApiFeedRow, 'name'>>
  rows?: ApiFeedRow[] | Record<string, Omit<ApiFeedRow, 'name'>>
  totals?: { available_kg: number; dse_days: number }
}

/**
 * Chuẩn hóa dữ liệu trả về từ API /api/stocking_capacity
 * (Dựa trên hàm normalizeFeedData và fpRender từ file HTML)
 */
export function normalizeFeedData(raw: ApiFeedResponse): {
  paddocks: FeedResultRow[]
  totals: ApiFeedResponse['totals'] | null
} {
  const root = raw?.data && typeof raw.data === 'object' ? raw.data : raw || {}

  // --- SỬA Ở ĐÂY ---
  // Bỏ gán kiểu, để TypeScript tự suy luận
  let paddocksRaw = root.paddocks ?? root.rows ?? []
  // --- HẾT SỬA ---

  // Xử lý trường hợp data là object...
  if (
    paddocksRaw &&
    !Array.isArray(paddocksRaw) &&
    typeof paddocksRaw === 'object'
  ) {
    // Bây giờ TypeScript hiểu `paddocksRaw` là một Record (object)
    // và `v` là một object, nên `...v` sẽ hợp lệ
    paddocksRaw = Object.entries(paddocksRaw).map(([name, v]) => ({
      name,
      ...v,
    }))
  }

  if (!Array.isArray(paddocksRaw)) paddocksRaw = []

  const totals = root.totals ?? null

  // Chuẩn hóa từng hàng về kiểu FeedResultRow
  const paddocks = paddocksRaw.map((p): FeedResultRow => {
    const cp = normalizeCP(p.cp_pct)
    const rwc = Number(p.rwc_pct)

    return {
      name: p.name ?? p.paddock_name ?? p.paddock ?? 'Paddock',
      area_ha: Number(p.area_ha),
      biomass_t_ha: Number(p.biomass_t_ha),
      cp_pct: cp,
      rwc_pct: isFinite(rwc) ? rwc : 65.0, // Mặc định 65% RWC nếu thiếu
      kg_per_dse_day_eff: Number(p.kg_per_dse_day_eff),
      available_kg: Number(p.available_kg),
      dse_days: Number(p.dse_days),
      days_for_n_head: Number(p.days_for_n_head) || '',
      head_capacity_for_target_days:
        Number(p.head_capacity_for_target_days) || '',
      status: { label: '', emoji: '', cls: '' }, // Sẽ được tính sau
    }
  })

  return { paddocks, totals }
}
