import {
  Component, Input, ViewChild, OnInit,
  AfterViewInit, Renderer, ElementRef
} from '@angular/core';

const WIDTH = 200;
const STROKE = 15;
const ARROW_LEN = 40;

const DEF_START = 225;
const DEF_END = 135;

interface IArc {
  x: number;
  y: number;
}

@Component({
  selector: 'ng-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css']
})
export class GaugeComponent implements OnInit, AfterViewInit {
  @ViewChild('scale') scale: ElementRef;
  @ViewChild('arrow') arrow: ElementRef;

  @Input() start: number = DEF_START;
  @Input() end: number = DEF_END;
  @Input() max: number;
  stroke: number = STROKE;
  arrowLen: number = ARROW_LEN;
  viewBox: string;

  radius: number;
  center: number;
  private _end: number;
  private _input: number;

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
  }

  ngAfterViewInit(): void {
    const angle = 360 - this.start;
    this._renderer.setElementStyle(this.scale.nativeElement, 'transform', `rotate(-${angle}deg)`);
  }

  private _arcString(arc: IArc, r, c, largeArc: number): string {
    return `M ${arc.x} ${arc.y} A ${r} ${r} 0 ${largeArc} 0 ${c} ${STROKE / 2}`;
  }

  private _updateArrowPos(input: number) {
    const pos = (this._end / this.max) * input;
    this._renderer.setElementStyle(this.arrow.nativeElement, 'transform', `rotate(${pos}deg)`);
  }
}
