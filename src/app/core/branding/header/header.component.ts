import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
  DestroyRef,
  signal,
  DOCUMENT,
} from '@angular/core';
import { ScreenService } from '../../service/screen.service';
import { ScreenState } from '../../state/screen/ScreenState';

import { ContentState } from '@core/state/ContentState';
import { BRANDING } from '@core/token/token-providers';
import { Observable, Subject, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import type { IBranding } from '@core/interface/branding/IBranding';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
  host: {
    ngSkipHydration: 'true',
  },
})
export class HeaderComponent implements OnInit, AfterViewInit {
  private doc = inject<Document>(DOCUMENT);
  public branding$ = inject<Observable<IBranding>>(BRANDING);

  public sticky = signal(false);
  public showBanner = signal(false);
  private headerMode: any;
  private isBuilderMode = false;
  @ViewChild('header', { read: ElementRef }) header: ElementRef;
  @ViewChild('menu', { read: ElementRef }) menu: ElementRef;
  destroy$: Subject<boolean> = new Subject<boolean>();
  private destoryRef = inject(DestroyRef);
  private screenService = inject(ScreenService);
  private screenState = inject(ScreenState);
  public contentState = inject(ContentState);

  ngOnInit(): void {
    this.contentState.pageConfig$.pipe(takeUntilDestroyed(this.destoryRef)).subscribe(config => {
      this.headerMode = config?.headerMode;
      if (this.headerMode?.transparent) {
        this.doc.getElementsByTagName('body')[0].classList.add('transparent-header');
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.screenService.isPlatformBrowser()) {
      const scrollContainer = this.getScrollContainer();
      fromEvent(scrollContainer, 'scroll')
        .pipe(debounceTime(100), takeUntilDestroyed(this.destoryRef))
        .subscribe(() => {
          this.handleScroll();
        });
      this.handleScroll();
      this.initBanner();
    }
  }

  private getScrollContainer(): HTMLElement | Window {
    const drawerContent = this.doc.querySelector('.mat-drawer-content');
    if (drawerContent) {
      return drawerContent as HTMLElement;
    }
    const mainContainer = this.doc.getElementById('main-container');
    if (mainContainer) {
      return mainContainer;
    }
    return window;
  }

  private handleScroll(): void {
    if (this.isBuilderMode) {
      return;
    }
    let shouldSticky = this.isNearBottom();
    if (this.menu) {
      const isOutTop = this.screenService.isElementOutTopViewport(this.menu.nativeElement);
      shouldSticky = shouldSticky || isOutTop;
    }
    this.sticky.set(shouldSticky);
    this.listenSticky(this.sticky());
    if (this.headerMode?.transparent) {
      this.windowScroll();
    }
  }

  isNearBottom(): boolean {
    const scrollContainer = this.getScrollContainer();
    let scrollTop: number;
    let containerHeight: number;
    let contentHeight: number;

    if ('innerHeight' in scrollContainer) {
      scrollTop = scrollContainer.scrollY || this.doc.documentElement.scrollTop;
      containerHeight = scrollContainer.innerHeight || this.doc.documentElement.clientHeight;
      contentHeight = Math.max(
        this.doc.body.scrollHeight,
        this.doc.documentElement.scrollHeight
      );
    } else {
      scrollTop = scrollContainer.scrollTop;
      containerHeight = scrollContainer.clientHeight;
      contentHeight = scrollContainer.scrollHeight;
    }

    return scrollTop + containerHeight >= contentHeight - 100;
  }

  listenSticky(state: boolean): void {
    if (state) {
      this.screenState.stickyMenu$.next(true);
    } else {
      this.screenState.stickyMenu$.next(false);
    }
  }

  windowScroll(): void {
    const style = this.headerMode?.style;
    if (this.doc.body.scrollTop > 50 || this.doc.documentElement.scrollTop > 50) {
      this.header.nativeElement.classList.add('header-sticky');
      this.header.nativeElement.classList.remove(style);
    } else {
      this.header.nativeElement.classList.remove('header-sticky');
      this.header.nativeElement.classList.add(style);
    }
  }

  initBanner(): void {
    this.branding$.pipe(takeUntilDestroyed(this.destoryRef)).subscribe((branding: any) => {
      const banner = branding.header.banner;
      if (!banner) {
        this.showBanner.set(false);
      } else {
        this.screenState
          .mqAlias$()
          .pipe(takeUntilDestroyed(this.destoryRef))
          .subscribe(mq => {
            this.showBanner.set(mq.includes('md') || mq.includes('lg') || mq.includes('xl'));
          });
      }
    });
  }
}
