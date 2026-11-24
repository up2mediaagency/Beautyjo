import { Booth, LayoutId } from '../types';
import { createInitialBooths, MAP_HEIGHT, MAP_WIDTH } from './booths';
import {
  createRamadanBooths,
  RAMADAN_FLOOR_COLOR,
  RAMADAN_MAP_HEIGHT,
  RAMADAN_MAP_WIDTH,
} from './ramadanBooths';

export interface FloorPlanLayoutConfig {
  id: LayoutId;
  tabLabelAr: string;
  titleAr: string;
  subtitleAr: string;
  imageSrc: string;
  width: number;
  height: number;
  floorFillColor: string;
  storageKey: string;
  labelsStorageKey: string;
  exportFilePrefix: string;
  createInitialBooths: () => Booth[];
}

export const FLOOR_PLAN_LAYOUTS: Record<LayoutId, FloorPlanLayoutConfig> = {
  beauty27: {
    id: 'beauty27',
    tabLabelAr: 'مخطط بيوتي الأردن 27',
    titleAr: 'مخطط بيوتي الأردن 27',
    subtitleAr: 'محرر المخطط التفاعلي لتوزيع الأجنحة والعارضين',
    imageSrc: '/floorplan2.jpg',
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    floorFillColor: '#ffffff',
    storageKey: 'beauty-jordan-27-booths-v1',
    labelsStorageKey: 'beauty-jordan-27-show-labels-v1',
    exportFilePrefix: 'beauty-jordan-27-floorplan',
    createInitialBooths,
  },
  ramadan59: {
    id: 'ramadan59',
    tabLabelAr: 'مخطط أهلاً رمضان (59 جناح)',
    titleAr: 'أهلاً رمضان - قاعات عمان الكبرى',
    subtitleAr: 'مخطط المعرض التفاعلي (Total Booth No.=59 Option 1)',
    imageSrc: '/page2.jpg',
    width: RAMADAN_MAP_WIDTH,
    height: RAMADAN_MAP_HEIGHT,
    floorFillColor: RAMADAN_FLOOR_COLOR,
    storageKey: 'ahlan-ramadan-59-booths-v1',
    labelsStorageKey: 'ahlan-ramadan-59-show-labels-v1',
    exportFilePrefix: 'ahlan-ramadan-59-floorplan',
    createInitialBooths: createRamadanBooths,
  },
};
