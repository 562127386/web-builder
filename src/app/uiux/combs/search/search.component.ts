import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  DestroyRef,
  signal,
  effect,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { omitBy, isEmpty } from 'lodash-es';
import { NodeService } from '@core/service/node.service';
import { RouteService } from '@core/service/route.service';
import { BaseComponent } from '../../base/base.widget';
import { UntypedFormGroup } from '@angular/forms';
import { FormService } from '@core/service/form.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ScreenService } from '@core/service/screen.service';
import { Subject } from 'rxjs';
import type { ISearch } from '@core/interface/combs/ISearch';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SearchComponent extends BaseComponent implements OnInit {
  @Input() content: ISearch;
  private page: number;
  public pager: any;
  public form: UntypedFormGroup = new UntypedFormGroup({});
  public filterForm: any[];
  public nodes: any[];
  public loading = signal(false);
  private vauleChange$: Subject<any> = new Subject<any>();

  private nodeService = inject(NodeService);
  private router = inject(ActivatedRoute);
  private routerService = inject(RouteService);
  private formService = inject(FormService);
  private screenService = inject(ScreenService);
  private destroyRef = inject(DestroyRef);
  private cd = inject(ChangeDetectorRef);

  constructor() {
    super();
    effect(() => {
      this.loading();
      this.cd.markForCheck();
    });
  }

  ngOnInit(): void {
    if (this.screenService.isPlatformBrowser()) {
      this.router.queryParams.subscribe((query: any) => {
        this.page = query.page || 0;
        const querys = omitBy(
          Object.assign(
            {
              page: this.page,
            },
            query
          ),
          isEmpty
        );
        if (this.content.sidebar && this.content.sidebar.length > 0) {
          this.initFilterForm(querys, this.content.sidebar);
        } else {
          this.initDefaultForm();
        }
        this.form.patchValue({ ...querys });
        this.nodeSearch(querys);
      });
    } else {
      this.form = new UntypedFormGroup({});
    }
  }

  initDefaultForm(): void {
    this.form = this.formService.toFormGroup([
      {
        key: 'keys',
        type: 'text',
        value: '',
      },
    ]);
    this.filterForm = [{ key: 'keys', type: 'text' }];
  }

  initFilterForm(querys: any, sidebar: any[]): void {
    this.filterForm = this.initFormValueWithUrlQuery(querys, sidebar);
    this.initForm(this.filterForm);
  }

  initForm(items: any[]): void {
    this.form = this.formService.toFormGroup(items);
    this.vauleChange$
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.onSelectChange(value);
      });
  }

  onSearch(value: any): void {
    const { keys } = value;
    if (keys) {
      this.form.patchValue({ keys });
    }
    this.page = 0;
    this.nodeSearch(value);
  }

  onPageChange(page: any): void {
    this.page = page;
    this.nodeSearch({ page: this.page });
  }

  onSelectChange(options: any): void {
    this.page = options.page;
    this.nodeSearch(options);
  }

  nodeSearch(options: any): void {
    this.loading.set(true);
    if (!this.content || !this.content.api) {
      console.error('SearchComponent: content or api is undefined');
      this.loading.set(false);
      return;
    }
    const { api } = this.content;
    const formValue = this.form?.value || {};
    const state = this.getParamsState(formValue, options);
    const params = this.getApiParams(state);
    console.log('SearchComponent: calling API', api, params);
    this.nodeService
      .fetch(api, params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          console.log('SearchComponent: API response', data);
          this.loading.set(false);
          this.updateList(data, formValue, options);
        },
        error: (error) => {
          console.error('SearchComponent: API error', error);
          this.loading.set(false);
        }
      });
  }

  updateList(data: any, formValues: any, options: any): void {
    const pager = data.pager;
    this.pager = this.handlerPager(pager);
    this.nodes = this.processNodes(data.rows);
    this.routerService.updateQueryParams(this.getUrlQuery(formValues, options));
  }

  private processNodes(rows: any[]): any[] {
    if (!rows || !Array.isArray(rows)) return [];
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-yellow-100 text-yellow-700 border-yellow-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
    ];
    return rows.map((item, index) => {
      let tags: string[] = [];
      if (item.tagTypes) {
        try {
          tags = JSON.parse(item.tagTypes);
        } catch {
          tags = [];
        }
      }
      return {
        ...item,
        tags: tags.map((tag, i) => ({
          label: tag,
          colorClass: colors[i % colors.length],
        })),
      };
    });
  }
}
