import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { MetRowNormalized, MetRowRaw } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function download(filename: string, text: string) {
  const a = document.createElement('a')
  a.setAttribute(
    'href',
    'data:application/geo+json;charset=utf-8,' + encodeURIComponent(text),
  )
  a.setAttribute('download', filename)
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// --- Constants ---
export const GC_TO_KGDM_HA = 10 / 0.45 // 22.222...

// --- Helpers ---
// Type guard: kiểm tra một giá trị 'unknown' có phải là number hay không
export const isNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)

// Dùng 'unknown' thay vì 'any'. Chúng ta phải kiểm tra kiểu trước khi dùng.
export const fmt = (v: unknown, d = 1): string => {
  const num = Number(v) // Cố gắng chuyển đổi
  return v == null || !Number.isFinite(num) ? '–' : num.toFixed(d)
}

// --- Normalization ---

// Dùng `keyof MetRowRaw` để đảm bảo chúng ta chỉ "pick" các key tồn tại
const pick = (r: MetRowRaw, ...keys: (keyof MetRowRaw)[]): number | null => {
  for (const k of keys) {
    const val = r[k] // val có kiểu MaybeNumStr
    if (val != null) {
      const num = Number(val) // Chuyển đổi "5.5" thành 5.5
      if (Number.isFinite(num)) return num
    }
  }
  return null
}

// Hàm này giờ hoàn toàn type-safe, nhận MetRowRaw, trả về MetRowNormalized
export function normalizeMetRow(r: MetRowRaw): MetRowNormalized {
  const date = r.date || r.Date || r.ds || r.ts

  const PAR = pick(r, 'PAR_MJ_m2', 'PAR', 'par', 'Sunlight', 'sunlight')
  const fPAR = pick(r, 'fPAR', 'fpar', 'fAPAR', 'FPAR', 'fapar')
  const LAI = pick(r, 'LAI', 'lai', 'LeafArea', 'leaf_area')

  let APAR = pick(r, 'APAR_MJ_m2', 'APAR', 'apar')
  if (!isNum(APAR) && isNum(PAR) && isNum(fPAR)) APAR = PAR * fPAR

  const TMIN = pick(r, 'TMIN_C', 'tmin', 'Tmin_C')
  const TMAX = pick(r, 'TMAX_C', 'tmax', 'Tmax_C')
  let TMEAN = pick(r, 'TMEAN_C', 'tmean', 'Tmean_C', 'TAVG_C')
  if (!isNum(TMEAN) && isNum(TMIN) && isNum(TMAX)) TMEAN = (TMIN + TMAX) / 2

  const EA = pick(r, 'EA_KPA', 'ea_kpa', 'ea')
  const VPD = pick(r, 'VPD_KPA', 'vpd_kpa', 'VPD', 'vpd')
  const U2 = pick(r, 'U2_MEAN', 'wind', 'U2')
  const RAIN = pick(r, 'RAIN_MM', 'Rain_mm', 'rain')
  const ET0 = pick(r, 'ET0_mm', 'et0', 'ET_mm', 'ET')

  return {
    date,
    PAR_MJ_m2: PAR,
    APAR_MJ_m2: APAR,
    TMIN_C: TMIN,
    TMAX_C: TMAX,
    TMEAN_C: TMEAN,
    EA_KPA: EA,
    VPD_KPA: VPD,
    U2_MEAN: U2,
    RAIN_MM: RAIN,
    ET0_mm: ET0,
    fPAR,
    LAI,
  }
}

// Dùng `keyof MetRowNormalized` cho các key
export function mostRecentWith(
  keys: (keyof MetRowNormalized)[],
  rows: MetRowNormalized[],
): MetRowNormalized | null {
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    // r[k] sẽ có kiểu (string | number | null | undefined)
    // isNum(r[k]) sẽ kiểm tra một cách an toàn
    if (keys.every((k) => isNum(r[k]))) return r
  }
  return null
}
