import {AfterViewInit, Component, ElementRef, EventEmitter, Output, Renderer2, ViewChild} from '@angular/core';
import {NavBarService} from "../navbar/navbar.service";
import {DrawingService} from "../shared/drawing/drawing.service";

@Component({
  selector: 'app-target-practice',
  templateUrl: './target-practice.component.html',
  styleUrls: ['./target-practice.component.scss']
})
export class TargetPracticeComponent implements AfterViewInit {

  @ViewChild('drawingComponent') drawingComponent!: any;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private navBarService: NavBarService,
    private drawingService: DrawingService
  ) {
  }
  ngAfterViewInit() {
    const buttonBarHeight = this.el.nativeElement.querySelector('#button-bar').offsetHeight;

    this.navBarService.currentHeaderHeight.subscribe(headerHeight => {
      const newHeight = `calc(100vh - ${headerHeight + buttonBarHeight}px)`;
      this.renderer.setStyle(this.el.nativeElement.querySelector('.drawing-container'), 'height', newHeight);
      this.drawingService.setCanvasDimensions(
        this.drawingComponent.canvas,
        this.drawingComponent.context,
        this.drawingComponent.offscreenCanvas,
        this.drawingComponent.offscreenContext
      );
    });
  }
}
