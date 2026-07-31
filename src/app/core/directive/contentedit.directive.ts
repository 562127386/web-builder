import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import type { IMetaEdit } from '@core/interface/IBuilder';
import { UtilitiesService } from '@core/service/utilities.service';
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[contentedit]',
  standalone: false,
})
export class ContenteditDirective implements AfterViewInit, OnInit {
  private componentItem: Element | null = null;
  private el = inject(ElementRef);
  private util = inject(UtilitiesService);

  ngOnInit(): void {
    this.componentItem = this.el.nativeElement.closest('.component-item');
  }

  @HostListener('blur', ['$event']) async onBlur(event: any): Promise<void> {
    const { currentTarget } = event;
    if (this.componentItem && currentTarget && currentTarget.contentEditable === 'true') {
      currentTarget.contentEditable = 'false';
      const path = this.generatePath(currentTarget);
      const { BuilderState } = await import('@core/state/BuilderState');
      const builder = inject(BuilderState);
      builder.updatePageContentByPath(path, currentTarget.innerHTML);
      await this.openMetaPanel(currentTarget, path);
    }
  }

  /**
   *
   * @param event
   * 清除剪切板格式
   */
  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (clipboardData) {
      const plainText = clipboardData.getData('text/plain');

      // 保存当前选区（光标位置）
      const selection = window.getSelection();
      if (!selection) {
        console.warn('No selection found');
        return;
      }
      const range = selection.getRangeAt(0);

      // 清除选区，准备插入纯文本
      range.deleteContents();

      // 创建新的文本节点并插入到Range中
      const textNode = document.createTextNode(plainText);
      range.insertNode(textNode);

      // 恢复选区，确保光标位置正确
      range.selectNodeContents(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  @HostListener('click', ['$event']) async onClick(event: any): Promise<void> {
    const { currentTarget } = event;
    if (this.componentItem && currentTarget) {
      const path = this.generatePath(currentTarget);
      if (currentTarget.tagName === 'IMG') {
        const { getInlineImg } = await import('@modules/builder/factory/getInlinImg');
        const { BuilderState } = await import('@core/state/BuilderState');
        const builder = inject(BuilderState);
        const meta: IMetaEdit = {
          type: 'inline-editor',
          mode: 'img',
          path,
          fullWidth: true,
          ele: event.target,
          fields: getInlineImg(currentTarget),
          data: {
            src: currentTarget.getAttribute('src'),
            fileName: currentTarget.getAttribute('src').split('/').pop(),
            alt: currentTarget.getAttribute('alt'),
            tag: currentTarget.tagName,
          },
        };
        builder.rightContent$.next({
          title: '编辑图片',
          mode: 'over',
          hasBackdrop: false,
          style: {
            'width': '284px',
            'max-width': 'calc(100vw - 50px)',
          },
          elements: [meta],
        });
      } else {
        currentTarget.contentEditable = 'true';
        await this.openMetaPanel(currentTarget, path);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  async openMetaPanel(ele: any, path: string): Promise<void> {
    const { getInlineText } = await import('@modules/builder/factory/getInlineText');
    const { BuilderState } = await import('@core/state/BuilderState');
    const builder = inject(BuilderState);
    const meta: IMetaEdit = {
      type: 'inline-editor',
      mode: 'text',
      fullWidth: true,
      path,
      ele,
      fields: [getInlineText(ele)],
      data: {
        innerHTML: ele.innerHTML,
        tag: ele.tagName,
      },
    };
    builder.rightContent$.next({
      title: '编辑文本',
      mode: 'push',
      hasBackdrop: false,
      style: {
        'width': '300px',
        'max-width': 'calc(100vw - 140px)',
      },
      elements: [meta],
    });
  }

  @Input() set contentedit(key: string) {
    const ele = this.el.nativeElement;
    ele.setAttribute('data-path', key);
  }

  ngAfterViewInit(): void {
    const ele = this.el.nativeElement;
    if (this.componentItem) {
      ele.contentEditable = 'false';
    }
  }

  generatePath(contenteditableElement: any): string {
    return this.util.generatePath(contenteditableElement);
  }
}
