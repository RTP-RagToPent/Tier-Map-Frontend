/**
 * Search feature constants
 */

export const GENRES = [
  'ラーメン',
  'カフェ',
  '居酒屋',
  'イタリアン',
  '焼肉',
  '寿司',
  'ベーカリー',
  'スイーツ',
] as const;

export type Genre = (typeof GENRES)[number];
