export interface GaugeConfig {
  WIDTH?: number;
  ARC_STROKE?: number;
  ARROW_Y?: number;
  ARROW_WIDTH?: number;
  ARROW_PIN_RAD?: number;
  SL_NORM?: number;
  SL_MID_SEP?: number;
  SL_SEP?: number;
  SL_WIDTH?: number;
  TXT_MARGIN?: number;
  LIGHT_Y?: number;
  LIGHT_RADIUS?: number;
  S_FAC_Y?: number;
  DIGITAL_Y?: number;
  UNIT_Y?: number;
  MAX_PURE_SCALE_VAL?: number;
  INIT_LINE_FREQ?: number;
  DEF_START?: number;
  DEF_END?: number;
}

export const Config: GaugeConfig = {
  WIDTH: 200,
  ARC_STROKE: 5,
  ARROW_Y: 22.5,
  ARROW_WIDTH: 4,
  ARROW_PIN_RAD: 8,
  SL_NORM: 3,
  SL_MID_SEP: 7,
  SL_SEP: 10,
  SL_WIDTH: 2,
  TXT_MARGIN: 10,
  LIGHT_Y: 55,
  LIGHT_RADIUS: 10,
  S_FAC_Y: 80,
  DIGITAL_Y: 145,
  UNIT_Y: 155,
  MAX_PURE_SCALE_VAL: 1000,
  INIT_LINE_FREQ: 2,
  DEF_START: 225,
  DEF_END: 135
};
