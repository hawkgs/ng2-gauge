import { GaugeConfig } from './config';

export interface CartesianCoor {
  x: number;
  y: number;
}

export interface Line {
  from: CartesianCoor;
  to: CartesianCoor;
  color: string;
}

export interface Value {
  coor: CartesianCoor;
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
  arcStart: number;
  arcEnd: number;
  max: number;
  sectors: Sector[];
  unit: string;
  digitalDisplay: boolean;
  activateRedLightAfter: number;
  darkTheme: boolean;
  config: GaugeConfig;
}

export enum Separator {
  NA,
  Big,
  Small,
}
