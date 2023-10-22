import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {getStroke} from "perfect-freehand";
import {DrawingService, Stroke} from "./drawing.service";

export interface DrawingNotes {
  drawingDataURL: string;
  notes: string;
}

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.scss']
})
export class DrawingComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  strokes: Stroke[] = [];
  points: { x: number; y: number; pressure?: number }[] = [];
  isDrawing: boolean = false;
  private offscreenCanvas!: OffscreenCanvas;
  private offscreenContext!: OffscreenCanvasRenderingContext2D;


  constructor(private drawingService: DrawingService) {}


  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement!;
    this.context = this.canvas.getContext('2d')!;

    this.offscreenCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height);
    this.offscreenContext = this.offscreenCanvas.getContext('2d')!;

    this.setCanvasDimensions();

    // Attach a resize event listener to update dimensions if the window resizes
    window.addEventListener('resize', this.setCanvasDimensions.bind(this));
  }

  setCanvasDimensions(): void {
    // Store old dimensions
    const oldWidth = this.canvas.width;
    const oldHeight = this.canvas.height;

    // Update dimensions
    this.drawingService.setCanvasDimensions(this.canvas, this.context, this.offscreenCanvas, this.offscreenContext);

    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;

    // Check if dimensions have changed
    if (this.canvas.width !== oldWidth || this.canvas.height !== oldHeight) {
      // Rescale and redraw content
      this.rescaleAndRedraw(oldWidth, oldHeight);
    }

    this.updateMainCanvas();
  }

  saveDrawingNotes(notes: string): void {
    const dataUrl = this.canvas.toDataURL();
     const drawingNotes: DrawingNotes = {
      drawingDataURL: dataUrl,
      notes: notes
     };

     let data = JSON.stringify(drawingNotes);

    localStorage.setItem('drawingNotes', data);
  }


  rescaleAndRedraw(oldWidth: number, oldHeight: number): void {
    // Calculate scale ratios
    const xRatio = this.canvas.width / oldWidth;
    const yRatio = this.canvas.height / oldHeight;

    // Get the history from the service
    let history = this.drawingService.getHistory();

    // Clear the stroke history in the service
    this.drawingService.clear();

    // Rescale the stroke history based on the ratio and redraw
    for (const stroke of history) {
      const rescaledPoints = stroke.points.map(point => ({
        x: point.x * xRatio,
        y: point.y * yRatio,
        pressure: point.pressure
      }));

      // Create a new Stroke object with the rescaled points and original color
      const rescaledStroke: Stroke = {
        points: rescaledPoints,
        color: stroke.color
      };

      // Push each rescaledStroke back into the service
      this.drawingService.addToHistory(rescaledStroke);

      this.drawingService.endStroke();
    }

    // Finally, update the canvas
    this.updateMainCanvas();
  }



  redrawOffscreenCanvas(): void {
    const strokes = this.drawingService.getHistory();
    const lastStroke = strokes[strokes.length - 1];
    if (lastStroke) {
      const path = getStroke(lastStroke.points, this.drawingService.getDrawingOptions());
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
    this.drawingService.undo();
    this.updateMainCanvas();
  }

  redo(): void {
    this.drawingService.redo();
    this.updateMainCanvas();
  }

  clear(): void {
    this.drawingService.clear();
    this.updateMainCanvas();
  }

  changeColor(color: string): void {
    this.drawingService.setColorHex(color);
    this.updateMainCanvas();
  }

  changeStrokeSize(size: number): void {
    this.drawingService.setStrokeSize(size);
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
      this.offscreenContext.fillStyle = stroke.color;
      const path = getStroke(stroke.points, this.drawingService.getDrawingOptions());
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



  @HostListener('pointerup', ['$event'])
  handlePointerUp(): void {
    this.isDrawing = false;
    this.drawingService.endStroke();
    this.redrawOffscreenCanvas();
    this.points = [];
  }


  @HostListener('pointerdown', ['$event'])
  handlePointerDown(event?: PointerEvent): void {
    if (event && event.button == 0) {
      this.isDrawing = true;
      this.points.push({ x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 });
      this.drawingService.startStroke({ x: event.offsetX, y: event.offsetY, pressure: event.pressure ?? 0.5 });
    }
  }


  @HostListener('pointermove', ['$event'])
  handlePointerMove(event: PointerEvent): void {
    if (!this.isDrawing) return;
    console.log('Pointer move triggered');
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
      // Set the color for each stroke
      this.context.fillStyle = stroke.color;

      const path = getStroke(stroke.points, this.drawingService.getDrawingOptions());
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
    const strokeData = this.drawingService.getStrokeData();
    const currentPoints = strokeData.currentPoints;



    if (currentPoints && currentPoints.length > 0) {
      // Set the color for the current stroke
      this.context.fillStyle = strokeData.currentColor || this.drawingService.getColorHex();  // Fallback to getColorHex if currentColor is null

      const path = getStroke(currentPoints, this.drawingService.getDrawingOptions());
      if (path) {
        this.context.beginPath();
        this.context.moveTo(path[0][0], path[0][1]);
        for (const [x, y] of path) {
          this.context.lineTo(x, y);
        }
        this.context.fill();
      }
    }
  }
}
