# Web-Builder 公司官网规格说明书

## 1. 项目概述

### 1.1 项目背景
使用 Web-Builder 框架构建一个现代化公司官网，追求简约大方、科技感的设计风格。

### 1.2 设计风格
- **整体风格**: 简约、科技感、现代
- **色彩方案**:
  - 主色: 深蓝色 (#1a365d)
  - 辅助色: 科技蓝 (#3182ce)
  - 强调色: 活力橙 (#ed8936)
  - 背景色: 浅灰 (#f7fafc) / 深灰 (#1a202c)
- **字体**: 思源黑体 / Noto Sans SC
- **动效**: AOS 滚动动画、GSAP 交互动画

### 1.3 主要模块

| 页面 | 路由 | 说明 | 数据来源 |
|------|------|------|----------|
| 首页 | `/` | 公司介绍、核心优势、产品推荐、新闻动态 | 静态JSON + ABP API |
| 新闻中心 | `/news` | 新闻列表 | ABP API |
| 新闻详情 | `/news/{slug}` | 新闻正文 | ABP API |
| 产品中心 | `/products` | 产品列表 | ABP API |
| 产品详情 | `/products/{slug}` | 产品介绍 | ABP API |
| 关于我们 | `/about` | 公司介绍、发展历程、团队展示 | 静态JSON |
| 人才招聘 | `/careers` | 招聘职位列表 | ABP API |
| 联系方式 | `/contact` | 联系方式、表单提交 | 静态JSON + ABP API |

---

## 2. 前端架构

### 2.1 技术栈
- **框架**: Angular 16+
- **UI 库**: Angular Material
- **状态管理**: RxJS + Service
- **动画**: GSAP + AOS
- **构建工具**: Angular CLI

### 2.2 页面渲染机制

```
URL 请求 → PageComponent → ContentService → API/JSON → 动态组件渲染
```

**页面配置文件结构**:
```typescript
interface IPage {
  title: string;
  meta?: any[];
  body: IBlock[];  // 内容块数组
}

interface IBlock {
  type: string;     // 组件类型: 'hero', 'showcase', 'list', 'text' 等
  [key: string]: any;  // 组件配置参数
}
```

### 2.3 核心组件映射

| Block Type | Angular Component | 用途 |
|------------|-------------------|------|
| `hero` | HeroComponent | 首屏大图/轮播 |
| `showcase` | ShowcaseComponent | 卡片列表展示 |
| `list` | ListComponent | 列表展示 |
| `text` | TextComponent | 文本内容 |
| `feature-box` | FeatureBoxComponent | 特性展示 |
| `contact-form` | FormComponent | 联系表单 |

---

## 3. ABP 后端对接方案

### 3.1 API 架构设计

**Base URL**: `http://localhost:5000/api/app/`

**认证方式**:
- JWT Bearer Token
- 公开内容无需认证
- 表单提交需要简单认证

### 3.2 API 端点设计

#### 3.2.1 新闻接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/news` | 获取新闻列表 | 否 |
| GET | `/news/{id}` | 获取新闻详情 | 否 |

**新闻列表响应**:
```json
{
  "items": [
    {
      "id": "guid",
      "title": "新闻标题",
      "slug": "news-title",
      "summary": "新闻摘要",
      "coverImage": "/assets/images/news/cover.jpg",
      "category": "公司新闻",
      "publishDate": "2024-01-15T10:00:00Z",
      "author": "Admin"
    }
  ],
  "totalCount": 100,
  "pageIndex": 1,
  "pageSize": 10
}
```

**新闻详情响应**:
```json
{
  "id": "guid",
  "title": "新闻标题",
  "slug": "news-title",
  "body": "<p>HTML 内容</p>",
  "coverImage": "/assets/images/news/cover.jpg",
  "category": "公司新闻",
  "publishDate": "2024-01-15T10:00:00Z",
  "author": "Admin",
  "views": 1234
}
```

#### 3.2.2 产品接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/products` | 获取产品列表 | 否 |
| GET | `/products/{id}` | 获取产品详情 | 否 |

**产品列表响应**:
```json
{
  "items": [
    {
      "id": "guid",
      "name": "产品名称",
      "slug": "product-name",
      "summary": "产品简介",
      "coverImage": "/assets/images/products/cover.jpg",
      "category": "拳头产品",
      "price": 9999.00
    }
  ],
  "totalCount": 50,
  "pageIndex": 1,
  "pageSize": 12
}
```

**产品详情响应**:
```json
{
  "id": "guid",
  "name": "产品名称",
  "slug": "product-name",
  "description": "<p>HTML 详细描述</p>",
  "coverImage": "/assets/images/products/cover.jpg",
  "gallery": [
    "/assets/images/products/gallery1.jpg",
    "/assets/images/products/gallery2.jpg"
  ],
  "category": "拳头产品",
  "price": 9999.00,
  "features": ["特性1", "特性2", "特性3"],
  "specifications": {
    "尺寸": "100x200x50mm",
    "重量": "500g"
  }
}
```

#### 3.2.3 招聘接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/jobs` | 获取职位列表 | 否 |
| GET | `/jobs/{id}` | 获取职位详情 | 否 |

#### 3.2.4 联系方式接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/contact` | 提交联系表单 | 否 |

**联系表单请求**:
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "company": "公司名称",
  "subject": "合作咨询",
  "message": "我想了解更多信息..."
}
```

---

## 4. 页面设计规格

### 4.1 首页 (`/`)

**布局结构**:
1. **导航栏** (Header)
   - Logo
   - 主导航菜单
   - 语言切换
   - 联系我们按钮

2. **Hero 区域**
   - 全屏背景/视频
   - 主标题 + 副标题
   - CTA 按钮

3. **核心优势** (4列特性展示)
   - 技术实力
   - 产品创新
   - 服务保障
   - 行业经验

4. **产品推荐** (3-4产品卡片)
   - 封面图
   - 产品名称
   - 简短描述
   - 查看详情链接

5. **新闻动态** (3条最新新闻)
   - 新闻标题
   - 发布日期
   - 摘要

6. **关于我们** (图文混排)
   - 公司简介
   - 核心数据展示

7. **页脚** (Footer)
   - 联系方式
   - 快速链接
   - 社交媒体
   - 版权信息

### 4.2 新闻中心 (`/news`)

**布局结构**:
1. **页面标题区**
   - 标题: 新闻中心
   - 面包屑导航

2. **筛选栏**
   - 全部分类 / 公司新闻 / 行业动态
   - 搜索框

3. **新闻列表**
   - 卡片式布局
   - 分页

### 4.3 产品中心 (`/products`)

**布局结构**:
1. **页面标题区**
   - 标题: 产品中心
   - 面包屑导航

2. **产品分类**
   - 分类标签筛选

3. **产品网格**
   - 4列网格布局
   - 产品卡片
   - 分页

### 4.4 关于我们 (`/about`)

**布局结构**:
1. **公司介绍**
   - 发展历程时间轴
   - 核心数据

2. **团队展示**
   - 团队成员卡片

3. **荣誉资质**
   - 资质证书展示

### 4.5 人才招聘 (`/careers`)

**布局结构**:
1. **招聘理念**
   - 人才政策
   - 福利待遇

2. **职位列表**
   - 职位名称
   - 工作地点
   - 薪资范围
   - 发布时间

### 4.6 联系方式 (`/contact`)

**布局结构**:
1. **联系信息**
   - 地址
   - 电话
   - 邮箱
   - 地图

2. **联系表单**
   - 姓名
   - 邮箱
   - 电话
   - 公司
   - 主题
   - 留言

---

## 5. 前端文件结构

```
src/assets/app/
├── home.json           # 首页配置
├── news.json           # 新闻中心配置
├── news-detail.json    # 新闻详情配置
├── products.json       # 产品中心配置
├── product-detail.json # 产品详情配置
├── about.json          # 关于我们配置
├── careers.json        # 人才招聘配置
├── contact.json        # 联系方式配置
└── core/
    ├── branding.json   # 品牌配置(导航、页脚)
    └── base.json      # 基础配置
```

---

## 6. 代理配置

### 6.1 开发环境 (proxy.config.js)
```javascript
{
  context: [
    '/api',
    '/oauth',
    '/assets/app'
  ],
  target: 'http://localhost:5000',
  secure: false,
  changeOrigin: true
}
```

### 6.2 生产环境
- Nginx 反向代理到 ABP API
- 静态资源使用 CDN

---

## 7. 性能优化

### 7.1 首屏加载
- 关键 CSS 内联
- 首屏图片预加载
- 服务端渲染 (SSR)

### 7.2 运行时
- 图片懒加载
- 组件懒加载
- 请求缓存

---

## 8. SEO 优化

### 8.1 Meta 标签
- Title
- Description
- Keywords
- Open Graph
- Twitter Card

### 8.2 结构化数据
- Organization
- Product
- NewsArticle
- BreadcrumbList

---

## 9. 响应式断点

| 设备 | 宽度 | 布局 |
|------|------|------|
| Mobile | < 768px | 单列，折叠导航 |
| Tablet | 768px - 1024px | 2列网格 |
| Desktop | 1024px - 1440px | 正常布局 |
| Large | > 1440px | 宽屏布局 |

---

## 10. 浏览器兼容

| 浏览器 | 版本 |
|--------|------|
| Chrome | 最新版 + 1个版本 |
| Firefox | 最新版 + 1个版本 |
| Safari | 最新版 + 1个版本 |
| Edge | 最新版 + 1个版本 |
