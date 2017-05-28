import {
  Component, Input, ViewChild, OnInit,
  AfterViewInit, Renderer, ElementRef
} from '@angular/core';

import { Sector, Line, Cartesian, RenderSector, Text } from './shared/gauge.interface';
import * as Const from './shared/consts';

@Component({
  selector: 'ng-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css']
})
export class GaugeComponent implements OnInit, AfterViewInit {
  @ViewChild('gauge') gauge: ElementRef;
  @ViewChild('arrow') arrow: ElementRef;

  @Input() start: number = Const.DEF_START;
  @Input() end: number = Const.DEF_END;
  @Input() max: number;
  @Input() sectors: Sector[];
  @Input() unit: string;

  stroke: number = Const.STROKE;
  arrowY: number = Const.ARROW_Y;
  viewBox: string;
  scaleLines: Line[];
  scaleText: Text[];
  sectorArcs: RenderSector[];

  radius: number;
  center: number;
  private _end: number;
  private _input: number;
  private _sepPoint: number;

  constructor(private _renderer: Renderer) {}

  @Input()
  set input(val: number) {
    this._input = val;
    this._updateArrowPos(val);
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
    this._sepPoint = this._determineScaleSeparationPoint();
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

  private _determineScaleSeparationPoint(separateAt = 10): number {
    if (this.max / separateAt > 10) {
      return this._determineScaleSeparationPoint(separateAt * 10);
    }
    return separateAt;
  }

  private _createScale(): void {
    this.scaleLines = [];
    this.scaleText = [];

    const LINE_FREQ = 3;
    const sepPoint = this._sepPoint * (this._end / this.max);
    const midSepPoint = (this._sepPoint / 2) * (this._end / this.max);

    for (let alpha = 0; alpha >= (-1) * this._end; alpha -= LINE_FREQ) {
      let lineHeight = Const.SL_NORM;
      const isSepReached = alpha % sepPoint === 0 || alpha - LINE_FREQ < (-1) * this._end;

      if (isSepReached) {
        lineHeight = Const.SL_SEP;
      } else if (alpha % midSepPoint === 0) {
        lineHeight = Const.SL_MID_SEP;
      }

      const higherEnd = this.center - Const.STROKE - 2;
      const lowerEnd = higherEnd - lineHeight;

      const alphaRad = Math.PI / 180 * (alpha + 180);
      const sin = Math.sin(alphaRad);
      const cos = Math.cos(alphaRad);
      const color = this._getLineColor(alpha);

      this._addScaleLine(sin, cos, higherEnd, lowerEnd, color);
      if (isSepReached) {
        this._addScaleText(sin, cos, lowerEnd, alpha);
      }
    }
  }

  private _getLineColor(alpha: number): string {
    alpha *= (-1);
    let color = '';

    this.sectors.forEach((s: Sector) => {
      if (s.from <= alpha && alpha <= s.to) {
        color = s.color;
      }
    });

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

  private _addScaleText(sin, cos, lowerEnd, alpha: number): void {
    let text = Math.round(alpha * (this.max / this._end)) * (-1);
    let margin = Const.TXT_MARGIN * 2;

    if (this.max > 1000) {
      text /= this._sepPoint;
      margin /= 2;
    }

    this.scaleText.push({
      text: text.toString(),
      coor: {
        x: sin * (lowerEnd - margin) + this.center,
        y: cos * (lowerEnd - margin) + this.center
      }
    });
  }
}
