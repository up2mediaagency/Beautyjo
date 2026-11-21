import { Booth, BoothZone, ZoneMeta } from '../types';

export const MAP_WIDTH = 832;
export const MAP_HEIGHT = 1024;

export const ZONES: Record<BoothZone, ZoneMeta> = {
  diamond: {
    id: 'diamond',
    nameAr: 'الماسي',
    areaLabel: '100 م² / 110 م²',
    color: '#eb1f24',
    textColor: '#ffffff',
  },
  platinum: {
    id: 'platinum',
    nameAr: 'البلاتيني',
    areaLabel: '60 م²',
    color: '#e9b847',
    textColor: '#1e293b',
  },
  gold: {
    id: 'gold',
    nameAr: 'الذهبي',
    areaLabel: '50 م²',
    color: '#3b8ea7',
    textColor: '#ffffff',
  },
  silver: {
    id: 'silver',
    nameAr: 'الفضي',
    areaLabel: '25 م²',
    color: '#f59a53',
    textColor: '#1e293b',
  },
  green: {
    id: 'green',
    nameAr: 'الأخضر',
    areaLabel: '30 م²',
    color: '#1ddb68',
    textColor: '#0f172a',
  },
  lightPurple: {
    id: 'lightPurple',
    nameAr: 'البنفسجي الفاتح',
    areaLabel: '12 م²',
    color: '#cc9cc4',
    textColor: '#1e293b',
  },
  darkPurple: {
    id: 'darkPurple',
    nameAr: 'البنفسجي الداكن',
    areaLabel: '340 م²',
    color: '#640084',
    textColor: '#ffffff',
  },
  lightBlue: {
    id: 'lightBlue',
    nameAr: 'الأزرق الفاتح',
    areaLabel: '20 م²',
    color: '#94fcf9',
    textColor: '#0f172a',
  },
};

function makeBooth(
  id: string,
  zone: BoothZone,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: 'rect' | 'l-shape' = 'rect'
): Booth {
  const meta = ZONES[zone];
  return {
    id,
    code: id,
    zone,
    areaLabel: meta.areaLabel,
    color: meta.color,
    textColor: meta.textColor,
    shape,
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

export function createInitialBooths(): Booth[] {
  return [
    // Diamond (100m² / 110m² Red)
    makeBooth('A03', 'diamond', 352, 723, 64, 66),

    // Platinum (60m² Yellow)
    makeBooth('A01', 'platinum', 234, 797, 49, 66),
    makeBooth('A02', 'platinum', 298, 797, 49, 66),

    // Gold & Teal (50m² Teal) - Left section (B01-B04)
    makeBooth('B03', 'gold', 124, 570, 33, 65),
    makeBooth('B04', 'gold', 175, 570, 33, 65),
    makeBooth('B02', 'gold', 124, 654, 33, 65),
    makeBooth('B01', 'gold', 175, 654, 33, 65),

    // Gold & Teal (50m² Teal) - Right section (B11-B25)
    makeBooth('B11', 'gold', 509, 420, 65, 33),
    makeBooth('B12', 'gold', 592, 420, 65, 33),
    makeBooth('B13', 'gold', 675, 420, 65, 33),

    makeBooth('B16', 'gold', 509, 471, 65, 33),
    makeBooth('B15', 'gold', 592, 471, 65, 33),
    makeBooth('B14', 'gold', 675, 471, 65, 33),

    makeBooth('B17', 'gold', 509, 522, 65, 33),
    makeBooth('B18', 'gold', 592, 522, 65, 33),
    makeBooth('B19', 'gold', 675, 522, 65, 33),

    makeBooth('B22', 'gold', 509, 573, 65, 33),
    makeBooth('B21', 'gold', 592, 573, 65, 33),
    makeBooth('B20', 'gold', 675, 573, 65, 33),

    makeBooth('B23', 'gold', 509, 624, 65, 33),
    makeBooth('B24', 'gold', 592, 624, 65, 33),
    makeBooth('B25', 'gold', 675, 624, 65, 33),

    // Silver (25m² Orange, stacked pairs)
    makeBooth('B07', 'silver', 124, 404, 33, 66),
    makeBooth('B08', 'silver', 174, 405, 34, 65),
    makeBooth('B06', 'silver', 124, 488, 33, 64),
    makeBooth('B05', 'silver', 174, 488, 34, 64),

    // Green (30m²) - C01-C03, C05-C12, C16-C26
    makeBooth('C23', 'green', 340, 110, 41, 34),
    makeBooth('C24', 'green', 398, 110, 40, 34),

    makeBooth('C22', 'green', 283, 161, 40, 34),
    makeBooth('C21', 'green', 340, 161, 41, 34),
    makeBooth('C20', 'green', 398, 161, 40, 34),

    makeBooth('C16', 'green', 226, 213, 39, 33),
    makeBooth('C17', 'green', 283, 213, 40, 33),
    makeBooth('C18', 'green', 340, 213, 41, 33),
    makeBooth('C19', 'green', 398, 213, 40, 33),

    makeBooth('C12', 'green', 226, 264, 39, 34),
    makeBooth('C11', 'green', 284, 264, 39, 34),
    makeBooth('C10', 'green', 340, 264, 41, 34),
    makeBooth('C09', 'green', 398, 264, 40, 34),
    makeBooth('C25', 'green', 451, 264, 40, 34),

    makeBooth('C05', 'green', 225, 315, 40, 33),
    makeBooth('C06', 'green', 283, 315, 40, 33),
    makeBooth('C07', 'green', 340, 315, 41, 33),
    makeBooth('C08', 'green', 398, 315, 40, 33),
    makeBooth('C26', 'green', 451, 316, 40, 33),

    makeBooth('C03', 'green', 225, 417, 40, 34),
    makeBooth('C02', 'green', 226, 468, 39, 34),
    makeBooth('C01', 'green', 226, 519, 39, 34),

    // Light Purple (12m²) - D01-D10
    makeBooth('D05', 'lightPurple', 325, 405, 25, 19),
    makeBooth('D04', 'lightPurple', 325, 424, 25, 19),
    makeBooth('D03', 'lightPurple', 325, 443, 25, 19),
    makeBooth('D02', 'lightPurple', 325, 462, 25, 20),
    makeBooth('D01', 'lightPurple', 325, 481, 25, 20),

    makeBooth('D06', 'lightPurple', 396, 406, 26, 19),
    makeBooth('D07', 'lightPurple', 396, 425, 26, 19),
    makeBooth('D08', 'lightPurple', 396, 444, 26, 19),
    makeBooth('D09', 'lightPurple', 396, 463, 26, 19),
    makeBooth('D10', 'lightPurple', 396, 482, 26, 19),

    // Dark Purple (340m² L-shape)
    makeBooth('Q1', 'darkPurple', 111, 213, 97, 84, 'l-shape'),

    // Light Blue (20m²) - H1-H10
    makeBooth('H1', 'lightBlue', 479, 694, 35, 26),
    makeBooth('H2', 'lightBlue', 531, 694, 35, 26),
    makeBooth('H3', 'lightBlue', 582, 694, 34, 26),
    makeBooth('H4', 'lightBlue', 638, 694, 34, 26),
    makeBooth('H5', 'lightBlue', 690, 694, 34, 26),

    makeBooth('H6', 'lightBlue', 479, 735, 35, 27),
    makeBooth('H7', 'lightBlue', 531, 735, 34, 27),
    makeBooth('H8', 'lightBlue', 582, 735, 34, 26),
    makeBooth('H9', 'lightBlue', 638, 735, 36, 26),
    makeBooth('H10', 'lightBlue', 691, 735, 34, 26),
  ];
}
