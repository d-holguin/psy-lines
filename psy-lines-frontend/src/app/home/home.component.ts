import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { getStroke, StrokeOptions } from 'perfect-freehand';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef;

  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;

  points: { x: number; y: number; pressure?: number }[] = [];
  options: StrokeOptions = {
    size: 16,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  };

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement!;
    this.context = this.canvas.getContext('2d')!;

    // Set the canvas dimensions to match the computed size in pixels
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  @HostListener('pointerup')
  handlePointerUp(): void {
    // Clear points array when mouse button is released
    this.points = [];
  }

  handlePointerDown(event: PointerEvent): void {
    this.points.push({ x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 });
  }

  handlePointerMove(event: PointerEvent): void {
    if (event.buttons !== 1) return;
    this.points.push({ x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 });
    this.drawStroke();
  }

  drawStroke(): void {
    const stroke = getStroke(this.points, this.options);

    if (this.context && stroke) {
      // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Remove this line
      this.context.beginPath();
      this.context.moveTo(stroke[0][0], stroke[0][1]);

      for (const [x, y] of stroke) {
        this.context.lineTo(x, y);
      }

      this.context.fill();
    }
  }


  ngOnInit(): void {}
}
