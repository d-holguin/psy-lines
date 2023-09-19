import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {getStroke, StrokeOptions} from "perfect-freehand";
import {DrawingService} from "./drawing.service";

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.scss']
})
export class DrawingComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  strokes: { x: number; y: number; pressure?: number }[][] = [];
  points: { x: number; y: number; pressure?: number }[] = [];
  isDrawing: boolean = false;
  private offscreenCanvas: HTMLCanvasElement = document.createElement('canvas');
  private offscreenContext: CanvasRenderingContext2D = this.offscreenCanvas.getContext('2d')!;

  constructor(private drawingService: DrawingService) {}


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




    // Update the main canvas with the contents of the offscreen canvas
    this.updateMainCanvas();
  }

  redrawOffscreenCanvas(): void {
    // Get the last stroke from the drawing service and draw it onto the offscreen canvas
    const strokes = this.drawingService.getHistory();
    const lastStroke = strokes[strokes.length - 1];
    if (lastStroke) {
      const path = getStroke(lastStroke, this.drawingService.getDrawingOptions());
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

  undo(): void {
    console.log("Undo");
    this.drawingService.undo();
    this.updateMainCanvas();
  }

  redo(): void {
    console.log("Redo")
    this.drawingService.redo();
    this.updateMainCanvas();
  }

  clear(): void {
    console.log("Cleared")
    this.drawingService.clear();
    this.updateMainCanvas();
  }
  updateMainCanvas(): void {
    this.redrawAllStrokesOnOffscreenCanvas();

    // Clear the main canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the contents of the offscreen canvas onto the main canvas
    this.context.drawImage(this.offscreenCanvas, 0, 0);
  }


  redrawAllStrokesOnOffscreenCanvas(): void {
    // Clear the offscreen canvas
    this.offscreenContext.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

    // Get the updated strokes from the drawing service
    this.strokes = this.drawingService.getHistory();

    // Draw all the strokes onto the offscreen canvas
    for (const stroke of this.strokes) {
      const path = getStroke(stroke, this.drawingService.getDrawingOptions());
      if (path) {
        this.offscreenContext.beginPath();
        this.offscreenContext.moveTo(path[0][0], path[0][1]);
        for (const [x, y] of path) {
          this.offscreenContext.lineTo(x, y);
        }
        this.offscreenContext.fill();
      }
    }
  }



  @HostListener('pointerup')
  handlePointerUp(): void {
    this.isDrawing = false;
    this.drawingService.endStroke();
    this.redrawOffscreenCanvas();  // Add this line to redraw the offscreen canvas when a stroke is completed
    this.points = [];
  }


  @HostListener('pointerdown', ['$event'])
  handlePointerDown(event?: PointerEvent): void {
    if (!event) {
      console.warn('handlePointerDown called without event');
      return;
    }

    this.isDrawing = true;
    this.points.push({ x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 });
    this.drawingService.startStroke({ x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 });

  }


  @HostListener('pointermove', ['$event'])
  handlePointerMove(event: PointerEvent): void {
    if (!this.isDrawing) return;

    const point = { x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 };
    this.points.push(point);
    this.drawingService.addToStroke(point);
    this.drawStroke();
  }

  drawStroke(): void {
    // Clear the main canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the contents of the off-screen canvas (which contains all completed strokes) onto the main canvas
    this.context.drawImage(this.offscreenCanvas, 0, 0);

    // Draw each stroke from the history onto the main canvas
    for (const stroke of this.strokes) {
      const path = getStroke(stroke, this.drawingService.getDrawingOptions());
      if (path) {
        this.context.beginPath();
        this.context.moveTo(path[0][0], path[0][1]);
        for (const [x, y] of path) {
          this.context.lineTo(x, y);
        }
        this.context.fill();
      }
    }

    // Draw the current stroke (which is in progress) onto the main canvas
    const { currentPoints } = this.drawingService.getStrokeData();
    if (currentPoints.length > 0) {
      const path = getStroke(currentPoints, this.drawingService.getDrawingOptions());
      if (path) {
        this.context.beginPath();
        this.context.moveTo(path[0][0], path[0][1]);
        for (const [x, y] of path) {
          this.context.lineTo(x, y);
        }
        this.context.fill();  // Changed from fill() to stroke()
      }
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

}
