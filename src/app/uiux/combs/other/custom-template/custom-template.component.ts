/**
 * CustomTemplateComponent - 自定义模板组件
 *
 * 功能特性：
 * 1. 支持从 API 动态加载数据
 * 2. 支持路由参数和查询参数获取
 * 3. 支持动态 select 选项从 API 获取
 * 4. 支持与 form 组件联动查询
 * 5. 使用 Mustache 模板引擎渲染 HTML
 */
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  Injector,        // 注入器，用于 runInInjectionContext
  Input,
  effect,           // Angular Signal 响应式效果函数
  inject,           // 依赖注入函数
  runInInjectionContext,  // 在注入上下文中执行代码
  signal,           // Angular Signal
} from '@angular/core';
import type { ICustomTemplate } from '@core/interface/IBuilder';
import DOMPurify from 'dompurify';  // HTML 净化库
import { NodeService } from '@core/service/node.service';
import Mustache from 'mustache';     // Mustache 模板引擎
import { IPager } from '@core/interface/widgets/IWidgets';
import { PageEvent } from '@angular/material/paginator';
import { ScreenService } from '@core/service/screen.service';
import {
  catchError,
  combineLatest,    // 合并多个 Observable
  filter,
  of,
  timeout          // 超时处理
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilitiesService } from '@core/service/utilities.service';
import { ICoreConfig } from '@core/interface/IAppConfig';
import { CORE_CONFIG } from '@core/token/token-providers';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { QueryStateService } from '@core/service/query-state.service';  // 查询状态管理服务
import { CompanyService } from '@core/service/company.service';
import { PdfPreviewService } from '@core/service/pdf-preview.service';
declare let Swiper: any;
declare let echarts: any;

/**
 * 动态 select 选项配置接口
 */
interface ISelectOptionConfig {
  api: string;       // 获取选项的 API 地址
  params?: any;      // API 查询参数
}

@Component({
  selector: 'app-custom-template',
  templateUrl: './custom-template.component.html',
  styleUrls: ['./custom-template.component.scss'],
  standalone: false,
})
export class CustomTemplateComponent implements AfterViewInit {
  @Input() content: ICustomTemplate;
  public pager = signal<IPager | null>(null);
  public selectOptions = signal<Map<string, any[]>>(new Map());

  // 依赖注入
  private ele = inject(ElementRef);
  private screenService = inject(ScreenService);
  private nodeService = inject(NodeService);
  private template: Element;
  private destroyRef = inject(DestroyRef);
  private util = inject(UtilitiesService);
  private coreConfig = inject<ICoreConfig>(CORE_CONFIG);
  private activatedRoute = inject(ActivatedRoute);
  private queryState = inject(QueryStateService);
  private companyService = inject(CompanyService);
  private injector = inject(Injector);  // 注入器，用于在非注入上下文执行 effect
  private componentId: string;          // 组件唯一标识
  private queryParams = signal<any>({}); // 查询参数信号

  private pdfPreviewService = inject(PdfPreviewService);
  private router = inject(Router);

  async ngAfterViewInit(): Promise<void> {
    this.template = this.ele.nativeElement.querySelector('.template');
    // 生成组件唯一 ID，优先使用配置中的 id，否则自动生成
    this.componentId = this.content.id || `template-${Date.now()}`;

    // 加载 FontAwesome 图标库
    if (this.coreConfig.librariesUseLocal) {
      const fontawesome = this.util.getLibraries('fontAwesome', 'local', 'style');
      await this.util.loadStyle(fontawesome);
    } else {
      const fontawesome = this.util.getLibraries('fontAwesome', 'cdn', 'style');
      await this.util.loadStyle(fontawesome);
    }

    // 初始化监听
    this.setupRouteParamsListener();   // 监听路由参数和查询参数
    this.setupQueryStateListener();    // 监听查询状态变化
    //this.setupPdfPreviewListener();    // 监听 PDF 预览事件
    // 等待所有 select 选项加载完成后再渲染模板
    this.loadSelectOptions().then(() => {
      this.render(this.content);       // 渲染模板
    });
  }

    // 接收PDF路径，打开弹窗
  viewPdf(pdfPath: string) {
    alert(pdfPath);
    //this.pdfPreviewRef.open(pdfPath);
  }
  // /**
  //  * 设置 PDF 预览事件监听器
  //  */
  // private setupPdfPreviewListener(): void {
  //   window.addEventListener('preview-pdf', (event: Event) => {
  //     const detail = (event as CustomEvent).detail;
  //     if (detail?.url) {
  //       this.pdfPreviewService.open(detail.url);
  //     }
  //   });
  // }

  /**
   * 设置路由参数监听器
   * 同时监听路由参数（如 /path/:id）和查询参数（如 /path?id=1）
   */
  private setupRouteParamsListener(): void {
    // 使用 combineLatest 合并路由参数和查询参数
    combineLatest([
      this.activatedRoute.paramMap,      // 路由参数（如 /product/:id）
      this.activatedRoute.queryParamMap  // 查询参数（如 ?id=4&category=tech）
    ])
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(([routeParams, queryParams]) => {
      const params: any = {};

      // 收集路由参数
      routeParams.keys.forEach(key => {
        params[key] = routeParams.get(key);
      });

      // 收集查询参数（会覆盖同名路由参数）
      queryParams.keys.forEach(key => {
        params[key] = queryParams.get(key);
      });

      // 处理分页参数，将 URL 中的 page 参数转换为 0-based index
      if (params.page !== undefined) {
        params.page = parseInt(params.page, 10) - 1;
        if (isNaN(params.page)) {
          delete params.page;
        }
      }

      // 如果有参数，更新查询状态
      if (Object.keys(params).length > 0) {
        this.queryState.setQuery(this.componentId, params);
      }
    });
  }

  /**
   * 设置查询状态监听器
   * 使用 Angular effect 响应式监听查询状态变化
   */
  private setupQueryStateListener(): void {
    // 获取查询状态信号
    const querySignal = this.queryState.watchQuery(this.componentId);

    // 使用 runInInjectionContext 包装 effect，因为 ngAfterViewInit 不在注入上下文中
    runInInjectionContext(this.injector, () => {
      effect(() => {
        // effect 会自动追踪 querySignal 的变化
        const params = querySignal();
        if (params && Object.keys(params).length > 0) {
          // 构建查询字符串并获取数据
          const queryString = this.buildQueryParams(params);
          this.fetchContent(queryString);
        }
      });
    });
  }

  /**
   * 加载动态 select 选项
   * 从配置的 API 获取选项数据
   */
  private async loadSelectOptions(): Promise<void> {
    if (!this.content.selectOptions) {
      return;
    }

    const optionsConfig = this.content.selectOptions;
    for (const [fieldName, config] of Object.entries(optionsConfig)) {
      try {
        const response = await this.fetchSelectOptions(config.api, config.params);
        // 更新 selectOptions 信号
        this.selectOptions.update((map: Map<string, any[]>) => {
          map.set(fieldName, response.rows || []);
          return map;
        });
      } catch (error) {
        console.error(`Failed to load options for ${fieldName}:`, error);
      }
    }
  }

  /**
   * 获取动态 select 选项数据
   * @param api - API 地址
   * @param params - 查询参数
   */
  private async fetchSelectOptions(api: string, params?: any): Promise<any> {
    const queryString = params ? this.buildQueryParams(params) : '';
    try {
      const response = await this.nodeService.fetch(api, queryString)
        .pipe(timeout(10000))  // 10秒超时
        .toPromise();
      return response;
    } catch (error) {
      console.error(`Failed to fetch options for ${api}:`, error);
      return { items: [] };  // 返回空数组避免崩溃
    }
  }

  /**
   * 渲染模板
   * @param content - 内容配置
   */
  async render(content: any): Promise<void> {
    if (this.screenService.isPlatformBrowser()) {
      const { html, json, isAPI, api } = content;

      // 如果启用 API 模式，从 API 获取数据
      if (isAPI && api) {
        const currentParams = this.queryState.getQuery(this.componentId);
        const queryString = Object.keys(currentParams).length > 0
          ? this.buildQueryParams(currentParams)
          : '';
        this.fetchContent(queryString);
      } else {
        // 静态模式，直接渲染 JSON 数据
        try {
          this.renderView(json, html);
          this.pager.set(null);
        } catch (e) {
          this.renderView(
            {},
            `<div class="m-5 p-5 bg-red-100 rounded-lg">意外错误，请检查配置。</div>`
          );
          this.pager.set(null);
        }
      }

      // 加载 Swiper 轮播组件
      if (html.includes('data-swiper')) {
        this.loadSwiper();
      }

      // 加载 ECharts 图表组件
      if (html.includes('data-echarts')) {
        this.loadEchars();
      }

      // 设置 select 选择事件监听（用于表单联动）
      this.setupSelectEventListeners();
    }
  }

  /**
   * 设置 select 选择事件监听
   * 使用事件委托方式，支持动态生成的 select 元素
   */
  private setupSelectEventListeners(): void {
    // 使用事件委托，监听模板容器内的所有 select 变化
    this.template.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLSelectElement;
      // 只处理带有 data-query-field 属性的 select
      if (target.tagName === 'SELECT') {
        const fieldName = target.getAttribute('data-query-field');
        const value = target.value;

        if (fieldName) {
          // 获取当前查询参数
          const currentParams = { ...this.queryState.getQuery(this.componentId) };
          if (value) {
            // 设置新值
            currentParams[fieldName] = value;
          } else {
            // 删除空值参数
            delete currentParams[fieldName];
          }
          // 更新查询状态，触发重新查询
          this.queryState.setQuery(this.componentId, currentParams);
        }
      }
    });
  }

  /**
   * 加载 Swiper 轮播库
   */
  async loadSwiper(): Promise<void> {
    if (this.coreConfig.librariesUseLocal) {
      await this.util.loadStyle('/assets/injects/swiper/swiper-bundle.min.css');
      await this.util.loadScript('/assets/injects/swiper/swiper-bundle.min.js');
    } else {
      const swiperStyle = this.util.getLibraries('swiper', 'cdn', 'style');
      const swiperScript = this.util.getLibraries('swiper', 'cdn', 'script');
      await this.util.loadStyle(swiperStyle);
      await this.util.loadScript(swiperScript);
      this.ele.nativeElement.querySelectorAll('.swiper').forEach((el: any) => {
        if (el) {
          const options = JSON.parse(el.getAttribute('data-swiper'));
          new Swiper(el, options);
        }
      });
    }
  }

  /**
   * 加载 ECharts 图表库
   */
  async loadEchars(): Promise<void> {
    const echartsScript = this.util.getLibraries('echarts', 'cdn', 'script');
    await this.util.loadScript(echartsScript);
    this.ele.nativeElement.querySelectorAll('.chart').forEach((el: any) => {
      if (el) {
        const options = JSON.parse(el.getAttribute('data-echarts'));
        const chart = echarts.init(el);
        chart.setOption(options);
      }
    });
  }

  /**
   * 获取内容数据
   * @param params - 查询参数字符串
   */
  fetchContent(params: string): void {
    const { html, api } = this.content;
    if (api) {
      let fullUrl = api.trim();

      // 保留原始 URL 中的查询参数，追加新参数
      if (params && params.length > 0) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + params;
      }

      this.nodeService
        .fetch(fullUrl, params)
        .pipe(
          timeout(10000),           // 10秒超时
          takeUntilDestroyed(this.destroyRef),
          catchError((error: Error) => {
            console.log(error);
            return of({
              ok: false,
              message: error.message || '请求超时',
            });
          })
        )
        .subscribe((res: any) => {
          if (res?.ok === false) {
            this.util.openSnackbar(res.message, 'ok');
            this.renderView({}, `<div class="m-5 p-5 bg-red-100 rounded-lg">${res.message}</div>`);
          } else {
            const { rows, pager } = res;
            this.renderView(res, html);
            if (rows && pager) {
              this.pager.set(this.nodeService.handlerPager(pager, rows.length));
            }
          }
        });
    }
  }

  /**
   * 分页变化处理
   * @param pageEvent - 分页事件
   */
  onPageChange(pageEvent: PageEvent): void {
    const { pageIndex } = pageEvent;
    const currentParams = { ...this.queryState.getQuery(this.componentId), page: pageIndex };
    this.queryState.setQuery(this.componentId, currentParams);

    // 更新 URL 参数，使浏览器返回按钮能恢复分页状态
    this.router.navigate([], {
      queryParams: { page: pageIndex + 1 },
      queryParamsHandling: 'merge'
    }).catch(error => {
      console.error('Failed to update URL with page parameter:', error);
    });
  }

  /**
   * 构建查询参数字符串
   * @param params - 参数对象
   */
  private buildQueryParams(params: any): string {
    return Object.keys(params)
      .map((key: string) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * 渲染视图
   * 使用 Mustache 模板引擎渲染 HTML
   * @param content - 数据内容
   * @param html - 模板 HTML
   */
  renderView(content: any, html: string): void {
    // 保存当前 select 的选中状态
    const selectedValues: { [key: string]: string } = {};
    const selects = this.template.querySelectorAll('select[data-query-field]') as NodeListOf<HTMLSelectElement>;
    selects.forEach((select: HTMLSelectElement) => {
      const fieldName = select.getAttribute('data-query-field');
      if (fieldName) {
        selectedValues[fieldName] = select.value;
      }
    });

    const data = this.processData(content);
    // 根据配置决定是否进行 HTML 安全编码
    let renderedHtml: string;
    if (this.content.sanitizeHtml === false) {
      // 不进行安全编码，直接渲染原始 HTML（适用于富文本内容）
      renderedHtml = Mustache.render(html, data);
    } else {
      // 默认进行 HTML 安全编码，防止 XSS 攻击
      const sanitized = DOMPurify.sanitize(html, { ADD_TAGS: ['style'], FORCE_BODY: true });
      renderedHtml = Mustache.render(sanitized, data);
    }
    this.template.innerHTML = renderedHtml;

    // 恢复 select 的选中状态
    setTimeout(() => {
      const newSelects = this.template.querySelectorAll('select[data-query-field]') as NodeListOf<HTMLSelectElement>;
      newSelects.forEach((select: HTMLSelectElement) => {
        const fieldName = select.getAttribute('data-query-field');
        if (fieldName && selectedValues[fieldName]) {
          select.value = selectedValues[fieldName];
        }
      });
    }, 0);

    // 绑定自定义事件处理
    this.bindCustomEvents();
  }

  /**
   * 处理数据，添加索引和条件判断支持
   */
  private processData(content: any): any {
    let processed = {
      ...content,
      selectOptions: Object.fromEntries(this.selectOptions()),
    };

    if (content.rows && Array.isArray(content.rows)) {
      processed.rows = content.rows.map((item: any, index: number) => {
        const enhanced = {
          ...item,
          index: index,
          isFirst: index === 0,
          isLast: index === content.rows.length - 1,
          isEven: index % 2 === 0,
          isOdd: index % 2 !== 0,
        };

        if (this.content.conditions) {
          Object.entries(this.content.conditions).forEach(([key, config]: [string, any]) => {
            const { field, operator, value } = config;
            const itemValue = item[field];
            enhanced[key] = this.evaluateCondition(itemValue, operator, value);
          });
        }

        return enhanced;
      });
      processed.items = processed.rows;
      processed.first = processed.rows[0];
      processed.rest = processed.rows.slice(1);
      processed.hasItems = processed.rows.length > 0;
      processed.hasMultiple = processed.rows.length > 1;
    }

    if (content.result && Array.isArray(content.result)) {
      processed.result = content.result.map((item: any, index: number) => {
        const enhanced = {
          ...item,
          index: index,
          isFirst: index === 0,
          isLast: index === content.result.length - 1,
          isEven: index % 2 === 0,
          isOdd: index % 2 !== 0,
        };

        if (this.content.conditions) {
          Object.entries(this.content.conditions).forEach(([key, config]: [string, any]) => {
            const { field, operator, value } = config;
            const itemValue = item[field];
            enhanced[key] = this.evaluateCondition(itemValue, operator, value);
          });
        }

        return enhanced;
      });
      processed.items = processed.result;
      processed.first = processed.result[0];
      processed.rest = processed.result.slice(1);
      processed.hasItems = processed.result.length > 0;
      processed.hasMultiple = processed.result.length > 1;
    }

    return processed;
  }

  /**
   * 评估条件表达式
   */
  private evaluateCondition(itemValue: any, operator: string, compareValue: any): boolean {
    switch (operator) {
      case '==':
        return itemValue == compareValue;
      case '===':
        return itemValue === compareValue;
      case '!=':
        return itemValue != compareValue;
      case '!==':
        return itemValue !== compareValue;
      case '>':
        return itemValue > compareValue;
      case '<':
        return itemValue < compareValue;
      case '>=':
        return itemValue >= compareValue;
      case '<=':
        return itemValue <= compareValue;
      case 'includes':
        return String(itemValue).includes(String(compareValue));
      case 'startsWith':
        return String(itemValue).startsWith(String(compareValue));
      case 'endsWith':
        return String(itemValue).endsWith(String(compareValue));
      default:
        return false;
    }
  }

  /**
   * 绑定自定义事件处理
   * 使用事件委托处理模板中的交互
   */
  private bindCustomEvents(): void {
    this.setupLinkNavigation();

    // PDF预览事件
    const pdfButtons = this.ele.nativeElement.querySelectorAll('[data-action="previewPdf"]');
    pdfButtons.forEach((btn: HTMLElement) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        const url = btn.getAttribute('data-url');
        if (url) {
          this.pdfPreviewService.open(url);
        }
      });
    });
  }

  /**
   * 设置链接导航处理
   * 使用 Angular Router 进行内部链接导航，防止页面刷新
   */
  private setupLinkNavigation(): void {
    this.template.addEventListener('click', (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript:')) {
        mouseEvent.preventDefault();
        return;
      }

      if (this.isInternalLink(href)) {
        mouseEvent.preventDefault();
        const url = this.extractRouteUrl(href);
        this.router.navigateByUrl(url).catch(error => {
          console.error('Navigation failed:', error);
          window.location.href = href;
        });
      }
    });
  }

  private isInternalLink(href: string): boolean {
    if (href.startsWith('/')) {
      return true;
    }
    if (!href.includes('://') && !href.startsWith('//')) {
      return true;
    }
    try {
      const url = new URL(href, window.location.origin);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  private extractRouteUrl(href: string): string {
    try {
      const url = new URL(href, window.location.origin);
      return url.pathname + url.search;
    } catch {
      return href;
    }
  }
}
