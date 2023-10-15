import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NavBarService {

    private headerHeight = new BehaviorSubject<number>(0);
    currentHeaderHeight = this.headerHeight.asObservable();

    constructor() { }

    changeHeaderHeight(height: number) {
        this.headerHeight.next(height)
    }
}
