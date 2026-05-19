import { Component, HostBinding, Input, OnInit, inject } from '@angular/core';
import type { IImg } from '@core/interface/widgets/IImg';
import { Router } from '@angular/router';

@Component({
  selector: 'app-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss'],
  standalone: false,
})
export class ImgComponent implements OnInit {
  @Input() content: IImg | undefined;
  @Input() isBg = false;
  @HostBinding('class') hostClasses: any;

  private router = inject(Router);

  ngOnInit(): void {
    if (this.content?.hostClasses) {
      this.hostClasses = this.content.hostClasses;
    }
  }

  onImgClick(event: Event): void {
    if (!this.content?.href) {
      return;
    }

    const href = this.content.href;

    if (!href || href.startsWith('javascript:') || href.startsWith('#')) {
      return;
    }

    if (this.isExternalLink(href)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const url = new URL(href, window.location.origin);
    const path = url.pathname;
    const queryParams: { [key: string]: string } = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    this.router.navigate([path], { queryParams });
  }

  private isExternalLink(href: string): boolean {
    const externalProtocols = ['http://', 'https://', 'mailto:', 'tel:', 'ftp://'];
    for (const protocol of externalProtocols) {
      if (href.toLowerCase().startsWith(protocol)) {
        if ((protocol === 'http://' || protocol === 'https://')) {
          try {
            const url = new URL(href);
            if (url.origin === window.location.origin) {
              return false;
            }
          } catch {
            return true;
          }
        }
        return true;
      }
    }
    return false;
  }
}
