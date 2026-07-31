import { Injectable, inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '@core/service/api.service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);

  toFormGroup(items: any[]): any {
    const group: any = {};
    items.forEach((item: any) => {
      switch (item.type) {
        case 'datepicker':
          if (item.range) {
            group.start = item.params?.required
              ? new UntypedFormControl(item.start || '', Validators.required)
              : new UntypedFormControl(item.start || '');
            group.end = item.params?.required
              ? new UntypedFormControl(item.end || '', Validators.required)
              : new UntypedFormControl(item.end || '');
          }
          if (!item.range && item.key) {
            group[item.key] = item.params?.required
              ? new UntypedFormControl(item.value || '', Validators.required)
              : new UntypedFormControl(item.value || '');
          }
          break;
        case 'select':
          if (item.multiple) {
            const value = item?.value?.split('+') || '';
            group[item.key] = item.params?.required
              ? new UntypedFormControl(value, Validators.required)
              : new UntypedFormControl(value);
          } else {
            group[item.key] = item.params?.required
              ? new UntypedFormControl(item.value || '', Validators.required)
              : new UntypedFormControl(item.value || '');
          }
          break;
        default:
          if (item.key) {
            group[item.key] = item.params?.required
              ? new UntypedFormControl(item.value || '', Validators.required)
              : new UntypedFormControl(item.value || '');
          }
      }
    });
    return new UntypedFormGroup(group);
  }

  getwebFormData(params: any, value: any): any {
    const id = {
      webform_id: params.webform_id,
    };
    return Object.assign({}, id, value);
  }

  submitWebForm(data: any): Observable<any> {
    return this.apiService.getToken().pipe(
      switchMap((token: string) => {
        const headers = new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // 关键：从Cookie读取防伪令牌
          RequestVerificationToken: this.getCookie('.AspNetCore.Antiforgery.UCJP0csReIw')
        });

   //     return this.http.post(`${this.apiService.apiUrl}/app-api/submit`, data, {
  // return this.http.post(`/app-api/submit`, data, {
        return this.http.post(`http://newapi.lightcomm.com/app-api/submit`, data, {
          headers,
          withCredentials: true
        });
      })
    );
  }
  //这些方法都不行白扯
//   .AspNetCore.Antiforgery.UCJP0csReIw 是 HttpOnly 的，前端 JS 读不到
// 你手动写的 getCookie 对它完全无效
// 直接加 RequestVerificationToken 头是做不到的，除非你用 ABP 官方的 Angular 包
// 工具方法：读取防伪Cookie
private getCookie(name: string): string   {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}
  handleRangeDate(value: any): any {
    if (value.date) {
      if (value.date.start) {
        value.start = formatDate(value.date.start, 'yyyy-MM-dd', 'en-US');
      }
      if (value.date.end) {
        value.end = formatDate(value.date.end, 'yyyy-MM-dd', 'en-US');
      }
      delete value.date;
    }
    return value;
  }
}
