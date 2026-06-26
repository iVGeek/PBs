export const distMap: Record<string, string> = {
  '5K': '5K',
  '10K': '10K',
  '15K': '15K',
  '21K': '21K (Half Marathon)',
  '30K': '30K',
  '35K': '35K',
  '42K': '42K (Marathon)',
  '21.097': '21K (Half Marathon)',
  '42.195': '42K (Marathon)',
  '50K': '50K Ultra',
};

export const distanceOptions = ['5K', '10K', '15K', '21K', '30K', '35K', '42K', '50K'];

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
  return `${min}:${String(sec).padStart(2, '0')}/km`;
}

export function paceToSeconds(pace: string): number {
  const clean = pace.replace(/[^0-9:.]/g, '');
  const parts = clean.split(':');
  if (parts.length !== 2) return 0;
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
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
