import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pdf-preview-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './pdf-preview-modal.component.html',
  animations: [
    // 遮罩淡入动画
    trigger('fadeInMask', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    // 弹窗缩放弹出动画
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
export class PdfPreviewModalComponent {
  // PDF列表 可替换后端接口数据
  pdfList = [
    { id: 1, name: '项目说明书.pdf', url: 'assets/pdf/1.pdf' },
    { id: 2, name: '用户操作手册.pdf', url: 'assets/pdf/2.pdf' },
    { id: 3, name: '质量检测报告.pdf', url: 'assets/pdf/3.pdf' },
  ];

  // 弹窗控制
  showModal = false;
  selectedPdfUrl = '';
  isLoading = false;
  isDarkMode = false;

  // 打开预览
  openPreview(item: any) {
    this.isLoading = true;
    this.selectedPdfUrl = item.url;
    this.showModal = true;
  }

  // 关闭弹窗
  closeModal() {
    this.showModal = false;
    this.selectedPdfUrl = '';
    this.isLoading = false;
  }

  // 切换暗黑模式
  toggleDark() {
    this.isDarkMode = !this.isDarkMode;
  }

  // 全屏预览
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