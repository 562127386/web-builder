import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './pdf-preview.component.html',
  animations: [
    trigger('fadeInMask', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('zoomModal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.85)' }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'scale(1)' })
        )
      ]),
      transition(':leave', [
        animate('300ms ease-in',
          style({ opacity: 0, transform: 'scale(0.85)' })
        )
      ])
    ])
  ]
})
export class PdfPreviewComponent {
  // 外部传入PDF地址
  @Input() pdfUrl = '';

  showModal = false;
  isLoading = false;
  isDarkMode = false;

  // 外部调用打开弹窗
  open(url: string) {
    this.pdfUrl = url;
    this.isLoading = true;
    this.showModal = true;
  }

  // 关闭弹窗
  closeModal() {
    this.showModal = false;
    this.pdfUrl = '';
    this.isLoading = false;
  }

  // 切换暗黑模式
  toggleDark() {
    this.isDarkMode = !this.isDarkMode;
  }

  // 全屏
  enterFullScreen() {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    }
  }

  // PDF加载完成
  onPdfLoaded() {
    this.isLoading = false;
  }
}