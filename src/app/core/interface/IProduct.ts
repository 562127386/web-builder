export interface IProductItem {
  id: string;
  name: string;
  slug: string;
  summary: string;
  coverImage: string;
  category: string;
  price: number;
}

export interface IProductDetail extends IProductItem {
  description: string;
  gallery: string[];
  features: string[];
  specifications: Record<string, string>;
}

export interface IProductListResponse {
  items: IProductItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}
