export const distMap: Record<string, string> = {
  '5K': '5K',
  '10K': '10K',
  '15K': '15K',
  '21K': 'Half Marathon',
  '30K': '30K',
  '35K': '35K',
  '42K': 'Marathon',
  '21.097': 'Half Marathon',
  '42.195': 'Marathon',
  '50K': 'Ultra',
};

export const distEmoji: Record<string, string> = {
  '5K': '🏃',
  '10K': '🏃‍♂️',
  '15K': '🏃‍♀️',
  '21K': '🏅',
  '30K': '🔥',
  '35K': '💪',
  '42K': '🏆',
  '50K': '⚡',
};

export const distanceOptions = ['5K', '10K', '15K', '21K', '30K', '35K', '42K', '50K'];

export const distanceKm: Record<string, number> = {
  '5K': 5, '10K': 10, '15K': 15, '21K': 21.0975,
  '30K': 30, '35K': 35, '42K': 42.195, '50K': 50,
};

export function secondsToTime(s: number): string {
  const hrs = Math.floor(s / 3600);
  const min = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (hrs > 0) return `${hrs}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

export function secondsToPace(s: number): string {
  if (s <= 0) return '--:--';
  const min = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

export function paceToSeconds(pace: string): number {
  const clean = pace.replace(/[^0-9:.]/g, '');
  const parts = clean.split(':');
  if (parts.length !== 2) return 0;
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

export function totalDistanceKm(medals: { distance: string; timeSeconds: number }[]): number {
  let total = 0;
  for (const m of medals) {
    const km = distanceKm[m.distance] ?? parseFloat(m.distance);
    if (!isNaN(km)) total += km;
  }
  return Math.round(total * 100) / 100;
}

export function racesByYear(medals: { eventDate: string }[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const m of medals) {
    const y = new Date(m.eventDate).getFullYear().toString();
    map[y] = (map[y] || 0) + 1;
  }
  return map;
}

export function timelineGroups(medals: any[]): { year: string; races: any[] }[] {
  const map = new Map<string, any[]>();
  const sorted = [...medals].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  for (const m of sorted) {
    const y = new Date(m.eventDate).getFullYear().toString();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(m);
  }
  return Array.from(map.entries()).map(([year, races]) => ({ year, races }));
}

export interface Achievement {
  id: string;
  icon: string;
  label: string;
  description: string;
  unlocked: boolean;
}

export function computeAchievements(medals: { distance: string; timeSeconds: number; eventDate: string }[]): Achievement[] {
  const distCounts = new Map<string, number>();
  const distBests = new Map<string, number>();
  const years = new Set<number>();
  let totalKm = 0;

  for (const m of medals) {
    distCounts.set(m.distance, (distCounts.get(m.distance) || 0) + 1);
    const best = distBests.get(m.distance);
    if (!best || m.timeSeconds < best) distBests.set(m.distance, m.timeSeconds);
    years.add(new Date(m.eventDate).getFullYear());
    const km = distanceKm[m.distance] ?? parseFloat(m.distance);
    if (!isNaN(km)) totalKm += km;
  }

  totalKm = Math.round(totalKm * 10) / 10;
  const count = medals.length;

  const achievements: Achievement[] = [
    { id: 'first-steps', icon: '👟', label: 'First Steps', description: 'Complete your first race', unlocked: count >= 1 },
    { id: 'runner-5k', icon: '🏃', label: '5K Runner', description: 'Complete a 5K', unlocked: (distCounts.get('5K') || 0) >= 1 },
    { id: 'runner-10k', icon: '🏃‍♂️', label: '10K Runner', description: 'Complete a 10K', unlocked: (distCounts.get('10K') || 0) >= 1 },
    { id: 'half-warrior', icon: '🏅', label: 'Half Warrior', description: 'Complete a Half Marathon', unlocked: (distCounts.get('21K') || 0) >= 1 },
    { id: 'marathon-legend', icon: '🏆', label: 'Marathon Legend', description: 'Complete a Marathon', unlocked: (distCounts.get('42K') || 0) >= 1 },
    { id: 'ultra-beast', icon: '⚡', label: 'Ultra Beast', description: 'Complete an Ultra', unlocked: (distCounts.get('50K') || 0) >= 1 },
    { id: 'sub20-5k', icon: '⏱️', label: 'Speed Demon', description: 'Sub-20 minute 5K', unlocked: (distBests.get('5K') || Infinity) < 1200 },
    { id: 'sub40-10k', icon: '⚡', label: '10K Rocket', description: 'Sub-40 minute 10K', unlocked: (distBests.get('10K') || Infinity) < 2400 },
    { id: 'sub90-half', icon: '🚀', label: 'Half Sub-90', description: 'Sub-1:30 Half Marathon', unlocked: (distBests.get('21K') || Infinity) < 5400 },
    { id: 'sub3-marathon', icon: '👑', label: 'Sub-3 Marathon', description: 'Sub-3:00 Marathon', unlocked: (distBests.get('42K') || Infinity) < 10800 },
    { id: 'five-races', icon: '🎖️', label: '5 Race Club', description: 'Complete 5 races', unlocked: count >= 5 },
    { id: 'ten-races', icon: '🌟', label: '10 Race Club', description: 'Complete 10 races', unlocked: count >= 10 },
    { id: 'twenty-five', icon: '💎', label: '25 Race Club', description: 'Complete 25 races', unlocked: count >= 25 },
    { id: '100km', icon: '📏', label: '100K Club', description: 'Race 100km total', unlocked: totalKm >= 100 },
    { id: '500km', icon: '🌍', label: '500K Club', description: 'Race 500km total', unlocked: totalKm >= 500 },
    { id: 'multi-year', icon: '📅', label: 'Multi-Year Runner', description: 'Race in 2+ different years', unlocked: years.size >= 2 },
    { id: 'five-year', icon: '🏛️', label: '5 Year Runner', description: 'Race across 5+ years', unlocked: years.size >= 5 },
  ];

  return achievements;
}

export function filterMedals(
  medals: any[],
  search: string,
  distFilter: string,
  yearFilter: string
): any[] {
  let result = medals;
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(m => m.raceName.toLowerCase().includes(q));
  }
  if (distFilter) {
    result = result.filter(m => m.distance === distFilter);
  }
  if (yearFilter) {
    result = result.filter(m => new Date(m.eventDate).getFullYear().toString() === yearFilter);
  }
  return result;
}

export function getYears(medals: { eventDate: string }[]): string[] {
  const years = new Set<string>();
  for (const m of medals) {
    years.add(new Date(m.eventDate).getFullYear().toString());
  }
  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

export function computePBs(medals: { distance: string; timeSeconds: number }[]): Map<string, any> {
  const bestMap = new Map<string, any>();
  for (const m of medals) {
    const existing = bestMap.get(m.distance);
    if (!existing || m.timeSeconds < existing.timeSeconds) {
      bestMap.set(m.distance, m);
    }
  }
  return bestMap;
}

export const themes = [
  { name: 'Obsidian', bodyClass: 'theme-obsidian', accent: '#a78bfa' },
  { name: 'Midnight', bodyClass: 'theme-midnight', accent: '#60a5fa' },
  { name: 'Emerald', bodyClass: 'theme-emerald', accent: '#34d399' },
  { name: 'Ruby', bodyClass: 'theme-ruby', accent: '#f87171' },
  { name: 'Amber', bodyClass: 'theme-amber', accent: '#fbbf24' },
  { name: 'Ocean', bodyClass: 'theme-ocean', accent: '#22d3ee' },
  { name: 'Rose', bodyClass: 'theme-rose', accent: '#fb7185' },
  { name: 'Frost', bodyClass: 'theme-frost', accent: '#67e8f9' },
  { name: 'Lavender', bodyClass: 'theme-lavender', accent: '#c4b5fd' },
  { name: 'Crimson', bodyClass: 'theme-crimson', accent: '#f43f5e' },
  { name: 'Forest', bodyClass: 'theme-forest', accent: '#4ade80' },
  { name: 'Sunset', bodyClass: 'theme-sunset', accent: '#fb923c' },
  { name: 'Platinum', bodyClass: 'theme-platinum', accent: '#e2e8f0' },
  { name: 'Steel', bodyClass: 'theme-steel', accent: '#94a3b8' },
  { name: 'Amethyst', bodyClass: 'theme-amethyst', accent: '#a78bfa' },
  { name: 'Coral', bodyClass: 'theme-coral', accent: '#fdba74' },
  { name: 'Slate', bodyClass: 'theme-slate', accent: '#64748b' },
  { name: 'Violet', bodyClass: 'theme-violet', accent: '#8b5cf6' },
];

export const fonts = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'System UI', value: 'system-ui, sans-serif' },
];
