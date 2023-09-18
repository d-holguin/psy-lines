import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {getStroke, StrokeOptions} from "perfect-freehand";

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.scss']
})
export class DrawingComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef;

  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;

  strokes: { x: number; y: number; pressure?: number }[][] = [];
  points: { x: number; y: number; pressure?: number }[] = [];

  isDrawing: boolean = false;


  options: StrokeOptions = {
    size: 8,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  };

  private offscreenCanvas: HTMLCanvasElement = document.createElement('canvas');
  private offscreenContext: CanvasRenderingContext2D = this.offscreenCanvas.getContext('2d')!;


  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement!;
    this.context = this.canvas.getContext('2d')!;

    const wrapper = document.getElementById('canvas-wrapper');

    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }

    this.setCanvasDimensions();

    window.addEventListener('resize', this.setCanvasDimensions.bind(this));

    //offscreen canvas
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;
    this.offscreenContext.imageSmoothingEnabled = true;
  }


  setCanvasDimensions(): void {
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Store the old dimensions
    const oldWidth = this.canvas.width;
    const oldHeight = this.canvas.height;

    // Set the new dimensions
    this.canvas.width = this.canvas.offsetWidth * devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * devicePixelRatio;

    // Update the context scale
    this.context.scale(devicePixelRatio, devicePixelRatio);
    this.context.imageSmoothingEnabled = true;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';

    // Set the offscreen canvas dimensions
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;

    // Update the offscreen context properties
    this.offscreenContext.imageSmoothingEnabled = true;
    this.offscreenContext.lineJoin = 'round';
    this.offscreenContext.lineCap = 'round';

    // Scale existing strokes based on the new dimensions
    const scaleX = this.canvas.width / oldWidth;
    const scaleY = this.canvas.height / oldHeight;

    this.strokes = this.strokes.map(stroke =>
      stroke.map(point => ({
        x: point.x * scaleX,
        y: point.y * scaleY,
        pressure: point.pressure
      }))
    );

    // Redraw all the strokes on the offscreen canvas
    this.offscreenContext.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    for (const stroke of this.strokes) {
      const path = getStroke(stroke, this.options);
      if (path) {
        this.offscreenContext.beginPath();
        this.offscreenContext.moveTo(path[0][0], path[0][1]);
        for (const [x, y] of path) {
          this.offscreenContext.lineTo(x, y);
        }
        this.offscreenContext.fill();
      }
    }

    // Update the main canvas with the contents of the offscreen canvas
    this.updateMainCanvas();
  }

  updateMainCanvas(): void {
    // Clear the main canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the contents of the offscreen canvas onto the main canvas
    this.context.drawImage(this.offscreenCanvas, 0, 0);
  }


  @HostListener('pointerup')
  handlePointerUp(): void {
    this.isDrawing = false;

    if (this.points.length) {
      // Once a stroke is finished, draw it to the off-screen canvas
      const completedStroke = getStroke(this.points, this.options);
      if (completedStroke) {
        this.offscreenContext.beginPath();
        this.offscreenContext.moveTo(completedStroke[0][0], completedStroke[0][1]);

        for (const [x, y] of completedStroke) {
          this.offscreenContext.lineTo(x, y);
        }

        this.offscreenContext.fill();
      }

      this.strokes.push(this.points);
      this.points = [];
    }
  }

  @HostListener('pointerdown', ['$event'])
  handlePointerDown(event?: PointerEvent): void {
    if (!event) {
      console.warn('handlePointerDown called without event');
      return;
    }

    this.isDrawing = true; // Start drawing
    this.points.push({ x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 });
  }



  handlePointerMove(event: PointerEvent): void {
    if (event.buttons !== 1) return;

    this.points.push({ x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 });
    this.drawStroke();
  }

  drawStroke(): void {
    // Clear the main canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the contents of the off-screen canvas (which contains all completed strokes) onto the main canvas
    this.context.drawImage(this.offscreenCanvas, 0, 0);

    // Draw the current stroke (which is in progress) onto the main canvas
    const currentStroke = getStroke(this.points, this.options);
    if (currentStroke) {
      this.context.beginPath();
      this.context.moveTo(currentStroke[0][0], currentStroke[0][1]);

      for (const [x, y] of currentStroke) {
        this.context.lineTo(x, y);
      }

      this.context.fill();
    }
  }

  @HostListener('pointerleave')
  handlePointerLeave(): void {
    this.isDrawing = false;
    this.handlePointerUp();
  }

  @HostListener('pointerenter')
  handlePointerEnter(event: PointerEvent): void {
    // Only add a new point if a stroke is already in progress
    if (this.isDrawing) {
      this.points.push({ x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 });
    }
  }

  ngOnInit(): void {}
}
