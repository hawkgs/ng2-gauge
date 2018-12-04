import { GaugeConfig } from './config';

export interface Cartesian {
  x: number;
  y: number;
}

export interface Line {
  from: Cartesian;
  to: Cartesian;
  color: string;
}

export interface Value {
  coor: Cartesian;
  text: string;
}

export interface Sector {
  from: number;
  to: number;
  color: string;
}

export interface RenderSector {
  path: string;
  color: string;
}

export interface GaugeProps {
  start: number;
  end: number;
  max: number;
  sectors: Sector[];
  unit: string;
  showDigital: boolean;
  light: number;
  lightTheme: boolean;
  factor: number;
  config: GaugeConfig;
}

export enum Separator {
  NA,
  Big,
  Small,
}
