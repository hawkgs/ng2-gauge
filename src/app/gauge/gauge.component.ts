import {
  Component, Input, ViewChild, OnInit,
  AfterViewInit, Renderer2, ElementRef, ViewEncapsulation
} from '@angular/core';

import { Sector, Line, Cartesian, RenderSector, Value, Separator, GaugeProps } from './shared/gauge.interface';
import { Config, GaugeConfig } from './shared/config';
import { validate } from './shared/validators';

@Component({
  selector: 'ng-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GaugeComponent implements OnInit, AfterViewInit, GaugeProps {
  @ViewChild('gauge') gauge: ElementRef;
  @ViewChild('arrow') arrow: ElementRef;

  @Input() start: number;
  @Input() end: number;
  @Input() max: number;
  @Input() sectors: Sector[];
  @Input() unit: string;
  @Input() showDigital: boolean;
  @Input() light: number;
  @Input() lightTheme: boolean;
  @Input() factor: number;
  @Input() config: GaugeConfig;

  Configuration: GaugeConfig;
  viewBox: string;
  scaleLines: Line[];
  scaleValues: Value[];
  sectorArcs: RenderSector[];

  radius: number;
  center: number;
  scaleFactor: number;
  private _end: number;
  private _input: number;

  constructor(private _renderer: Renderer2) {
    this.scaleLines = [];
    this.scaleValues = [];
  }

  @Input()
  set input(val: number) {
    this._input = val;
    this._updateArrowPos(val);
  }

  get input(): number {
    return this._input;
  }

  get arc(): string {
    return this._arc(0, this._end);
  }

  get gaugeRotationAngle(): number {
    return this._end - this.end;
  }

  ngOnInit(): void {
    if (!this.start) {
      this.start = Config.DEF_START;
    }
    if (!this.end) {
      this.end = Config.DEF_END;
    }
    this.Configuration=Object.assign(Config,this.config);
    validate(this);
    
    const width = this.Configuration.WIDTH + this.Configuration.ARC_STROKE;

    this.viewBox = `0 0 ${width} ${width}`;
    this.radius = this.Configuration.WIDTH / 2;
    this.center = width / 2;
    this._end = this.end;

    if (this.start > this.end) {
      this._end += (360 - this.start);
    } else {
      this._end -= this.start;
    }

    this._updateArrowPos(this._input);
    this._calculateSectors();
    this.scaleFactor = this.factor || this._determineScaleFactor();
    this._createScale();
  }

  ngAfterViewInit(): void {
    this._rotateGauge();
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
  private _getAngleCoor(degrees: number): Cartesian {
    const rads = (degrees - 90) * Math.PI / 180;
    return {
      x: (this.radius * Math.cos(rads)) + this.center,
      y: (this.radius * Math.sin(rads)) + this.center
    };
  }

  /**
   * Calculate/translate the user-defined sectors to arcs.
   */
  private _calculateSectors(): void {
    if (!this.sectors) {
      return;
    }

    this.sectors = this.sectors.map((s: Sector) => {
      const ratio = this._end / this.max;
      s.from *= ratio;
      s.to *= ratio;
      return s;
    });

    this.sectorArcs = this.sectors.map((s: Sector) => {
      return {
        path: this._arc(s.from, s.to),
        color: s.color
      };
    });
  }

  /**
   * Update the position of the arrow based on the input.
   */
  private _updateArrowPos(input: number): void {
    const pos = (this._end / this.max) * input;
    this._renderer.setStyle(this.arrow.nativeElement, 'transform', `rotate(${pos}deg)`);
  }

  /**
   * Rotate the gauge based on the start property. The CSS rotation, saves additional calculations with SVG.
   */
  private _rotateGauge(): void {
    const angle = 360 - this.start;
    this._renderer.setStyle(this.gauge.nativeElement, 'transform', `rotate(-${angle}deg)`);
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
    const separateAtAngle = this._end / separators;
    let lineFrequency: number;

    // If separateAtAngle is not an integer, use its value as the line frequency.
    if (separateAtAngle % 1 !== 0) {
      lineFrequency = separateAtAngle;
    } else {
      lineFrequency = this.Configuration.INIT_LINE_FREQ * 2;
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
    const totalSeparators = this._end / lineFrequency;
    const separateAtIdx = totalSeparators / separators;

    if (idx % separateAtIdx === 0) {
      return Separator.Big;
    } else if (idx % (separateAtIdx / 2) === 0) {
      return Separator.Small;
    }
    return Separator.NA;
  };

  /**
   * Creates the scale.
   */
  private _createScale(): void {
    const accumWith = this._determineLineFrequency() / 2;
    const isAboveSuitableFactor = this.max / this.scaleFactor > 10;
    let placedVals = 0;

    for (let alpha = 0, i = 0; alpha >= (-1) * this._end; alpha -= accumWith, i++) {
      let lineHeight = this.Configuration.SL_NORM;
      const sepReached = this._isSeparatorReached(i, accumWith);

      // Set the line height based on its type
      switch (sepReached) {
        case Separator.Big:
          placedVals++;
          lineHeight = this.Configuration.SL_SEP;
          break;
        case Separator.Small:
          lineHeight = this.Configuration.SL_MID_SEP;
          break;
      }

      // Draw the line
      const higherEnd = this.center - this.Configuration.ARC_STROKE - 2;
      const lowerEnd = higherEnd - lineHeight;

      const alphaRad = Math.PI / 180 * (alpha + 180);
      const sin = Math.sin(alphaRad);
      const cos = Math.cos(alphaRad);
      const color = this._getScaleLineColor(alpha);

      this._addScaleLine(sin, cos, higherEnd, lowerEnd, color);

      // Put a scale value
      if (sepReached === Separator.Big) {
        const isValuePosEven = placedVals % 2 === 0;
        const isLast = alpha <= (-1) * this._end;

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
    alpha *= (-1);
    let color: string = '';

    if (this.sectors) {
      this.sectors.forEach((s: Sector) => {
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
  private _addScaleLine(sin: number, cos: number, higherEnd: number, lowerEnd: number, color: string): void {
    this.scaleLines.push({
      from: {
        x: sin * higherEnd + this.center,
        y: cos * higherEnd + this.center
      },
      to: {
        x: sin * lowerEnd + this.center,
        y: cos * lowerEnd + this.center
      },
      color
    });
  }

  /**
   * Add a scale value.
   */
  private _addScaleValue(sin: number, cos: number, lowerEnd: number, alpha: number): void {
    let val = Math.round(alpha * (this.max / this._end)) * (-1);
    let posMargin = this.Configuration.TXT_MARGIN * 2;

    // Use the multiplier instead of the real value, if above MAX_PURE_SCALE_VAL (i.e. 1000)
    if (this.max > this.Configuration.MAX_PURE_SCALE_VAL) {
      val /= this.scaleFactor;
      val = Math.round(val * 100) / 100;
      posMargin /= 2;
    }

    this.scaleValues.push({
      text: val.toString(),
      coor: {
        x: sin * (lowerEnd - posMargin) + this.center,
        y: cos * (lowerEnd - posMargin) + this.center
      }
    });
  }
}
