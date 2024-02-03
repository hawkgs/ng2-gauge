import {
  Component,
  Input,
  ViewChild,
  OnInit,
  AfterViewInit,
  Renderer2,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';

import {
  Sector,
  Line,
  CartesianCoor,
  RenderSector,
  Value,
  Separator,
  GaugeProps,
} from './shared/interfaces';
import { DefaultConfig, GaugeConfig } from './shared/config';
import { validate } from './shared/validators';

function copySectors(sectors: Sector[]): Sector[] {
  return sectors.map((s) => ({ ...s }));
}

@Component({
  selector: 'ng2-gauge',
  templateUrl: './gauge.component.html',
  styleUrl: './gauge.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class GaugeComponent implements OnInit, AfterViewInit, GaugeProps {
  @ViewChild('gauge') gauge!: ElementRef;
  @ViewChild('arrow') arrow!: ElementRef;

  /**
   * Size/width of the gauge _in pixels_.
   */
  @Input() size!: number;

  /**
   * The start/beginning of the scale arc _in degrees_. Default `225`
   */
  @Input() arcStart!: number;

  /**
   * The end of the scale arc _in degrees_. Default: `135`
   */
  @Input() arcEnd!: number;

  /**
   * Defines the coloring of specified sectors
   */
  @Input() sectors!: Sector[];

  /**
   * The unit of the gauge (i.e. mph, psi, etc.)
   */
  @Input() unit!: string;

  /**
   * Displays the current value as digital number inside the gauge
   */
  @Input() digitalDisplay!: boolean;

  /**
   * Shows a red light when the specified limit is reached
   */
  @Input() activateRedLightAfter!: number;

  /**
   * Enables the dark theme
   */
  @Input() darkTheme!: boolean;

  /**
   * _(Not recommended)_ Alters the default configuration; This may lead to unexpected behavior; [GaugeConfig](./src/app/gauge/shared/config.ts)
   */
  @Input() config!: GaugeConfig;

  viewBox: string = '';
  scaleLines: Line[] = [];
  scaleValues: Value[] = [];
  sectorArcs: RenderSector[] = [];

  radius: number = 0;
  center: number = 0;
  scaleFactor: number = 0;

  private _arcEnd: number = 0;
  private _input: number = 0;
  private _max: number = 0;
  private _mappedSectors: Sector[] = [];

  constructor(private _renderer: Renderer2) {}

  /**
   * The current value of the gauge
   */
  @Input({ required: true })
  set input(val: number) {
    this._input = Math.min(val, this._max);
    this._updateArrowPos(this._input);
  }

  get input(): number {
    return this._input;
  }

  /**
   * The maximal value of the gauge. It is suggested to use a number that is divisible by 10^n (e.g. 100, 1000, etc.)
   */
  @Input({ required: true })
  set max(val: number) {
    if (this._max) {
      this._max = val;
      this._initialize();
    }
    this._max = val;
  }

  get max(): number {
    return this._max;
  }

  get arc(): string {
    return this._arc(0, this._arcEnd);
  }

  get gaugeRotationAngle(): number {
    return this._arcEnd - this.arcEnd;
  }

  ngOnInit(): void {
    this.config = { ...DefaultConfig, ...this.config };

    if (!this.arcStart) {
      this.arcStart = this.config.DEF_START;
    }
    if (!this.arcEnd) {
      this.arcEnd = this.config.DEF_END;
    }

    validate(this);

    const width = this.config.WIDTH + this.config.ARC_STROKE;

    this.viewBox = `0 0 ${width} ${width}`;
    this.radius = this.config.WIDTH / 2;
    this.center = width / 2;
    this._arcEnd = this.arcEnd;

    if (this.arcStart > this.arcEnd) {
      this._arcEnd += 360 - this.arcStart;
    } else {
      this._arcEnd -= this.arcStart;
    }

    this._initialize();
  }

  ngAfterViewInit(): void {
    this._rotateGauge();
  }

  /**
   * Initialize gauge.
   */
  private _initialize() {
    this.scaleLines = [];
    this.scaleValues = [];

    this._calculateSectors();
    this._updateArrowPos(this._input);
    this.scaleFactor = this._determineScaleFactor();
    this._createScale();
  }

  /**
   * Calculate arc.
   */
  private _arc(start: number, end: number): string {
    const largeArc = end - start <= 180 ? 0 : 1;
    const startCoor = this._getAngleCoor(start);
    const endCoor = this._getAngleCoor(end);

    return `M ${endCoor.x} ${endCoor.y} A ${this.radius} ${this.radius} 0 ${largeArc} 0 ${startCoor.x} ${startCoor.y}`;
  }

  /**
   * Get angle coordinates (Cartesian coordinates).
   */
  private _getAngleCoor(degrees: number): CartesianCoor {
    const rads = ((degrees - 90) * Math.PI) / 180;
    return {
      x: this.radius * Math.cos(rads) + this.center,
      y: this.radius * Math.sin(rads) + this.center,
    };
  }

  /**
   * Calculate/translate the user-defined sectors to arcs.
   */
  private _calculateSectors(): void {
    if (!this.sectors) {
      return;
    }

    this._mappedSectors = copySectors(this.sectors);
    this._mappedSectors.forEach((s: Sector) => {
      const ratio = this._arcEnd / this.max;
      s.from *= ratio;
      s.to *= ratio;
    });

    this.sectorArcs = this._mappedSectors.map((s: Sector) => ({
      path: this._arc(s.from, s.to),
      color: s.color,
    }));
  }

  /**
   * Update the position of the arrow based on the input.
   */
  private _updateArrowPos(input: number): void {
    if (!this.arrow) {
      return;
    }

    const pos = (this._arcEnd / this.max) * input;
    this._renderer.setStyle(
      this.arrow.nativeElement,
      'transform',
      `rotate(${pos}deg)`,
    );
  }

  /**
   * Rotate the gauge based on the start property. The CSS rotation, saves additional calculations with SVG.
   */
  private _rotateGauge(): void {
    if (!this.gauge) {
      return;
    }

    const angle = 360 - this.arcStart;
    this._renderer.setStyle(
      this.gauge.nativeElement,
      'transform',
      `rotate(-${angle}deg)`,
    );
  }

  /**
   * Determine the scale factor (10^n number; i.e. if max = 9000 then scale_factor = 1000)
   */
  private _determineScaleFactor(factor = 10): number {
    // Keep smaller factor until 3X
    if (this.max / factor > 30) {
      return this._determineScaleFactor(factor * 10);
    }
    return factor;
  }

  /**
   * Determine the line frequency which represents after what angle we should put a line.
   */
  private _determineLineFrequency(): number {
    const separators = this.max / this.scaleFactor;
    const separateAtAngle = this._arcEnd / separators;
    let lineFrequency: number;

    // If separateAtAngle is not an integer, use its value as the line frequency.
    if (separateAtAngle % 1 !== 0) {
      lineFrequency = separateAtAngle;
    } else {
      lineFrequency = this.config.INIT_LINE_FREQ * 2;
      for (lineFrequency; lineFrequency <= separateAtAngle; lineFrequency++) {
        if (separateAtAngle % lineFrequency === 0) {
          break;
        }
      }
    }

    return lineFrequency;
  }

  /**
   * Checks whether the line (based on index) is big or small separator.
   */
  private _isSeparatorReached(idx: number, lineFrequency: number): Separator {
    const separators = this.max / this.scaleFactor;
    const totalSeparators = this._arcEnd / lineFrequency;
    const separateAtIdx = totalSeparators / separators;

    if (idx % separateAtIdx === 0) {
      return Separator.Big;
    } else if (idx % (separateAtIdx / 2) === 0) {
      return Separator.Small;
    }
    return Separator.NA;
  }

  /**
   * Creates the scale.
   */
  private _createScale(): void {
    const accumWith = this._determineLineFrequency() / 2;
    const isAboveSuitableFactor = this.max / this.scaleFactor > 10;
    let placedVals = 0;

    for (
      let alpha = 0, i = 0;
      alpha >= -1 * this._arcEnd;
      alpha -= accumWith, i++
    ) {
      let lineHeight = this.config.SL_NORM;
      const sepReached = this._isSeparatorReached(i, accumWith);

      // Set the line height based on its type
      switch (sepReached) {
        case Separator.Big:
          placedVals++;
          lineHeight = this.config.SL_SEP;
          break;
        case Separator.Small:
          lineHeight = this.config.SL_MID_SEP;
          break;
      }

      // Draw the line
      const higherEnd = this.center - this.config.ARC_STROKE - 2;
      const lowerEnd = higherEnd - lineHeight;

      const alphaRad = (Math.PI / 180) * (alpha + 180);
      const sin = Math.sin(alphaRad);
      const cos = Math.cos(alphaRad);
      const color = this._getScaleLineColor(alpha);

      this._addScaleLine(sin, cos, higherEnd, lowerEnd, color);

      // Put a scale value
      if (sepReached === Separator.Big) {
        const isValuePosEven = placedVals % 2 === 0;
        const isLast = alpha <= -1 * this._arcEnd;

        if (!(isAboveSuitableFactor && isValuePosEven && !isLast)) {
          this._addScaleValue(sin, cos, lowerEnd, alpha);
        }
      }
    }
  }

  /**
   * Get the scale line color from the user-provided sectors definitions.
   */
  private _getScaleLineColor(alpha: number): string {
    alpha *= -1;
    let color = '';

    if (this._mappedSectors.length) {
      this._mappedSectors.forEach((s: Sector) => {
        if (s.from <= alpha && alpha <= s.to) {
          color = s.color;
        }
      });
    }

    return color;
  }

  /**
   * Add a scale line to the list that will be later rendered.
   */
  private _addScaleLine(
    sin: number,
    cos: number,
    higherEnd: number,
    lowerEnd: number,
    color: string,
  ): void {
    this.scaleLines.push({
      from: {
        x: sin * higherEnd + this.center,
        y: cos * higherEnd + this.center,
      },
      to: {
        x: sin * lowerEnd + this.center,
        y: cos * lowerEnd + this.center,
      },
      color,
    });
  }

  /**
   * Add a scale value.
   */
  private _addScaleValue(
    sin: number,
    cos: number,
    lowerEnd: number,
    alpha: number,
  ): void {
    let val = Math.round(alpha * (this.max / this._arcEnd)) * -1;
    let posMargin = this.config.TXT_MARGIN * 2;

    // Use the multiplier instead of the real value, if above MAX_PURE_SCALE_VAL (i.e. 1000)
    if (this.max > this.config.MAX_PURE_SCALE_VAL) {
      val /= this.scaleFactor;
      val = Math.round(val * 100) / 100;
      posMargin /= 2;
    }

    this.scaleValues.push({
      text: val.toString(),
      coor: {
        x: sin * (lowerEnd - posMargin) + this.center,
        y: cos * (lowerEnd - posMargin) + this.center,
      },
    });
  }
}
