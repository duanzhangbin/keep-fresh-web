export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  settings?: Settings;
}

export interface Settings {
  userId: string;
  reminderThreshold: number;
  reminderTime: string;
  pushEnabled: boolean;
}

export interface Item {
  id: string;
  userId: string;
  name: string;
  prodDate?: string;
  expDate?: string;
  category: string;
  location: string;
  status: number;
  imagePath?: string;
  openDate?: string;
  shelfLifeAfterOpen?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  icon?: string;
  color?: string;
  itemCount?: number;
}

export interface Location {
  id: string;
  userId?: string;
  name: string;
  icon?: string;
  color?: string;
  itemCount?: number;
}

export interface ItemRecognition {
  name: string;
  prod_date: string;
  exp_date: string;
  category: string;
  shelf_life_after_open?: number;
}

export const CATEGORIES = ['食品', '药品', '美妆', '其它'] as const;
export const LOCATIONS = ['冰箱', '冷冻', '储物柜', '医药箱'] as const;
export const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: '正常', color: 'success' },
  1: { label: '已开封', color: 'info' },
  2: { label: '已消耗', color: 'textSecondary' },
  3: { label: '已丢弃', color: 'textSecondary' },
};

export const DEFAULT_CATEGORIES = [
  { name: '食品', icon: '🍎', color: '#4CAF50' },
  { name: '药品', icon: '💊', color: '#2196F3' },
  { name: '美妆', icon: '💄', color: '#E91E63' },
  { name: '其它', icon: '📦', color: '#9E9E9E' },
] as const;

export const DEFAULT_LOCATIONS = [
  { name: '冰箱', icon: '🧊', color: '#2196F3' },
  { name: '冷冻', icon: '❄️', color: '#03A9F4' },
  { name: '储物柜', icon: '📦', color: '#8D6E63' },
  { name: '医药箱', icon: '💊', color: '#F44336' },
] as const;

export const CATEGORY_ICONS = ['🍎', '🥛', '🥩', '🧀', '🍪', '🍞', '🥚', '💊', '🩹', '🌿', '💄', '🧴', '🧼', '💅', '📦', '🎒', '📱', '🔧', '🧸', '📚'];

export const LOCATION_ICONS = ['🧊', '🥬', '🥩', '🥛', '❄️', '🐟', '🦐', '📦', '🗄️', '🛒', '💊', '🚑', '🧸', '📚', '👕', '👟'];

export const TAG_COLORS = [
  { name: '绿色', value: '#4CAF50' },
  { name: '蓝色', value: '#2196F3' },
  { name: '橙色', value: '#FF9800' },
  { name: '红色', value: '#F44336' },
  { name: '粉色', value: '#E91E63' },
  { name: '紫色', value: '#9C27B0' },
  { name: '灰色', value: '#9E9E9E' },
  { name: '棕色', value: '#8D6E63' },
];
