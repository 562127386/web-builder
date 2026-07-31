import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import type { EChartsOption } from 'echarts/types/dist/shared';
import { isArray } from 'lodash-es';
import { ScreenService } from '@core/service/screen.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: false,
})
export class ChartComponent implements OnInit, AfterViewInit {
  @Input() content: EChartsOption;
  @Input() data: any;
  @Input() style: any;
  @ViewChild('echarts', { read: ElementRef }) echarts: ElementRef;

  private theme = signal<object>({});
  private screenService = inject(ScreenService);

  ngOnInit(): void {
    this.theme.set(
      Object.assign(
        {
          color: ['#2E9BFF', '#987BE9', '#FAA16F', '#9DD094', '#FF6461'],
        },
        this.data?.theme
      )
    );
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.screenService.isPlatformBrowser()) {
      return;
    }

    const [echarts, GridComponent, TitleComponent, LegendComponent, TooltipComponent, 
           DatasetComponent, TransformComponent, GraphicComponent, LabelLayout, 
           UniversalTransition, CanvasRenderer, BarChart, LineChart, PieChart,
           ScatterChart, RadarChart, MapChart, CandlestickChart, GraphChart,
           TreeChart, SunburstChart, SankeyChart, FunnelChart, GaugeChart, 
           ThemeRiverChart] = await Promise.all([
      import('echarts/core'),
      import('echarts/components').then(m => m.GridComponent),
      import('echarts/components').then(m => m.TitleComponent),
      import('echarts/components').then(m => m.LegendComponent),
      import('echarts/components').then(m => m.TooltipComponent),
      import('echarts/components').then(m => m.DatasetComponent),
      import('echarts/components').then(m => m.TransformComponent),
      import('echarts/components').then(m => m.GraphicComponent),
      import('echarts/features').then(m => m.LabelLayout),
      import('echarts/features').then(m => m.UniversalTransition),
      import('echarts/renderers').then(m => m.CanvasRenderer),
      import('echarts/charts').then(m => m.BarChart),
      import('echarts/charts').then(m => m.LineChart),
      import('echarts/charts').then(m => m.PieChart),
      import('echarts/charts').then(m => m.ScatterChart),
      import('echarts/charts').then(m => m.RadarChart),
      import('echarts/charts').then(m => m.MapChart),
      import('echarts/charts').then(m => m.CandlestickChart),
      import('echarts/charts').then(m => m.GraphChart),
      import('echarts/charts').then(m => m.TreeChart),
      import('echarts/charts').then(m => m.SunburstChart),
      import('echarts/charts').then(m => m.SankeyChart),
      import('echarts/charts').then(m => m.FunnelChart),
      import('echarts/charts').then(m => m.GaugeChart),
      import('echarts/charts').then(m => m.ThemeRiverChart),
    ]);

    echarts.use([
      TitleComponent,
      TooltipComponent,
      GridComponent,
      DatasetComponent,
      TransformComponent,
      LegendComponent,
      BarChart,
      LineChart,
      LabelLayout,
      UniversalTransition,
      CanvasRenderer,
      PieChart,
      ScatterChart,
      RadarChart,
      MapChart,
      CandlestickChart,
      GraphChart,
      GraphicComponent,
      TreeChart,
      SunburstChart,
      SankeyChart,
      FunnelChart,
      GaugeChart,
      ThemeRiverChart,
    ]);

    const chart = echarts.init(this.echarts.nativeElement, this.theme());
    chart.setOption(this.content);
  }

  onChange(chart: any): void {
    if (isArray(this.content.series)) {
      this.content.series.forEach((item: any) => {
        item.type = chart.value;
      });
      this.content = { ...this.content };
    }
  }
}
