import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class QueryStateService {
  private states = new Map<string, any>();
  private stateSignals = new Map<string, any>();

  setQuery(componentId: string, params: any): void {
    this.states.set(componentId, params);
    const signal = this.stateSignals.get(componentId);
    if (signal) {
      signal.set(params);
    }
  }

  getQuery(componentId: string): any {
    return this.states.get(componentId) || {};
  }

  watchQuery(componentId: string): any {
    if (!this.stateSignals.has(componentId)) {
      const initialValue = this.states.get(componentId) || {};
      this.stateSignals.set(componentId, signal(initialValue));
    }
    return this.stateSignals.get(componentId);
  }

  clearQuery(componentId: string): void {
    this.states.delete(componentId);
    const signal = this.stateSignals.get(componentId);
    if (signal) {
      signal.set({});
    }
  }
}
