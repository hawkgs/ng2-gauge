import {
  Component, Input, ViewChild, OnInit,
  AfterViewInit, Renderer, ElementRef, ViewEncapsulation
} from '@angular/core';

import { Sector, Line, Cartesian, RenderSector, Value, Separator } from './shared/gauge.interface';
import { Config, GaugeConfig } from './shared/config';

@Component({
  selector: 'ng-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GaugeComponent implements OnInit, AfterViewInit {
  @ViewChild('gauge') gauge: ElementRef;
  @ViewChild('arrow') arrow: ElementRef;

  @Input() start: number = Config.DEF_START;
  @Input() end: number = Config.DEF_END;
  @Input() max: number;
  @Input() sectors: Sector[];
  @Input() unit: string;
  @Input() showDigital: boolean;
  @Input() light: number;
  @Input() factor: number;
  @Input() lightTheme: boolean;
  @Input() config: GaugeConfig;

  Config: GaugeConfig = Config;
  viewBox: string;
  scaleLines: Line[];
  scaleValues: Value[];
  sectorArcs: RenderSector[];

  radius: number;
  center: number;
  scaleFactor: number;
  private _end: number;
  private _input: number;

  constructor(private _renderer: Renderer) {
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

  get gaugeRotation(): number {
    return this._end - this.end;
  }

  ngOnInit(): void {
    const width = Config.WIDTH + Config.ARC_STROKE;

    this.viewBox = `0 0 ${width} ${width}`;
    this.radius = Config.WIDTH / 2;
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

  private _arc(start, end: number): string {
    const largeArc = end - start <= 180 ? 0 : 1;
    const startCoor = this._getAngleCoor(start);
    const endCoor = this._getAngleCoor(end);

    return `M ${endCoor.x} ${endCoor.y} A ${this.radius} ${this.radius} 0 ${largeArc} 0 ${startCoor.x} ${startCoor.y}`;
  }

  private _getAngleCoor(degrees: number): Cartesian {
    const rads = (degrees - 90) * Math.PI / 180;
    return {
      x: (this.radius * Math.cos(rads)) + this.center,
      y: (this.radius * Math.sin(rads)) + this.center
    };
  }

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

  private _updateArrowPos(input: number): void {
    const pos = (this._end / this.max) * input;
    this._renderer.setElementStyle(this.arrow.nativeElement, 'transform', `rotate(${pos}deg)`);
  }

  private _rotateGauge(): void {
    const angle = 360 - this.start;
    this._renderer.setElementStyle(this.gauge.nativeElement, 'transform', `rotate(-${angle}deg)`);
  }

  private _determineScaleFactor(factor = 10): number {
    // Keep smaller factor until 3X
    if (this.max / factor > 30) {
      return this._determineScaleFactor(factor * 10);
    }
    return factor;
  }

  private _determineLineFrequency(): number {
    const separators = this.max / this.scaleFactor;
    const separateAtAngle = this._end / separators;
    let lineFrequency: number;

    if (separateAtAngle % 1 !== 0) {
      lineFrequency = separateAtAngle;
    } else {
      lineFrequency = Config.INIT_LINE_FREQ * 2;
      for (lineFrequency; lineFrequency <= separateAtAngle; lineFrequency++) {
        if (separateAtAngle % lineFrequency === 0) {
          break;
        }
      }
    }

    return lineFrequency;
  }

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

  private _createScale(): void {
    const accumWith = this._determineLineFrequency() / 2;
    const isAboveSuitableFactor = this.max / this.scaleFactor > 10;
    let placedVals = 0;

    for (let alpha = 0, i = 0; alpha >= (-1) * this._end; alpha -= accumWith, i++) {
      let lineHeight = Config.SL_NORM;
      const sepReached = this._isSeparatorReached(i, accumWith);

      switch (sepReached) {
        case Separator.Big:
          placedVals++;
          lineHeight = Config.SL_SEP;
          break;
        case Separator.Small:
          lineHeight = Config.SL_MID_SEP;
          break;
      }

      const higherEnd = this.center - Config.ARC_STROKE - 2;
      const lowerEnd = higherEnd - lineHeight;

      const alphaRad = Math.PI / 180 * (alpha + 180);
      const sin = Math.sin(alphaRad);
      const cos = Math.cos(alphaRad);
      const color = this._getScaleLineColor(alpha);

      this._addScaleLine(sin, cos, higherEnd, lowerEnd, color);

      if (sepReached === Separator.Big) {
        const isValuePosEven = placedVals % 2 === 0;
        const isLast = alpha <= (-1) * this._end;

        if (!(isAboveSuitableFactor && isValuePosEven && !isLast)) {
          this._addScaleValue(sin, cos, lowerEnd, alpha);
        }
      }
    }
  }

  private _getScaleLineColor(alpha: number): string {
    alpha *= (-1);
    let color: string;

    if (this.sectors) {
      this.sectors.forEach((s: Sector) => {
        if (s.from <= alpha && alpha <= s.to) {
          color = s.color;
        }
      });
    }

    return color;
  }

  private _addScaleLine(sin, cos, higherEnd, lowerEnd: number, color: string): void {
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

  private _addScaleValue(sin, cos, lowerEnd, alpha: number): void {
    let val = Math.round(alpha * (this.max / this._end)) * (-1);
    let margin = Config.TXT_MARGIN * 2;

    if (this.max > Config.MAX_PURE_SCALE_VAL) {
      val /= this.scaleFactor;
      val = Math.round(val * 100) / 100;
      margin /= 2;
    }

    this.scaleValues.push({
      text: val.toString(),
      coor: {
        x: sin * (lowerEnd - margin) + this.center,
        y: cos * (lowerEnd - margin) + this.center
      }
    });
  }
}
