import { Injectable, inject } from '@angular/core';
import { QueryStateService } from './query-state.service';

@Injectable({ providedIn: 'root' })
export class FormChangeService {
  private queryState = inject(QueryStateService);

  onFormChange(componentId: string, value: any): void {
    const params: any = {};
    Object.keys(value).forEach(key => {
      if (value[key]) {
        params[key] = value[key];
      }
    });
    this.queryState.setQuery(componentId, params);
  }
}