import { Injectable, inject } from '@angular/core';
import type { CalendarOptions } from '@fullcalendar/core';
import { Subject } from 'rxjs';
import { ScreenService } from '@core/service/screen.service';

@Injectable({
  providedIn: 'root',
})
export class CalendarState {
  private screenSerivce = inject(ScreenService);

  public calendarChange$ = new Subject();
  public default: CalendarOptions | null = null;

  async initCalendar(): Promise<CalendarOptions> {
    if (this.default) {
      return this.default;
    }

    if (!this.screenSerivce.isPlatformBrowser()) {
      return {} as CalendarOptions;
    }

    const [dayGridPlugin, timeGridPlugin, listPlugin] = await Promise.all([
      import('@fullcalendar/daygrid').then(m => m.default),
      import('@fullcalendar/timegrid').then(m => m.default),
      import('@fullcalendar/list').then(m => m.default),
    ]);

    this.default = {
      initialView: 'dayGridMonth',
      locale: 'zh-cn',
      handleWindowResize: true,
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      firstDay: 0,
      allDayText: '全天',
      headerToolbar: {
        start: 'prev today next',
        center: 'title',
        end: 'dayGridMonth timeGridWeek timeGridDay listWeek',
      },
      buttonText: {
        today: '今天',
        month: '月份',
        week: '星期',
        day: '日',
        list: '列表',
      },
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
    };

    return this.default;
  }

  getPreviousDay(date = new Date()): Date {
    const previous = new Date(date.getTime());
    previous.setDate(date.getDate() - 1);
    return previous;
  }
}
