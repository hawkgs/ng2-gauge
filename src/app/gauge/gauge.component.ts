import {
  Component, Input, ViewChild, OnInit,
  AfterViewInit, Renderer, ElementRef
} from '@angular/core';

const WIDTH = 200;
const STROKE = 5;
const ARROW_LEN = 40;
const SL_NORM = 3;
const SL_MID_SEP = 7;
const SL_SEP = 10;
const TXT_MARGIN = 10;

const DEF_START = 225;
const DEF_END = 135;

interface Cartesian {
  x: number;
  y: number;
}

interface Line {
  from: Cartesian;
  to: Cartesian;
}

interface Text {
  coor: Cartesian;
  text: string;
}

@Component({
  selector: 'ng-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css']
})
export class GaugeComponent implements OnInit, AfterViewInit {
  @ViewChild('gauge') gauge: ElementRef;
  @ViewChild('arrow') arrow: ElementRef;

  @Input() start: number = DEF_START;
  @Input() end: number = DEF_END;
  @Input() max: number;
  stroke: number = STROKE;
  arrowLen: number = ARROW_LEN;
  viewBox: string;
  scaleLines: Line[];
  scaleText: Text[];

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
    const rads = (this._end - 90) * Math.PI / 180;
    const largeArc = this._end <= 180 ? 0 : 1;
    const arc = {
      x: this.center + (this.radius * Math.cos(rads)),
      y: this.center + (this.radius * Math.sin(rads))
    };

    return this._arcString(arc, this.radius, this.center, largeArc);
  }

  get gaugeRotation(): number {
    return this._end - this.end;
  }

  ngOnInit(): void {
    const width = WIDTH + STROKE;

    this.viewBox = `0 0 ${width} ${width}`;
    this.radius = WIDTH / 2;
    this.center = width / 2;
    this._end = this.end;

    if (this.start > this.end) {
      this._end += (360 - this.start);
    } else {
      this._end -= this.start;
    }

    this._updateArrowPos(this._input);
    this._sepPoint = this._determineScaleSeparationPoint();
    this._createScale();
  }

  ngAfterViewInit(): void {
    this._rotateGauge();
  }

  private _arcString(arc: Cartesian, r, c, largeArc: number): string {
    return `M ${arc.x} ${arc.y} A ${r} ${r} 0 ${largeArc} 0 ${c} ${STROKE / 2}`;
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
    const sepPoint = this._sepPoint * (this._end / this.max);

    for (let alpha = 180; alpha >= 180 - this._end; alpha -= 3) {
      let lineHeight = SL_NORM;
      let reachedSep: boolean;

      // needs improvement
      switch (0) {
        case alpha % sepPoint:
          reachedSep = true;
          lineHeight = SL_SEP;
          break;
        case alpha % (sepPoint / 2):
          lineHeight = SL_MID_SEP;
          break;
      }

      const higherEnd = this.center - STROKE - 2;
      const lowerEnd = higherEnd - lineHeight;

      const alphaRad = Math.PI / 180 * alpha;
      const sin = Math.sin(alphaRad);
      const cos = Math.cos(alphaRad);

      this._addScaleLine(sin, cos, higherEnd, lowerEnd);
      if (reachedSep) {
        this._addScaleText(sin, cos, lowerEnd, alpha);
      }
    }
  }

  private _addScaleLine(sin, cos, higherEnd, lowerEnd: number): void {
    this.scaleLines.push({
      from: {
        x: sin * higherEnd + this.center,
        y: cos * higherEnd + this.center
      },
      to: {
        x: sin * lowerEnd + this.center,
        y: cos * lowerEnd + this.center
      }
    });
  }

  private _addScaleText(sin, cos, lowerEnd, alpha: number): void {
    let text = Math.round(((alpha - 180) * (this.max / this._end))) * (-1);
    let margin = TXT_MARGIN * 2;

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
