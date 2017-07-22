export interface GaugeConfig {
  WIDTH: number;              // Width of the gauge (Use CSS in order to change)
  ARC_STROKE: number;         // Stroke/width of the arc
  ARROW_Y: number;            // Distance from the arc to the tip of the arrow (Y position)
  ARROW_WIDTH: number;        // Arrow width/stroke
  ARROW_PIN_RAD: number;      // Radius of the arrow pin
  SL_NORM: number;            // Length of a scale line
  SL_MID_SEP: number;         // Length of a middle separator (a.k.a. small)
  SL_SEP: number;             // Length of a separator (a.k.a. big)
  SL_WIDTH: number;           // Scale line width/stroke
  TXT_MARGIN: number;         // Y margin for a scale value
  LIGHT_Y: number;            // Light Y position
  LIGHT_RADIUS: number;       // Radius of the light
  S_FAC_Y: number;            // Scale factor text Y position
  DIGITAL_Y: number;          // Digital gauge Y position
  UNIT_Y: number;             // Unit label Y position
  MAX_PURE_SCALE_VAL: number; // Max pure scale value (After that the scale shows only the multiplier)
  INIT_LINE_FREQ: number;     // Initial scale line frequency
  DEF_START: number;          // Default start angle (Use the input property in order to change)
  DEF_END: number;            // Default end angle (Use the input property in order to change)
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
