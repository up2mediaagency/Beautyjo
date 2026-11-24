import { Booth, BoothZone } from '../types';
import { ZONES } from './booths';

export const RAMADAN_MAP_WIDTH = 723;
export const RAMADAN_MAP_HEIGHT = 1024;
export const RAMADAN_FLOOR_COLOR = '#1D3B35';

function makeRamadanBooth(
  id: string,
  code: string,
  zone: BoothZone,
  x: number,
  y: number,
  w: number,
  h: number
): Booth {
  const meta = ZONES[zone];
  return {
    id,
    code,
    zone,
    areaLabel: meta.areaLabel,
    color: meta.color,
    textColor: meta.textColor,
    shape: 'rect',
    defaultX: x,
    defaultY: y,
    defaultW: w,
    defaultH: h,
    x,
    y,
    w,
    h,
    exhibitorName: '',
    logoDataUrl: null,
    logoScale: 0.85,
    logoAlign: 'center',
    displayMode: 'both',
  };
}

export function createRamadanBooths(): Booth[] {
  const islandRows = [363, 408, 452, 497, 543, 588];
  const wallRowsLeft = [335, 383, 428, 474, 518, 565, 612];
  const wallRowsRight = [335, 387, 431, 478, 521, 565, 613];

  const centerLeftPairs: [string, string][] = [
    ['35', '34'],
    ['32', '33'],
    ['31', '30'],
    ['28', '29'],
    ['26', '27'],
    ['25', '24'],
  ];

  const centerMiddlePairs: [string, string][] = [
    ['36', '37'],
    ['39', '38'],
    ['40', '41'],
    ['43', '42'],
    ['45', '44'],
    ['46', '47'],
  ];

  const centerRightPairs: [string, string][] = [
    ['58', '59'],
    ['57', '56'],
    ['54', '55'],
    ['52', '53'],
    ['50', '51'],
    ['48', '49'],
  ];

  const booths: Booth[] = [
    // Top Row (Right to Left: 8, 9, 10, 11, 12)
    makeRamadanBooth('8', '8', 'ramadanStandard', 394, 302, 44, 35),
    makeRamadanBooth('9', '9', 'ramadanStandard', 336, 302, 44, 35),
    makeRamadanBooth('10', '10', 'ramadanStandard', 279, 302, 44, 35),
    makeRamadanBooth('11', '11', 'ramadanStandard', 222, 302, 44, 35),
    makeRamadanBooth('12', '12', 'ramadanStandard', 163, 302, 44, 35),

    // Left Wall Column (Top to Bottom: 13..19)
    ...['13', '14', '15', '16', '17', '18', '19'].map((num, idx) =>
      makeRamadanBooth(num, num, 'ramadanStandard', 113, wallRowsLeft[idx], 39, 44)
    ),

    // Right Wall Column (Top to Bottom: 7..1)
    ...['7', '6', '5', '4', '3', '2', '1'].map((num, idx) =>
      makeRamadanBooth(num, num, 'ramadanStandard', 447, wallRowsRight[idx], 36, 44)
    ),

    // Center-Left Island Block (2 cols x 6 rows)
    ...centerLeftPairs.flatMap(([leftCode, rightCode], idx) => [
      makeRamadanBooth(leftCode, leftCode, 'ramadanStandard', 179, islandRows[idx], 34, 44),
      makeRamadanBooth(rightCode, rightCode, 'ramadanStandard', 213, islandRows[idx], 34, 44),
    ]),

    // Center-Middle Island Block (2 cols x 6 rows)
    ...centerMiddlePairs.flatMap(([leftCode, rightCode], idx) => [
      makeRamadanBooth(leftCode, leftCode, 'ramadanStandard', 263, islandRows[idx], 34, 44),
      makeRamadanBooth(rightCode, rightCode, 'ramadanStandard', 297, islandRows[idx], 34, 44),
    ]),

    // Center-Right Island Block (2 cols x 6 rows)
    ...centerRightPairs.flatMap(([leftCode, rightCode], idx) => [
      makeRamadanBooth(leftCode, leftCode, 'ramadanStandard', 351, islandRows[idx], 34, 44),
      makeRamadanBooth(rightCode, rightCode, 'ramadanStandard', 385, islandRows[idx], 34, 44),
    ]),

    // Lower Hall (20, 21, 22, 23)
    makeRamadanBooth('20', '20', 'ramadanStandard', 177, 659, 44, 25),
    makeRamadanBooth('21', '21', 'ramadanStandard', 221, 659, 45, 25),
    makeRamadanBooth('22', '22', 'ramadanStandard', 305, 659, 46, 25),
    makeRamadanBooth('23', '23', 'ramadanStandard', 390, 659, 46, 25),

    // Bottom-Right Entrance Row (صف المدخل السفلي: 1, 2, 3 - distinct IDs)
    makeRamadanBooth('Entrance-1', 'مدخل-1', 'ramadanEntrance', 387, 701, 46, 33),
    makeRamadanBooth('Entrance-2', 'مدخل-2', 'ramadanEntrance', 433, 701, 48, 33),
    makeRamadanBooth('Entrance-3', 'مدخل-3', 'ramadanEntrance', 481, 701, 46, 33),

    // Entrance VIP / Sponsor Pavilions
    makeRamadanBooth('Gold', 'الذهبي', 'ramadanGold', 220, 711, 33, 54),
    makeRamadanBooth('Silver', 'الفضي', 'ramadanSilver', 212, 807, 45, 32),
    makeRamadanBooth('Diamond', 'الماسي', 'ramadanDiamond', 313, 763, 129, 72),

    // Exterior Right Lobby Area - Upper Lobby Row (اللوبي العلوي)
    makeRamadanBooth('Lobby-1', 'Lobby-1', 'ramadanLobby', 534, 414, 34, 24),
    makeRamadanBooth('Lobby-2', 'Lobby-2', 'ramadanLobby', 568, 414, 34, 24),
    makeRamadanBooth('Lobby-3', 'Lobby-3', 'ramadanLobby', 602, 414, 34, 24),
    makeRamadanBooth('Lobby-4', 'Lobby-4', 'ramadanLobby', 636, 414, 34, 24),

    // Exterior Right Lobby Area - Lower Lobby Row (اللوبي السفلي)
    makeRamadanBooth('Lobby-5', 'Lobby-5', 'ramadanLobby', 518, 570, 42, 25),
    makeRamadanBooth('Lobby-6', 'Lobby-6', 'ramadanLobby', 560, 570, 34, 25),
    makeRamadanBooth('Lobby-7', 'Lobby-7', 'ramadanLobby', 594, 570, 34, 25),
    makeRamadanBooth('Lobby-8', 'Lobby-8', 'ramadanLobby', 628, 570, 34, 25),
  ];

  return booths;
}
