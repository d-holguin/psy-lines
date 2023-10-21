import { Injectable } from '@angular/core';
import {StrokeOptions} from "perfect-freehand";


export interface Stroke {
  points: { x: number; y: number; pressure?: number }[];
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  private currentStroke: Stroke | null = null;
  private strokeHistory: Stroke[] = [];
  private redoStack: Stroke[] = [];
  private canvasDimensions: { width: number; height: number } = { width: 0, height: 0 };
  private currentColor: string = '#000000';


  private options: StrokeOptions = {
    size: 8,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  };

  constructor() { }

  setColorHex(hex: string) {
    this.currentColor = hex;
  }

  setStrokeSize(newSize: number){
    this.options.size = newSize;
  }

  getStrokeSize(): number | undefined {
    return this.options.size;
  }

  getColorHex(): string {
    return this.currentColor;
  }

  setCanvasDimensions(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, offscreenCanvas: OffscreenCanvas, offscreenContext: OffscreenRenderingContext): void {
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Set the new dimensions
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;

    // Update the context scale
    context.scale(devicePixelRatio, devicePixelRatio);
    context.imageSmoothingEnabled = true;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    // Set the offscreen canvas dimensions
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;

    this.canvasDimensions = { width: canvas.width, height: canvas.height };

  }


  undo(): void {
    if (this.strokeHistory.length > 0) {
      const lastStroke = this.strokeHistory.pop();
      if (lastStroke) {
        this.redoStack.push(lastStroke);
      }
    }
  }

  redo(): void {
    if (this.redoStack.length > 0) {
      const strokeToRedo = this.redoStack.pop();
      if (strokeToRedo) {
        this.strokeHistory.push(strokeToRedo);
      }
    }
  }

  clear(): void {
    this.strokeHistory = [];
    this.redoStack = [];
  }

  getHistory(): Stroke[] {
    return this.strokeHistory;
  }


  startStroke(point: { x: number; y: number; pressure?: number }): void {
    this.currentStroke = { points: [point], color: this.currentColor };
  }

  addToStroke(point: { x: number; y: number; pressure?: number }): void {
    if (this.currentStroke) {
      this.currentStroke.points.push(point);
    }
  }

  endStroke(): void {
    if (this.currentStroke && this.currentStroke.points.length > 0) {
      this.strokeHistory.push(this.currentStroke);
      this.currentStroke = null;
    }
  }

  getStrokeData(): { strokes: Stroke[], currentPoints: { x: number; y: number; pressure?: number }[] | null, currentColor: string | null } {
    return {
      strokes: this.strokeHistory,
      currentPoints: this.currentStroke ? this.currentStroke.points : null,
      currentColor: this.currentStroke ? this.currentStroke.color : null
    };
  }


  getDrawingOptions(): StrokeOptions {
    return this.options;
  }

  addToHistory(stroke: Stroke): void {
    this.strokeHistory.push(stroke);
  }


}
