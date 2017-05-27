import {
  Component, Input, ViewChild, OnInit,
  AfterViewInit, Renderer, ElementRef
} from '@angular/core';

const WIDTH = 200;
const STROKE = 20;

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
  @Input() start: number = DEF_START;
  @Input() end: number = DEF_END;
  stroke: number = STROKE;
  viewBox: string;

  private _radius: number;
  private _center: number;
  private _end: number;

  constructor(private _renderer: Renderer) {}

  ngOnInit(): void {
    const width = WIDTH + STROKE;

    this.viewBox = `0 0 ${width} ${width}`;
    this._radius = WIDTH / 2;
    this._center = width / 2;
    this._end = (360 - this.start) + this.end;
  }

  ngAfterViewInit(): void {
    this._renderer.setElementStyle(this.scale.nativeElement,
    'transform', `rotate(-${360 - this.start}deg)`);
  }

  get arc(): string {
    const rads = (this._end - 90) * Math.PI / 180;
    const largeArc = this._end <= 180 ? 0 : 1;
    const arc = {
      x: this._center + (this._radius * Math.cos(rads)),
      y: this._center + (this._radius * Math.sin(rads))
    };

    return this._arcString(arc, this._radius, this._center, largeArc);
  }

  _arcString(arc: IArc, r, c, largeArc: number): string {
    return `M ${arc.x} ${arc.y} A ${r} ${r} 0 ${largeArc} 0 ${c} ${STROKE / 2}`;
  }
}
