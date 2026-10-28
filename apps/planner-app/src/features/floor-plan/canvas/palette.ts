import { resolvedTheme, useTheme } from '@/lib/theme';
import type { ElementKind, TableFinish } from '@/domain/types';

// Canvas can't read CSS variables, so the editor keeps its own palette that
// mirrors the tokens in index.css.
const light = {
  outside: '#f7f7f7',
  dot: 'rgba(0, 0, 0, 0.12)',
  room: '#ffffff',
  roomStroke: '#e4e4e4',
  roomShadow: 'rgba(30, 25, 20, 0.08)',
  chair: '#ffffff',
  chairStroke: '#d6d3cd',
  chairTaken: '#eef3ff',
  chairTakenStroke: '#7d9bf0',
  chairHidden: 'rgba(0,0,0,0.05)',
  text: '#26231f',
  textMuted: '#8a857c',
  select: '#3b6cf0',
  guide: '#f0577a',
  dropTarget: '#3b6cf0',
  shadow: 'rgba(30, 25, 20, 0.18)',
};

const dark: typeof light = {
  outside: '#0a0a0a',
  dot: 'rgba(255, 255, 255, 0.07)',
  room: '#141414',
  roomStroke: '#262626',
  roomShadow: 'rgba(0,0,0,0.6)',
  chair: '#1f1f1f',
  chairStroke: '#3a3a3a',
  chairTaken: '#2a3552',
  chairTakenStroke: '#7d9bf0',
  chairHidden: 'rgba(255,255,255,0.04)',
  text: '#f1efeb',
  textMuted: '#9a958c',
  select: '#7d9bf0',
  guide: '#f0577a',
  dropTarget: '#7d9bf0',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export type Palette = typeof light;

export const FINISHES: Record<TableFinish, { label: string; light: string; dark: string; stroke: string }> = {
  linen: { label: 'White linen', light: '#fbfaf7', dark: '#d9d6cf', stroke: '#dcd8d0' },
  ivory: { label: 'Ivory', light: '#f3ead8', dark: '#cfc3a6', stroke: '#ddd0b4' },
  sage: { label: 'Sage', light: '#dfe7d8', dark: '#a8b79b', stroke: '#c3cfb8' },
  oak: { label: 'Oak', light: '#d9b98f', dark: '#b8956a', stroke: '#c39f72' },
  walnut: { label: 'Walnut', light: '#8a6446', dark: '#7a573c', stroke: '#6f4f37' },
};

export const ELEMENT_STYLE: Record<ElementKind, { fill: string; darkFill: string; stroke: string; text: string }> = {
  stage: { fill: '#3a3733', darkFill: '#4a4641', stroke: '#2a2724', text: '#f5f2ec' },
  'dance-floor': { fill: '#efe9df', darkFill: '#3a3530', stroke: '#d8cfc0', text: '#7a6f5f' },
  bar: { fill: '#c9a37a', darkFill: '#8a6d50', stroke: '#a8845e', text: '#3d2e1f' },
  buffet: { fill: '#f1ece3', darkFill: '#3b3732', stroke: '#d9d1c3', text: '#6f665a' },
  dj: { fill: '#55514b', darkFill: '#5d5953', stroke: '#3f3c37', text: '#f5f2ec' },
  entrance: { fill: '#c7d7f5', darkFill: '#36456a', stroke: '#8fa9e0', text: '#2e4580' },
  pillar: { fill: '#dcd8d1', darkFill: '#4a4743', stroke: '#c6c1b8', text: '#6f665a' },
  plant: { fill: '#b9cfa6', darkFill: '#4f6544', stroke: '#93ad7f', text: '#3e5530' },
  cake: { fill: '#f6e9ee', darkFill: '#4a3a40', stroke: '#e3c4cf', text: '#8a4d63' },
  gifts: { fill: '#f3ede2', darkFill: '#3d3830', stroke: '#ddd2bf', text: '#7a6a50' },
  sign: { fill: '#efe6d6', darkFill: '#3e3a33', stroke: '#c9b796', text: '#6b5a3a' },
  'photo-booth': { fill: '#ece6f5', darkFill: '#3b3548', stroke: '#cfc3e6', text: '#5d4a85' },
  lounge: { fill: '#e7e2da', darkFill: '#36332f', stroke: '#cfc7ba', text: '#6a6156' },
};

export function usePalette(): { p: Palette; dark: boolean } {
  const theme = useTheme((s) => s.theme);
  const isDark = resolvedTheme(theme) === 'dark';
  return { p: isDark ? dark : light, dark: isDark };
}
