export const GROUP_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
] as const;

export const MEDAL_COLORS = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  platinum: '#E5E4E2',
  ruby: '#E0115F',
  emerald: '#50C878',
  sapphire: '#0F52BA',
  amethyst: '#9966CC',
} as const;

export const ATTENDANCE_COLORS = {
  present: '#40C057',
  absent: '#FA5252',
  excused: '#FD7E14',
  late: '#FAB005',
  unmarked: '#ADB5BD',
} as const;

export const LEVEL_COLORS = [
  '#ADB5BD',
  '#74C0FC',
  '#63E6BE',
  '#69DB7C',
  '#A9E34B',
  '#FFD43B',
  '#FF922B',
  '#FF6B6B',
  '#DA77F2',
  '#845EF7',
] as const;

export function getLevelColor(level: number): string {
  const index = Math.min(Math.floor(level / 10), LEVEL_COLORS.length - 1);
  return LEVEL_COLORS[index] ?? LEVEL_COLORS[0]!;
}
