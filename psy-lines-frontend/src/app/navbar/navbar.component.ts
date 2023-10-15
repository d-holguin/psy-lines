import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { Router } from "@angular/router";
import { NavBarService } from './navbar.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {

    constructor(
        private router: Router,
        private elementRef: ElementRef,
        private navBarService: NavBarService
    ) { }

    navigateToHome() {
        this.router.navigate(['/']);
    }

    ngAfterViewInit() {
        const height = this.elementRef.nativeElement.offsetHeight;
        this.navBarService.changeHeaderHeight(height);
    }

}
