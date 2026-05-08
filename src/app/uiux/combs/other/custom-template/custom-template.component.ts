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
import { ActivatedRoute, ParamMap } from '@angular/router';
import { QueryStateService } from '@core/service/query-state.service';  // 查询状态管理服务
import { CompanyService } from '@core/service/company.service';
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

  ngAfterViewInit(): void {
    this.template = this.ele.nativeElement.querySelector('.template');
    // 生成组件唯一 ID，优先使用配置中的 id，否则自动生成
    this.componentId = this.content.id || `template-${Date.now()}`;

    // 加载 FontAwesome 图标库
    const fontawesome = this.util.getLibraries('fontAwesome', 'cdn', 'style');
    this.util.loadStyle(fontawesome);

    // 初始化监听
    this.setupRouteParamsListener();   // 监听路由参数和查询参数
    this.setupQueryStateListener();    // 监听查询状态变化
    this.loadSelectOptions();          // 加载动态 select 选项
    this.render(this.content);         // 渲染模板
  }

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
          map.set(fieldName, response.items || []);
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
   * 当 select 值变化时更新查询状态
   */
  private setupSelectEventListeners(): void {
    const selects = this.ele.nativeElement.querySelectorAll('select[data-query-field]');
    selects.forEach((select: HTMLSelectElement) => {
      select.addEventListener('change', (event: Event) => {
        const target = event.target as HTMLSelectElement;
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
      });
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
      let queryParams = '';

      // 保留原始 URL 中的查询参数，追加新参数
      if (params && params.length > 0) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + params;
      }

      this.nodeService
        .fetch(fullUrl, queryParams)
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
    const data = {
      ...content,
      selectOptions: Object.fromEntries(this.selectOptions()),
    };
    // 净化 HTML 防止 XSS 攻击
    const sanitized = DOMPurify.sanitize(html, { ADD_TAGS: ['style'], FORCE_BODY: true });
    this.template.innerHTML = Mustache.render(sanitized, data);
  }
}
