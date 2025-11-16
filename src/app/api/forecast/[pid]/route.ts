import { NextResponse } from 'next/server'

import { SeriesData } from '@/lib/types'

// Dữ liệu giả lập này BẮT BUỘC phải tuân thủ kiểu SeriesData
const mockData: SeriesData = {
  dates: ['2025-11-08', '2025-11-09', '2025-11-10', '2025-11-11', '2025-11-12'],
  growth: [5.2, 5.5, 4.9, 6.0, 5.8],
  rain_mm: [0, 0, 5.5, 1.2, 0.0],
  et0_mm: [3.1, 3.5, 2.0, 2.5, 3.3],
  headline: {
    date: '2025-11-08',
    overall: 'Good',
    fPAR: 0.85,
    LAI: 3.5,
    Tmean_C: 22.5,
    VPD_kPa: 1.2,
    PAR_MJ_m2: 25.1,
    Rain_mm: 0.0,
    ET0_mm: 3.1,
  },
  outlook: [
    {
      date: '2025-11-08',
      sunlight: 'Good',
      rain: 'Poor',
      drying: 'Fair',
      aird: 'Fair',
      overall: 'Good',
    },
    {
      date: '2025-11-09',
      sunlight: 'Good',
      rain: 'Poor',
      drying: 'Poor',
      aird: 'Poor',
      overall: 'Fair',
    },
    {
      date: '2025-11-10',
      sunlight: 'Fair',
      rain: 'Good',
      drying: 'Good',
      aird: 'Good',
      overall: 'Good',
    },
    {
      date: '2025-11-11',
      sunlight: 'Fair',
      rain: 'Fair',
      drying: 'Fair',
      aird: 'Fair',
      overall: 'Fair',
    },
    {
      date: '2025-11-12',
      sunlight: 'Good',
      rain: 'Poor',
      drying: 'Fair',
      aird: 'Fair',
      overall: 'Good',
    },
  ],
}

export async function GET() {
  // const { pid } = params;
  // const { searchParams } = new URL(request.url);
  // const days = searchParams.get('days');
  // ... logic query Supabase ...

  return NextResponse.json(mockData)
}
