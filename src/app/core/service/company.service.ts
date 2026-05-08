import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { INewsItem, INewsDetail, INewsListResponse } from '../interface/ICompany';
import { IProductItem, IProductDetail, IProductListResponse } from '../interface/IProduct';
import { IJobItem, IJobListResponse, IContactForm } from '../interface/IJob';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService extends ApiService {
  private get abpApiUrl(): string {
    return `${environment.abpApi.url}/api/app`;
  }

  private get requestOptions() {
    return {
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    };
  }

  getNewsList(params?: {
    pageIndex?: number;
    pageSize?: number;
    category?: string;
    keyword?: string;
  }): Observable<INewsListResponse> {
    const httpParams = new HttpParams()
      .set('pageIndex', (params?.pageIndex ?? 1).toString())
      .set('pageSize', (params?.pageSize ?? 10).toString())
      .set('category', params?.category ?? '')
      .set('keyword', params?.keyword ?? '');
    
    return this.http.get<INewsListResponse>(`${this.abpApiUrl}/news`, {
      ...this.requestOptions,
      params: httpParams,
    });
  }

  getNewsById(id: string): Observable<INewsDetail> {
    return this.http.get<INewsDetail>(`${this.abpApiUrl}/news/${id}`, this.requestOptions);
  }

  getNewsBySlug(slug: string): Observable<INewsDetail> {
    return this.http.get<INewsDetail>(`${this.abpApiUrl}/news/by-slug/${slug}`, this.requestOptions);
  }

  getProducts(params?: {
    pageIndex?: number;
    pageSize?: number;
    category?: string;
  }): Observable<IProductListResponse> {
    const httpParams = new HttpParams()
      .set('pageIndex', (params?.pageIndex ?? 1).toString())
      .set('pageSize', (params?.pageSize ?? 10).toString())
      .set('category', params?.category ?? '');
    
    return this.http.get<IProductListResponse>(`${this.abpApiUrl}/products`, {
      ...this.requestOptions,
      params: httpParams,
    });
  }

  getProductById(id: string): Observable<IProductDetail> {
    return this.http.get<IProductDetail>(`${this.abpApiUrl}/products/${id}`, this.requestOptions);
  }

  getProductBySlug(slug: string): Observable<IProductDetail> {
    return this.http.get<IProductDetail>(`${this.abpApiUrl}/products/by-slug/${slug}`, this.requestOptions);
  }

  getJobs(params?: {
    pageIndex?: number;
    pageSize?: number;
  }): Observable<IJobListResponse> {
    const httpParams = new HttpParams()
      .set('pageIndex', (params?.pageIndex ?? 1).toString())
      .set('pageSize', (params?.pageSize ?? 10).toString());
    
    return this.http.get<IJobListResponse>(`${this.abpApiUrl}/jobs`, {
      ...this.requestOptions,
      params: httpParams,
    });
  }

  getJobById(id: string): Observable<IJobItem> {
    return this.http.get<IJobItem>(`${this.abpApiUrl}/jobs/${id}`, this.requestOptions);
  }

  submitContactForm(form: IContactForm): Observable<void> {
    return this.http.post<void>(`${this.abpApiUrl}/contact`, form, this.requestOptions);
  }
}
