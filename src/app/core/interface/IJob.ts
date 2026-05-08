export interface IJobItem {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  salaryRange: string;
  description: string;
  requirements: string;
  isActive: boolean;
  publishDate: string;
}

export interface IJobListResponse {
  items: IJobItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface IContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}
