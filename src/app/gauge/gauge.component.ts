import {
  Component, Input, ViewChild, OnInit,
  AfterViewInit, Renderer, ElementRef, ViewEncapsulation
} from '@angular/core';

import { Sector, Line, Cartesian, RenderSector, Value } from './shared/gauge.interface';
import * as Const from './shared/consts';

@Component({
  selector: 'ng-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GaugeComponent implements OnInit, AfterViewInit {
  @ViewChild('gauge') gauge: ElementRef;
  @ViewChild('arrow') arrow: ElementRef;

  @Input() start: number = Const.DEF_START;
  @Input() end: number = Const.DEF_END;
  @Input() max: number;
  @Input() sectors: Sector[];
  @Input() unit: string;
  @Input() showDigital: boolean;
  @Input() light: number;
  @Input() factor: number;

  stroke: number = Const.STROKE;
  arrowY: number = Const.ARROW_Y;
  viewBox: string;
  scaleLines: Line[];
  scaleValues: Value[];
  sectorArcs: RenderSector[];

  radius: number;
  center: number;
  scaleFactor: number;
  private _end: number;
  private _input: number;

  constructor(private _renderer: Renderer) {}

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
    const width = Const.WIDTH + Const.STROKE;

    this.viewBox = `0 0 ${width} ${width}`;
    this.radius = Const.WIDTH / 2;
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

  private _determineScaleFactorSeparator(): { separateAtAngle: number, lineFrequency: number } {
    const separators = this.max / this.scaleFactor;
    const separateAtAngle = this._end / separators;
    let lineFrequency: number;

    if (separateAtAngle % 1 !== 0) {
      lineFrequency = separateAtAngle;
    } else {
      lineFrequency = Const.INIT_LINE_FREQ * 2;
      for (lineFrequency; lineFrequency <= separateAtAngle; lineFrequency++) {
        if (separateAtAngle % lineFrequency === 0) {
          break;
        }
      }
    }

    return { separateAtAngle, lineFrequency };
  }

  private _createScale(): void {
    this.scaleLines = [];
    this.scaleValues = [];
    const { separateAtAngle, lineFrequency } = this._determineScaleFactorSeparator();
    const accumWith = lineFrequency / 2;
    const isAboveSuitableFactor = this.max / this.scaleFactor > 10;
    let placedVals = 0;

    const isSepReached = (alpha: number, separateAt: number): boolean => {
      return alpha % separateAt === 0 || // For integers (4 % 2 = 0)
        Math.round(Math.abs(alpha % separateAt)) === Math.round(separateAt); // For floats (4 % 2.001 = 1.999)
    };

    for (let alpha = 0; alpha >= (-1) * this._end; alpha -= accumWith) {
      let lineHeight = Const.SL_NORM;
      const sepReached = isSepReached(alpha, separateAtAngle);

      if (sepReached) {
        placedVals++;
        lineHeight = Const.SL_SEP;
      } else if (isSepReached(alpha, separateAtAngle / 2)) {
        lineHeight = Const.SL_MID_SEP;
      }

      const higherEnd = this.center - Const.STROKE - 2;
      const lowerEnd = higherEnd - lineHeight;

      const alphaRad = Math.PI / 180 * (alpha + 180);
      const sin = Math.sin(alphaRad);
      const cos = Math.cos(alphaRad);
      const color = this._getScaleLineColor(alpha);

      this._addScaleLine(sin, cos, higherEnd, lowerEnd, color);

      if (sepReached) {
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
    let margin = Const.TXT_MARGIN * 2;

    if (this.max > 1000) {
      val /= this.scaleFactor;
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
