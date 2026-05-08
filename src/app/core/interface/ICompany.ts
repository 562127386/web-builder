export interface INewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  category: string;
  publishDate: string;
  author: string;
}

export interface INewsDetail extends INewsItem {
  body: string;
  views: number;
}

export interface INewsListResponse {
  items: INewsItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}
