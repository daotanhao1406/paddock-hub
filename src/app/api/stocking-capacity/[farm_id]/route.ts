import { NextResponse } from 'next/server'

// Đây là DỮ LIỆU GIẢ LẬP mà API /api/stocking_capacity sẽ trả về.
// Cấu trúc này được suy ra từ hàm `fpRender` trong file HTML.
const fakeFeedData = {
  data: {
    // "paddocks" (hoặc "rows") là danh sách kết quả
    paddocks: [
      {
        name: 'North Paddock',
        area_ha: 110.5,
        biomass_t_ha: 4.5,
        cp_pct: 15.2, // Lưu ý: file HTML sẽ chạy normalizeCP() trên giá trị này
        rwc_pct: 75.0,
        kg_per_dse_day_eff: 1.25, // (Backend đã tính)
        available_kg: 18898, // (Backend đã tính)
        dse_days: 15118, // (Backend đã tính)
        days_for_n_head: 30.2, // (Backend đã tính)
        head_capacity_for_target_days: 377, // (Backend đã tính)
        latest_date: '2025-10-20',
      },
      {
        name: 'South Hill',
        area_ha: 85.2,
        biomass_t_ha: 3.2,
        cp_pct: 18.1,
        rwc_pct: 68.0,
        kg_per_dse_day_eff: 1.25,
        available_kg: 10952,
        dse_days: 8761,
        days_for_n_head: 17.5,
        head_capacity_for_target_days: 219,
        latest_date: '2025-10-25',
      },
      {
        name: 'River Flat',
        area_ha: 150.0,
        biomass_t_ha: 6.1,
        cp_pct: 12.5,
        rwc_pct: 82.0,
        kg_per_dse_day_eff: 1.25,
        available_kg: 36780,
        dse_days: 29424,
        days_for_n_head: 58.8,
        head_capacity_for_target_days: 735,
        latest_date: '2025-10-10',
      },
    ],
    // "totals" là đối tượng chứa tổng
    totals: {
      available_kg: 66630,
      dse_days: 53303,
    },
  },
}

export async function GET() {
  // request: Request,
  // { params }: { params: { farm_id: string } },
  // const farmId = params.farm_id;
  // const { searchParams } = new URL(request.url);

  // console.log(`[Mock API] Faking Feed Planner calculation for farm: ${farmId}`);
  // console.log(
  //   `[Mock API] With inputs:`,
  //   Object.fromEntries(searchParams.entries()),
  // );

  // Giả lập độ trễ mạng
  await new Promise((res) => setTimeout(res, 500))

  // Trả về dữ liệu JSON đã được tính toán sẵn
  return NextResponse.json(fakeFeedData)
}
