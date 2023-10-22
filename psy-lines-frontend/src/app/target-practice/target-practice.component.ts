import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild
} from '@angular/core';
import {NavBarService} from "../navbar/navbar.service";
import {DrawingService} from "../shared/drawing/drawing.service";

@Component({
  selector: 'app-target-practice',
  templateUrl: './target-practice.component.html',
  styleUrls: ['./target-practice.component.scss']
})
export class TargetPracticeComponent implements AfterViewInit {

  @ViewChild('drawingComponent') drawingComponent!: any;
  @ViewChild('notesTextarea') notesTextarea!: ElementRef;

  colors = [
    { name: 'Black', value: '#000000', isDark: true },
    { name: 'Red', value: '#ff0000', isDark: true },
    { name: 'Green', value: '#008000', isDark: true },
    { name: 'Blue', value: '#0000ff', isDark: true },
    { name: 'Yellow', value: '#ffff00', isDark: false },
    { name: 'Orange', value: '#ffa500', isDark: false },
    { name: 'Purple', value: '#800080', isDark: true }
  ];


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


  saveDrawingAndNotes(): void {
    const notes = this.notesTextarea.nativeElement.value;
    this.drawingComponent.saveDrawingNotes(notes);
  }

  @HostListener('touchmove', ['$event'])
  preventTouchMove(event: TouchEvent): void {
    event.preventDefault();
  }
}
