import type { Decor, DecorTheme } from './types';

// Decor presets for the 3D view. Pure data so settings can use it without
// pulling in three.js.
export type ThemeStyle = {
  label: string;
  // place settings
  napkin: string;
  charger: string;
  // centrepiece
  centre: 'flowers' | 'balloons' | 'candles' | 'greenery';
  palette: string[];
  // room
  fairyLights: boolean;
  chandeliers: boolean;
  curtain: string;
  banner: (eventName: string) => string;
  sign: (eventName: string) => string;
};

export const THEMES: Record<DecorTheme, ThemeStyle> = {
  wedding: {
    label: 'Wedding',
    napkin: '#e9dcc9',
    charger: '#c9a96a',
    centre: 'flowers',
    palette: ['#f7f1ea', '#f2d7d9', '#e8b4bc', '#fbfaf7', '#d9c7a3'],
    fairyLights: true,
    chandeliers: true,
    curtain: '#f4efe6',
    banner: (n) => n,
    sign: (n) => `Welcome to\n${n}`,
  },
  birthday: {
    label: 'Birthday',
    napkin: '#f2c9a8',
    charger: '#d8b26a',
    centre: 'balloons',
    palette: ['#e8826f', '#f2c14e', '#7fb7be', '#f7f1ea', '#b48ead'],
    fairyLights: true,
    chandeliers: false,
    curtain: '#efe7da',
    banner: () => 'Happy Birthday',
    sign: (n) => `Welcome to\n${n}`,
  },
  party: {
    label: 'Family party',
    napkin: '#c9d8c0',
    charger: '#b9a47c',
    centre: 'flowers',
    palette: ['#f2c14e', '#e8826f', '#fbfaf7', '#9bc4a0', '#f2d7d9'],
    fairyLights: true,
    chandeliers: false,
    curtain: '#ece6da',
    banner: (n) => n,
    sign: (n) => `Welcome to\n${n}`,
  },
  corporate: {
    label: 'Corporate',
    napkin: '#2f3a4a',
    charger: '#8f8f8f',
    centre: 'greenery',
    palette: ['#5f7f5a', '#7f9a6c', '#4f6f4a'],
    fairyLights: false,
    chandeliers: true,
    curtain: '#d9d6d0',
    banner: (n) => n,
    sign: (n) => n,
  },
  minimal: {
    label: 'Minimal',
    napkin: '#e7e3dc',
    charger: '#d8d3ca',
    centre: 'candles',
    palette: ['#f7f1ea'],
    fairyLights: false,
    chandeliers: false,
    curtain: '#ece8e1',
    banner: () => '',
    sign: (n) => n,
  },
};

export const ACCENTS = ['#c8553d', '#b07aa1', '#3f6e8c', '#6f8f5c', '#c99a3c', '#2f2f35'];

export const DEFAULT_DECOR: Decor = { theme: 'wedding', accent: '#c99a3c' };

export const decorOf = (d: Decor | undefined): Decor => d ?? DEFAULT_DECOR;

