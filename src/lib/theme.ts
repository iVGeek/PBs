import { browser } from '$app/environment';

const THEME_KEY = 'mh_theme';
const FONT_KEY = 'mh_font';

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

export function applyTheme(): void {
  if (!browser) return;
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved ? JSON.parse(saved) : themes[0];
  document.body.className = theme.bodyClass;
}

export function getTheme() {
  if (!browser) return themes[0];
  const saved = localStorage.getItem(THEME_KEY);
  return saved ? JSON.parse(saved) : themes[0];
}

export function setTheme(theme: (typeof themes)[number]) {
  if (!browser) return;
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  document.body.className = theme.bodyClass;
}

export function applyFont(): void {
  if (!browser) return;
  const saved = localStorage.getItem(FONT_KEY);
  const font = saved ? JSON.parse(saved) : fonts[0];
  document.body.style.setProperty('--font-family', font.value);
}

export function getFont() {
  if (!browser) return fonts[0];
  const saved = localStorage.getItem(FONT_KEY);
  return saved ? JSON.parse(saved) : fonts[0];
}

export function setFont(font: (typeof fonts)[number]) {
  if (!browser) return;
  localStorage.setItem(FONT_KEY, JSON.stringify(font));
  document.body.style.setProperty('--font-family', font.value);
}
