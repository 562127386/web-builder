// src/app/core/service/pdf-preview.service.ts
import { Injectable, inject } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { PdfPreviewComponent } from '@uiux/combs/form/pdf-preview/pdf-preview.component';

@Injectable({ providedIn: 'root' })
export class PdfPreviewService {
   private overlay = inject(Overlay);
   private componentRef: any;
   private overlayRef: any;

  open(pdfUrl: string): void {
    // 如果已经打开了，先关闭
    this.close();

    this.overlayRef = this.overlay.create({
     // hasBackdrop: true,  //这个不能放开  放开后弹窗关闭后 会有一个遮罩需要再单击下
      //panelClass: 'pdf-preview-panel',
      disposeOnNavigation: true
    });

    const portal = new ComponentPortal(PdfPreviewComponent);
    this.componentRef = this.overlayRef.attach(portal);

    // 调用组件的 open 方法
    this.componentRef.instance.open(pdfUrl);

    // 点击遮罩关闭
    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });
  }

  close(): void {
    if (this.componentRef) {
      this.componentRef.instance.closeModal();
    }
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
}