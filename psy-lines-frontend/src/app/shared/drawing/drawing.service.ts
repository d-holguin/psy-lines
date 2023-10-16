import { Injectable } from '@angular/core';
import {StrokeOptions} from "perfect-freehand";

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  private points: { x: number; y: number; pressure?: number }[] = [];
  private strokeHistory: { x: number; y: number; pressure?: number }[][] = [];
  private redoStack: { x: number; y: number; pressure?: number }[][] = [];
  private canvasDimensions: { width: number; height: number } = { width: 0, height: 0 };



  private options: StrokeOptions = {
    size: 8,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  };

  constructor() { }

  setCanvasDimensions(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, offscreenCanvas: HTMLCanvasElement, offscreenContext: CanvasRenderingContext2D): void {
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

    // Update the offscreen context properties
    offscreenContext.imageSmoothingEnabled = true;
    offscreenContext.lineJoin = 'round';
    offscreenContext.lineCap = 'round';

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

  getHistory(): { x: number; y: number; pressure?: number }[][] {
    return this.strokeHistory;
  }


  startStroke(point: { x: number; y: number; pressure?: number }): void {
    this.points.push(point);
  }

  addToStroke(point: { x: number; y: number; pressure?: number }): void {
    this.points.push(point);
  }

  endStroke(): void {
    if (this.points.length) {
      this.strokeHistory.push(this.points);
      this.points = [];
    }
  }

  getStrokeData(): {strokes: any[], currentPoints: any[]} {
    return {
        strokes: this.strokeHistory,
      currentPoints: this.points
    };
  }

  getDrawingOptions(): StrokeOptions {
    return this.options;
  }
}
