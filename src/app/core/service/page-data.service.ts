import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, map } from 'rxjs';
import { CompanyService } from './company.service';
import { INewsItem, INewsDetail } from '../interface/ICompany';
import { IProductItem, IProductDetail } from '../interface/IProduct';
import { IJobItem } from '../interface/IJob';

@Injectable({
  providedIn: 'root',
})
export class PageDataService {
  private companyService = inject(CompanyService);

  enrichPageContent(pageContent: any, pageUrl: string): Observable<any> {
    if (!pageContent || !pageContent.body) {
      return of(pageContent);
    }

    const path = this.extractPath(pageUrl);
    return this.processBodyElements(pageContent, path);
  }

  private extractPath(pageUrl: string): string {
    const pathname = pageUrl.split('?')[0];
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  }

  private processBodyElements(pageContent: any, path: string): Observable<any> {
    const bodyPromises: Observable<void>[] = [];

    pageContent.body.forEach((block: any, index: number) => {
      const observable = this.processBlock(block, path, index);
      if (observable) {
        bodyPromises.push(observable);
      }
    });

    if (bodyPromises.length === 0) {
      return of(pageContent);
    }

    return new Observable(observer => {
      let completedCount = 0;
      bodyPromises.forEach(obs => {
        obs.subscribe({
          next: () => {
            completedCount++;
            if (completedCount === bodyPromises.length) {
              observer.next(pageContent);
              observer.complete();
            }
          },
          error: () => {
            completedCount++;
            if (completedCount === bodyPromises.length) {
              observer.next(pageContent);
              observer.complete();
            }
          },
        });
      });
    });
  }

  private processBlock(block: any, path: string, index: number): Observable<void> | null {
    if (!block || !block.type) {
      return null;
    }

    switch (block.type) {
      case 'news-list':
        return this.loadNewsData(block, path);
      case 'product-list':
        return this.loadProductData(block, path);
      case 'job-list':
        return this.loadJobData(block, path);
      case 'news-detail':
        return this.loadNewsDetail(block, path);
      case 'product-detail':
        return this.loadProductDetail(block, path);
      case 'showcase2v4':
        return this.loadShowcaseData(block, path);
      case 'showcase3v3':
        return this.loadShowcase3v3Data(block, path);
      default:
        return null;
    }
  }

  private loadNewsData(block: any, path: string): Observable<void> {
    const params = {
      pageIndex: block.params?.pageIndex || 1,
      pageSize: block.params?.pageSize || 6,
      category: block.params?.category,
      keyword: block.params?.keyword,
    };

    return this.companyService.getNewsList(params).pipe(
      map(response => {
        block.elements = this.transformNewsToElements(response.items);
        block.pager = {
          totalItems: response.totalCount,
          currentPage: response.pageIndex,
          itemsPerPage: response.pageSize,
          totalPages: Math.ceil(response.totalCount / response.pageSize),
        };
      })
    );
  }

  private loadProductData(block: any, path: string): Observable<void> {
    const params = {
      pageIndex: block.params?.pageIndex || 1,
      pageSize: block.params?.pageSize || 8,
      category: block.params?.category,
    };

    return this.companyService.getProducts(params).pipe(
      map(response => {
        block.elements = this.transformProductToElements(response.items);
        block.pager = {
          totalItems: response.totalCount,
          currentPage: response.pageIndex,
          itemsPerPage: response.pageSize,
          totalPages: Math.ceil(response.totalCount / response.pageSize),
        };
      })
    );
  }

  private loadJobData(block: any, path: string): Observable<void> {
    const params = {
      pageIndex: block.params?.pageIndex || 1,
      pageSize: block.params?.pageSize || 10,
    };

    return this.companyService.getJobs(params).pipe(
      map(response => {
        block.elements = this.transformJobToElements(response.items);
      })
    );
  }

  private loadNewsDetail(block: any, path: string): Observable<void> {
    const slugMatch = path.match(/news\/([^/]+)/);
    if (!slugMatch) {
      return of();
    }

    const slug = slugMatch[1];
    return this.companyService.getNewsBySlug(slug).pipe(
      map(news => {
        block.title = { label: news.title };
        block.date = news.publishDate;
        block.category = news.category;
        block.body = news.body;
        block.author = news.author;
        block.views = news.views;
        if (news.coverImage) {
          block.coverImage = news.coverImage;
        }
      })
    );
  }

  private loadProductDetail(block: any, path: string): Observable<void> {
    const slugMatch = path.match(/products\/([^/]+)/);
    if (!slugMatch) {
      return of();
    }

    const slug = slugMatch[1];
    return this.companyService.getProductBySlug(slug).pipe(
      map(product => {
        block.name = product.name;
        block.price = product.price;
        block.description = product.description;
        block.category = product.category;
        if (product.coverImage) {
          block.coverImage = product.coverImage;
        }
        if (product.gallery) {
          block.gallery = product.gallery;
        }
        if (product.features) {
          block.features = product.features;
        }
        if (product.specifications) {
          block.specifications = product.specifications;
        }
      })
    );
  }

  private loadShowcaseData(block: any, path: string): Observable<void> {
    if (!block.dataSource) {
      return of();
    }

    switch (block.dataSource.type) {
      case 'news':
        return this.companyService
          .getNewsList({ pageSize: block.dataSource.limit || 4 })
          .pipe(
            map(response => {
              block.elements = this.transformNewsToCardElements(response.items);
            })
          );
      case 'products':
        return this.companyService
          .getProducts({ pageSize: block.dataSource.limit || 4 })
          .pipe(
            map(response => {
              block.elements = this.transformProductToCardElements(response.items);
            })
          );
      default:
        return of();
    }
  }

  private loadShowcase3v3Data(block: any, path: string): Observable<void> {
    if (!block.dataSource) {
      return of();
    }

    if (block.dataSource.type === 'news') {
      return this.companyService
        .getNewsList({ pageSize: block.dataSource.limit || 3 })
        .pipe(
          map(response => {
            block.elements = this.transformNewsToShowcase3v3Elements(response.items);
          })
        );
    }

    return of();
  }

  private transformNewsToElements(items: INewsItem[]): any[] {
    return items.map(item => ({
      type: 'card-1v1',
      link: {
        href: `/news/${item.slug}`,
        label: item.title,
      },
      time: item.publishDate,
      user: item.author,
      moreLabel: '阅读更多',
    }));
  }

  private transformProductToElements(items: IProductItem[]): any[] {
    return items.map(item => ({
      type: 'card-1v1',
      feature: {
        icon: { svg: 'package' },
        title: item.name,
        value: item.price ? `¥${item.price.toLocaleString()}` : '',
        desc: item.summary,
      },
      link: {
        href: `/products/${item.slug}`,
        label: '查看详情',
      },
    }));
  }

  private transformJobToElements(items: IJobItem[]): any[] {
    return items.map(item => ({
      type: 'card-1v1',
      link: {
        href: `/careers/${item.slug}`,
        label: item.title,
      },
      time: item.publishDate,
      moreLabel: item.location,
    }));
  }

  private transformNewsToCardElements(items: INewsItem[]): any[] {
    return items.map(item => ({
      type: 'card-1v1',
      link: {
        href: `/news/${item.slug}`,
        label: item.title,
      },
      time: item.publishDate,
      user: item.author,
    }));
  }

  private transformProductToCardElements(items: IProductItem[]): any[] {
    return items.map(item => ({
      type: 'card-1v1',
      feature: {
        icon: { svg: 'box' },
        title: item.name,
        value: item.price ? `¥${item.price.toLocaleString()}` : '',
        desc: item.summary,
      },
      link: {
        href: `/products/${item.slug}`,
        label: '查看详情',
      },
    }));
  }

  private transformNewsToShowcase3v3Elements(items: INewsItem[]): any[] {
    return items.map(item => ({
      type: 'showcase3v3',
      title: {
        href: `/news/${item.slug}`,
        label: item.title,
      },
      date: item.publishDate,
      category: item.category,
      body: item.summary,
      details: {
        label: '阅读全文',
        href: `/news/${item.slug}`,
      },
    }));
  }
}
