import { Booth, BoothZone, ZoneMeta } from '../types';

export const MAP_WIDTH = 791;
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
    makeBooth('A03', 'diamond', 329, 725, 67, 67),

    // Platinum (60m² Yellow)
    makeBooth('A01', 'platinum', 212, 800, 49, 66),
    makeBooth('A02', 'platinum', 276, 800, 49, 66),

    // Gold & Teal (50m² Teal) - Left section (B01-B04)
    makeBooth('B03', 'gold', 100, 571, 34, 66),
    makeBooth('B04', 'gold', 152, 571, 33, 66),
    makeBooth('B02', 'gold', 100, 656, 34, 65),
    makeBooth('B01', 'gold', 152, 656, 33, 65),

    // Gold & Teal (50m² Teal) - Right section (B11-B25)
    makeBooth('B11', 'gold', 489, 419, 66, 33),
    makeBooth('B12', 'gold', 573, 419, 66, 33),
    makeBooth('B13', 'gold', 657, 419, 66, 33),

    makeBooth('B16', 'gold', 489, 470, 66, 34),
    makeBooth('B15', 'gold', 573, 470, 66, 34),
    makeBooth('B14', 'gold', 657, 470, 66, 34),

    makeBooth('B17', 'gold', 489, 522, 66, 34),
    makeBooth('B18', 'gold', 573, 522, 66, 34),
    makeBooth('B19', 'gold', 657, 522, 66, 34),

    makeBooth('B22', 'gold', 489, 574, 66, 33),
    makeBooth('B21', 'gold', 573, 574, 66, 33),
    makeBooth('B20', 'gold', 657, 574, 66, 33),

    makeBooth('B23', 'gold', 489, 625, 66, 34),
    makeBooth('B24', 'gold', 573, 626, 66, 33),
    makeBooth('B25', 'gold', 657, 625, 66, 34),

    // Silver (25m² Orange, stacked pairs)
    makeBooth('B07', 'silver', 100, 404, 34, 66),
    makeBooth('B08', 'silver', 151, 404, 35, 66),
    makeBooth('B06', 'silver', 100, 487, 34, 66),
    makeBooth('B05', 'silver', 151, 487, 34, 66),

    // Green (30m²) - C01-C03, C05-C12, C16-C26
    makeBooth('C23', 'green', 319, 106, 41, 34),
    makeBooth('C24', 'green', 377, 106, 41, 34),

    makeBooth('C22', 'green', 262, 158, 40, 34),
    makeBooth('C21', 'green', 319, 158, 41, 34),
    makeBooth('C20', 'green', 377, 158, 41, 34),

    makeBooth('C16', 'green', 202, 209, 41, 33),
    makeBooth('C17', 'green', 261, 209, 41, 34),
    makeBooth('C18', 'green', 319, 209, 41, 34),
    makeBooth('C19', 'green', 377, 209, 41, 33),

    makeBooth('C12', 'green', 203, 261, 40, 34),
    makeBooth('C11', 'green', 261, 261, 41, 34),
    makeBooth('C10', 'green', 319, 261, 41, 34),
    makeBooth('C09', 'green', 377, 261, 41, 34),
    makeBooth('C25', 'green', 431, 261, 40, 34),

    makeBooth('C05', 'green', 202, 312, 41, 34),
    makeBooth('C06', 'green', 261, 312, 41, 34),
    makeBooth('C07', 'green', 319, 312, 41, 34),
    makeBooth('C08', 'green', 377, 312, 41, 34),
    makeBooth('C26', 'green', 431, 313, 40, 34),

    makeBooth('C03', 'green', 203, 416, 40, 34),
    makeBooth('C02', 'green', 203, 468, 40, 34),
    makeBooth('C01', 'green', 203, 519, 40, 34),

    // Light Purple (12m²) - D01-D10
    makeBooth('D05', 'lightPurple', 303, 404, 25, 19),
    makeBooth('D04', 'lightPurple', 303, 423, 25, 19),
    makeBooth('D03', 'lightPurple', 303, 442, 25, 19),
    makeBooth('D02', 'lightPurple', 303, 461, 25, 19),
    makeBooth('D01', 'lightPurple', 303, 480, 25, 20),

    makeBooth('D06', 'lightPurple', 376, 404, 25, 19),
    makeBooth('D07', 'lightPurple', 376, 423, 25, 19),
    makeBooth('D08', 'lightPurple', 376, 442, 25, 19),
    makeBooth('D09', 'lightPurple', 376, 461, 25, 19),
    makeBooth('D10', 'lightPurple', 376, 480, 25, 20),

    // Dark Purple (340m² L-shape)
    makeBooth('Q1', 'darkPurple', 87, 210, 98, 85, 'l-shape'),

    // Light Blue (20m²) - H1-H10
    makeBooth('H1', 'lightBlue', 460, 696, 35, 26),
    makeBooth('H2', 'lightBlue', 512, 696, 35, 26),
    makeBooth('H3', 'lightBlue', 563, 696, 35, 26),
    makeBooth('H4', 'lightBlue', 620, 696, 35, 26),
    makeBooth('H5', 'lightBlue', 672, 696, 35, 26),

    makeBooth('H6', 'lightBlue', 460, 738, 35, 26),
    makeBooth('H7', 'lightBlue', 511, 738, 35, 26),
    makeBooth('H8', 'lightBlue', 563, 737, 35, 27),
    makeBooth('H9', 'lightBlue', 620, 738, 36, 26),
    makeBooth('H10', 'lightBlue', 673, 737, 35, 27),
  ];
}
