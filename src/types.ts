export type LayoutId = 'beauty27' | 'ramadan59';

export type BoothZone =
  | 'diamond'
  | 'platinum'
  | 'gold'
  | 'silver'
  | 'green'
  | 'lightPurple'
  | 'darkPurple'
  | 'lightBlue'
  | 'ramadanStandard'
  | 'ramadanGold'
  | 'ramadanDiamond'
  | 'ramadanSilver'
  | 'ramadanLobby'
  | 'ramadanEntrance';

export type DisplayMode = 'both' | 'logo' | 'name';
export type LogoAlign = 'center' | 'top' | 'bottom' | 'right' | 'left';
export type FilterStatus = 'all' | 'reserved' | 'available';

export interface ZoneMeta {
  id: BoothZone;
  nameAr: string;
  areaLabel: string;
  color: string;
  textColor: string;
}

export interface Booth {
  id: string;
  code: string;
  zone: BoothZone;
  areaLabel: string;
  color: string;
  textColor: string;
  shape: 'rect' | 'l-shape';
  defaultX: number;
  defaultY: number;
  defaultW: number;
  defaultH: number;
  x: number;
  y: number;
  w: number;
  h: number;
  exhibitorName: string;
  logoDataUrl: string | null;
  logoScale: number;
  logoAlign: LogoAlign;
  displayMode: DisplayMode;
  hideCode?: boolean;
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  pos: number;
}
