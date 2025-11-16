import { NextResponse } from 'next/server'

import { PaddockCollection } from '@/lib/types' // Import type của bạn

// --- DỮ LIỆU GIẢ LẬP ---
// (Nếu bạn có file GeoJSON thật, hãy copy nội dung vào đây)
const fakePaddockData: PaddockCollection = {
  type: 'FeatureCollection',
  features: [
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.795894, -37.964704],
            [142.794907, -37.969415],
            [142.797933, -37.970117],
            [142.799177, -37.965144],
            [142.795894, -37.964704],
          ],
        ],
      },
      properties: {
        area_ha: 15.5441,
        color: '#e74c3c',
        name: 'North Road',
        paddock_id: '1757670921839',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.802653, -37.965583],
            [142.802095, -37.972519],
            [142.804885, -37.972147],
            [142.807331, -37.971876],
            [142.806773, -37.969237],
            [142.805786, -37.965888],
            [142.802653, -37.965583],
          ],
        ],
      },
      properties: {
        area_ha: 26.7819,
        color: '#16a085',
        name: 'Corner North',
        paddock_id: 'pad_2',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.799327, -37.965194],
            [142.802567, -37.965634],
            [142.802374, -37.969305],
            [142.801838, -37.972621],
            [142.799606, -37.972925],
            [142.797675, -37.97279],
            [142.799327, -37.965194],
          ],
        ],
      },
      properties: {
        area_ha: 27.6065,
        color: '#e74c3c',
        name: 'Gus',
        paddock_id: 'pad_3',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.789586, -37.963773],
            [142.794617, -37.964661],
            [142.793888, -37.968671],
            [142.788341, -37.966971],
            [142.789586, -37.963773],
          ],
        ],
      },
      properties: {
        area_ha: 19.8701,
        color: '#2980b9',
        name: 'north road a',
        paddock_id: 'pad_4',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.78303, -37.963283],
            [142.784618, -37.963909],
            [142.784264, -37.964484],
            [142.782311, -37.963782],
            [142.781571, -37.964552],
            [142.788159, -37.966945],
            [142.789478, -37.963858],
            [142.787011, -37.963562],
            [142.78303, -37.963283],
          ],
        ],
      },
      properties: {
        area_ha: 14.9356,
        color: '#f1c40f',
        name: 'shelterbelt',
        paddock_id: 'pad_5',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.778674, -37.968772],
            [142.782665, -37.969373],
            [142.784092, -37.96577],
            [142.780927, -37.964704],
            [142.778889, -37.966801],
            [142.778674, -37.968772],
          ],
        ],
      },
      properties: {
        area_ha: 16.6472,
        color: '#8e44ad',
        name: 'Paddock dam',
        paddock_id: 'pad_6',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.778707, -37.968916],
            [142.778943, -37.972705],
            [142.780402, -37.972849],
            [142.781013, -37.972206],
            [142.781056, -37.971606],
            [142.781528, -37.9718],
            [142.78273, -37.969483],
            [142.778707, -37.968916],
          ],
        ],
      },
      properties: {
        area_ha: 10.4181,
        color: '#16a085',
        name: 'side',
        paddock_id: 'pad_7',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.784361, -37.965863],
            [142.786946, -37.966776],
            [142.78568, -37.969914],
            [142.785069, -37.969779],
            [142.784382, -37.969669],
            [142.78332, -37.969525],
            [142.782826, -37.969415],
            [142.784361, -37.965863],
          ],
        ],
      },
      properties: {
        area_ha: 9.8375,
        color: '#3498db',
        name: 'Mid H',
        paddock_id: 'pad_8',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.786978, -37.966852],
            [142.790669, -37.967926],
            [142.789264, -37.97065],
            [142.785723, -37.969796],
            [142.786925, -37.966945],
            [142.786978, -37.966852],
          ],
        ],
      },
      properties: {
        area_ha: 11.283,
        color: '#8e44ad',
        name: 'Mid E',
        paddock_id: 'pad_9',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.782869, -37.969491],
            [142.785659, -37.969956],
            [142.784243, -37.973069],
            [142.781442, -37.972891],
            [142.782869, -37.969491],
          ],
        ],
      },
      properties: {
        area_ha: 9.3396,
        color: '#9b59b6',
        name: 'Mid G',
        paddock_id: 'pad_10',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.790819, -37.967986],
            [142.793909, -37.968891],
            [142.793469, -37.971369],
            [142.789629, -37.970472],
            [142.790819, -37.967986],
          ],
        ],
      },
      properties: {
        area_ha: 9.1189,
        color: '#16a085',
        name: 'Mid D',
        paddock_id: 'pad_11',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.785798, -37.969846],
            [142.78921, -37.970768],
            [142.787805, -37.973416],
            [142.786303, -37.973111],
            [142.784543, -37.973077],
            [142.785798, -37.969846],
          ],
        ],
      },
      properties: {
        area_ha: 10.1643,
        color: '#e74c3c',
        name: 'Mid F',
        paddock_id: 'pad_12',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.789618, -37.970515],
            [142.793405, -37.971386],
            [142.793266, -37.972003],
            [142.791742, -37.971842],
            [142.791452, -37.973889],
            [142.788695, -37.973568],
            [142.788963, -37.972959],
            [142.788277, -37.972773],
            [142.789618, -37.970515],
          ],
        ],
      },
      properties: {
        area_ha: 9.3421,
        color: '#9b59b6',
        name: 'Mid C',
        paddock_id: 'pad_13',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.778825, -37.97301],
            [142.776947, -37.977052],
            [142.78583, -37.977196],
            [142.786764, -37.973424],
            [142.778825, -37.97301],
          ],
        ],
      },
      properties: {
        area_ha: 32.4838,
        color: '#9b59b6',
        name: 'side a',
        paddock_id: 'pad_14',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.787923, -37.973695],
            [142.791485, -37.974109],
            [142.791334, -37.976232],
            [142.789006, -37.976697],
            [142.789114, -37.977915],
            [142.786775, -37.981213],
            [142.785358, -37.980841],
            [142.787161, -37.974177],
            [142.787923, -37.973695],
          ],
        ],
      },
      properties: {
        area_ha: 22.0757,
        color: '#9b59b6',
        name: 'Mid D',
        paddock_id: 'pad_15',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.797718, -37.977221],
            [142.80201, -37.978168],
            [142.801623, -37.980367],
            [142.796173, -37.980469],
            [142.796044, -37.979657],
            [142.797074, -37.979454],
            [142.797718, -37.977221],
          ],
        ],
      },
      properties: {
        area_ha: 13.1147,
        color: '#9b59b6',
        name: 'Mid B',
        paddock_id: 'pad_16',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.80231, -37.978236],
            [142.809091, -37.97827],
            [142.809391, -37.980706],
            [142.801881, -37.980232],
            [142.80231, -37.978236],
          ],
        ],
      },
      properties: {
        area_ha: 15.4828,
        color: '#e67e22',
        name: 'East A',
        paddock_id: 'pad_17',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.781024, -37.97739],
            [142.779694, -37.980401],
            [142.784672, -37.981044],
            [142.785702, -37.977323],
            [142.781024, -37.97739],
          ],
        ],
      },
      properties: {
        area_ha: 16.2057,
        color: '#e67e22',
        name: 'side e',
        paddock_id: 'pad_18',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.799268, -37.980464],
            [142.796136, -37.980583],
            [142.796286, -37.982367],
            [142.803426, -37.983006],
            [142.802439, -37.980503],
            [142.799268, -37.980464],
          ],
        ],
      },
      properties: {
        area_ha: 14.1613,
        color: '#e67e22',
        name: 'mid a',
        paddock_id: 'pad_19',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.80261, -37.980604],
            [142.803769, -37.982769],
            [142.80982, -37.983682],
            [142.809262, -37.980773],
            [142.80261, -37.980604],
          ],
        ],
      },
      properties: {
        area_ha: 15.2854,
        color: '#1abc9c',
        name: 'East B',
        paddock_id: 'pad_20',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.77699, -37.977492],
            [142.774243, -37.978845],
            [142.774158, -37.979826],
            [142.779522, -37.980435],
            [142.780552, -37.97756],
            [142.77699, -37.977492],
          ],
        ],
      },
      properties: {
        area_ha: 13.2525,
        color: '#e67e22',
        name: 'side b',
        paddock_id: 'pad_21',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.773943, -37.980164],
            [142.77317, -37.984325],
            [142.775702, -37.983682],
            [142.77626, -37.980164],
            [142.773943, -37.980164],
          ],
        ],
      },
      properties: {
        area_ha: 8.8834,
        color: '#16a085',
        name: 'small c',
        paddock_id: 'pad_22',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.776303, -37.980367],
            [142.780209, -37.980976],
            [142.780037, -37.982126],
            [142.776046, -37.983445],
            [142.776303, -37.980367],
          ],
        ],
      },
      properties: {
        area_ha: 8.0787,
        color: '#2980b9',
        name: 'small d',
        paddock_id: 'pad_23',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.773042, -37.987741],
            [142.77905, -37.988519],
            [142.780123, -37.982837],
            [142.773514, -37.984934],
            [142.773042, -37.987741],
          ],
        ],
      },
      properties: {
        area_ha: 25.6547,
        color: '#16a085',
        name: 'side',
        paddock_id: 'pad_24',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.780852, -37.982701],
            [142.77905, -37.991191],
            [142.785444, -37.991867],
            [142.786646, -37.981822],
            [142.782569, -37.981653],
            [142.780852, -37.982701],
          ],
        ],
      },
      properties: {
        area_ha: 57.2385,
        color: '#e74c3c',
        name: 'mid a',
        paddock_id: 'pad_25',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.787504, -37.982025],
            [142.786603, -37.986929],
            [142.799821, -37.98835],
            [142.800722, -37.983581],
            [142.787504, -37.982025],
          ],
        ],
      },
      properties: {
        area_ha: 63.7493,
        color: '#9b59b6',
        name: 'mid',
        paddock_id: 'pad_26',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.801108, -37.983784],
            [142.800379, -37.98835],
            [142.810764, -37.990007],
            [142.809949, -37.984325],
            [142.801108, -37.983784],
          ],
        ],
      },
      properties: {
        area_ha: 48.0623,
        color: '#8e44ad',
        name: 'side with dam',
        paddock_id: 'pad_27',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.772827, -37.987944],
            [142.771969, -37.990413],
            [142.778363, -37.991462],
            [142.778921, -37.988621],
            [142.773557, -37.988147],
            [142.772827, -37.987944],
          ],
        ],
      },
      properties: {
        area_ha: 16.4246,
        color: '#c0392b',
        name: 'Coner',
        paddock_id: 'pad_28',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.786603, -37.987471],
            [142.799735, -37.989094],
            [142.79922, -37.993592],
            [142.785873, -37.992104],
            [142.786603, -37.987471],
          ],
        ],
      },
      properties: {
        area_ha: 59.9781,
        color: '#1abc9c',
        name: 'Dam Paddock',
        paddock_id: 'pad_29',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.800207, -37.98906],
            [142.810979, -37.990684],
            [142.811322, -37.995013],
            [142.799649, -37.993626],
            [142.800207, -37.98906],
          ],
        ],
      },
      properties: {
        area_ha: 48.9027,
        color: '#2980b9',
        name: 'back corner',
        paddock_id: 'pad_30',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.793673, -37.976291],
            [142.789693, -37.978059],
            [142.787676, -37.981543],
            [142.792193, -37.982101],
            [142.792343, -37.981526],
            [142.795894, -37.981991],
            [142.795422, -37.979479],
            [142.794607, -37.979445],
            [142.793673, -37.976291],
          ],
        ],
      },
      properties: {
        area_ha: 27.8129,
        color: '#9b59b6',
        name: 'Hill',
        paddock_id: 'pad_31',
      },
      type: 'Feature',
    },
    {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [142.797868, -37.973644],
            [142.797568, -37.975201],
            [142.799499, -37.976487],
            [142.800143, -37.97537],
            [142.800872, -37.975675],
            [142.800529, -37.976927],
            [142.803662, -37.977637],
            [142.808511, -37.977637],
            [142.807953, -37.973069],
            [142.807095, -37.972595],
            [142.807095, -37.972155],
            [142.799456, -37.973171],
            [142.79937, -37.97361],
            [142.797868, -37.973644],
          ],
        ],
      },
      properties: {
        area_ha: 42.9693,
        color: '#d35400',
        name: 'East',
        paddock_id: 'pad_32',
      },
      type: 'Feature',
    },
  ],
}
// --- KẾT THÚC DỮ LIỆU GIẢ LẬP ---

export async function GET() {
  // request: Request,
  // { params }: { params: { farm_id: string } },
  // const farmId = params.farm_id;
  // console.log(`[Mock API] Faking paddocks (GeoJSON) for farm: ${farmId}`);

  // Trả về dữ liệu JSON
  return NextResponse.json(fakePaddockData)
}

// Thêm hàm POST để xử lý việc LƯU
export async function POST(
  request: Request,
  // { params }: { params: { farm_id: string } },
) {
  // const farmId = params.farm_id;
  const data = await request.json()

  // console.log(
  //   `[Mock API] "Saving" ${data.features.length} paddocks for farm: ${farmId}`,
  // );

  // Giả lập việc lưu thành công
  return NextResponse.json({ success: true, count: data.features.length })
}
