import { Injectable } from '@angular/core';
import {StrokeOptions} from "perfect-freehand";

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  private points: { x: number; y: number; pressure?: number }[] = [];
  private strokeHistory: { x: number; y: number; pressure?: number }[][] = [];
  private redoStack: { x: number; y: number; pressure?: number }[][] = [];


  private options: StrokeOptions = {
    size: 8,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  };

  constructor() { }

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
