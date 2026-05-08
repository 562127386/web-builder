# 公司官网实施任务清单

## 第一阶段：项目初始化与配置

### 1.1 环境检查
- [ ] Node.js 18+ 已安装
- [ ] Angular CLI 已安装
- [ ] .NET 8 SDK 已安装 (ABP 后端)
- [ ] 代码编辑器配置完成

### 1.2 项目结构分析
- [ ] 分析 Web-Builder 现有架构
- [ ] 确定需要扩展的组件
- [ ] 设计页面 JSON 配置结构

### 1.3 代理配置
- [ ] 更新 `proxy.config.js` 添加 ABP API 代理
- [ ] 配置开发环境 API 路径

---

## 第二阶段：ABP 后端实现

### 2.1 项目创建
- [ ] 使用 ABP CLI 创建后端项目
- [ ] 配置数据库连接
- [ ] 添加必要的 NuGet 包

### 2.2 实体定义

#### 2.2.1 新闻实体 (News)
- [ ] Id (Guid)
- [ ] Title (string, 必填)
- [ ] Slug (string, 必填, 唯一)
- [ ] Summary (string)
- [ ] Body (string, HTML)
- [ ] CoverImage (string)
- [ ] Category (string)
- [ ] PublishDate (DateTime)
- [ ] Author (string)
- [ ] Views (int)

#### 2.2.2 产品实体 (Product)
- [ ] Id (Guid)
- [ ] Name (string, 必填)
- [ ] Slug (string, 必填, 唯一)
- [ ] Summary (string)
- [ ] Description (string, HTML)
- [ ] CoverImage (string)
- [ ] Gallery (string, JSON数组)
- [ ] Category (string)
- [ ] Price (decimal)
- [ ] Features (string, JSON数组)
- [ ] Specifications (string, JSON对象)

#### 2.2.3 招聘职位实体 (Job)
- [ ] Id (Guid)
- [ ] Title (string, 必填)
- [ ] Slug (string, 必填, 唯一)
- [ ] Department (string)
- [ ] Location (string)
- [ ] SalaryRange (string)
- [ ] Description (string, HTML)
- [ ] Requirements (string, HTML)
- [ ] IsActive (bool)
- [ ] PublishDate (DateTime)

#### 2.2.4 联系表单实体 (ContactSubmission)
- [ ] Id (Guid)
- [ ] Name (string)
- [ ] Email (string)
- [ ] Phone (string)
- [ ] Company (string)
- [ ] Subject (string)
- [ ] Message (string)
- [ ] SubmissionDate (DateTime)
- [ ] IsProcessed (bool)

### 2.3 应用服务

#### 2.3.1 新闻服务 (NewsService)
- [ ] GetNewsListAsync (分页、筛选、排序)
- [ ] GetNewsByIdAsync
- [ ] GetNewsBySlugAsync

#### 2.3.2 产品服务 (ProductService)
- [ ] GetProductsAsync (分页、筛选、排序)
- [ ] GetProductByIdAsync
- [ ] GetProductBySlugAsync

#### 2.3.3 招聘服务 (JobService)
- [ ] GetJobsAsync (分页、筛选)
- [ ] GetJobByIdAsync
- [ ] GetJobBySlugAsync

#### 2.3.4 联系服务 (ContactService)
- [ ] SubmitContactFormAsync

### 2.4 API 控制器

#### 2.4.1 NewsController
- [ ] GET /api/app/news
- [ ] GET /api/app/news/{id}
- [ ] GET /api/app/news/by-slug/{slug}

#### 2.4.2 ProductController
- [ ] GET /api/app/products
- [ ] GET /api/app/products/{id}
- [ ] GET /api/app/products/by-slug/{slug}

#### 2.4.3 JobController
- [ ] GET /api/app/jobs
- [ ] GET /api/app/jobs/{id}

#### 2.4.4 ContactController
- [ ] POST /api/app/contact

### 2.5 数据库迁移
- [ ] 创建初始迁移
- [ ] 执行数据库迁移
- [ ] 添加种子数据

---

## 第三阶段：前端服务层实现

### 3.1 API 服务扩展

#### 3.1.1 创建公司官网服务
- [ ] 创建 `CompanyService` 服务
- [ ] 实现新闻列表 API 调用
- [ ] 实现新闻详情 API 调用
- [ ] 实现产品列表 API 调用
- [ ] 实现产品详情 API 调用
- [ ] 实现招聘列表 API 调用
- [ ] 实现联系表单提交

#### 3.1.2 接口定义
- [ ] 定义 `INewsItem` 接口
- [ ] 定义 `INewsDetail` 接口
- [ ] 定义 `IProductItem` 接口
- [ ] 定义 `IProductDetail` 接口
- [ ] 定义 `IJobItem` 接口
- [ ] 定义 `IContactForm` 接口

---

## 第四阶段：页面配置实现

### 4.1 核心配置文件

#### 4.1.1 Branding 配置
- [ ] 创建 `branding.json`
- [ ] 配置导航菜单
- [ ] 配置页脚内容
- [ ] 配置 Logo

#### 4.1.2 Base 配置
- [ ] 创建 `base.json`
- [ ] 配置主题
- [ ] 配置动画
- [ ] 配置分页

### 4.2 首页 (`/`)

#### 4.2.1 Hero 区域
- [ ] 创建 Hero JSON 配置
- [ ] 配置背景图片/视频
- [ ] 配置主标题
- [ ] 配置 CTA 按钮

#### 4.2.2 核心优势
- [ ] 创建 FeatureBox JSON 配置
- [ ] 配置4列特性展示

#### 4.2.3 产品推荐
- [ ] 创建 Showcase JSON 配置
- [ ] 配置产品卡片列表
- [ ] 配置"查看更多"链接

#### 4.2.4 新闻动态
- [ ] 创建 List JSON 配置
- [ ] 配置新闻列表

#### 4.2.5 关于我们
- [ ] 创建 Text JSON 配置
- [ ] 配置公司简介

### 4.3 新闻中心 (`/news`)

- [ ] 创建 `news.json` 页面配置
- [ ] 配置页面标题
- [ ] 配置分类筛选
- [ ] 配置新闻列表展示

### 4.4 产品中心 (`/products`)

- [ ] 创建 `products.json` 页面配置
- [ ] 配置页面标题
- [ ] 配置产品网格
- [ ] 配置分类标签

### 4.5 关于我们 (`/about`)

- [ ] 创建 `about.json` 页面配置
- [ ] 配置公司介绍
- [ ] 配置发展历程时间轴
- [ ] 配置团队展示
- [ ] 配置荣誉资质

### 4.6 人才招聘 (`/careers`)

- [ ] 创建 `careers.json` 页面配置
- [ ] 配置招聘理念
- [ ] 配置职位列表

### 4.7 联系方式 (`/contact`)

- [ ] 创建 `contact.json` 页面配置
- [ ] 配置联系信息
- [ ] 配置联系表单

---

## 第五阶段：动态数据对接

### 5.1 新闻列表页面对接

- [ ] 修改 News JSON 配置添加 API 路径
- [ ] 创建 NewsList 组件或配置动态加载
- [ ] 实现分页功能
- [ ] 实现分类筛选

### 5.2 新闻详情页面对接

- [ ] 创建 `news-detail` 路由
- [ ] 配置新闻详情页模板
- [ ] 实现根据 slug 加载新闻详情

### 5.3 产品列表页面对接

- [ ] 修改 Products JSON 配置添加 API 路径
- [ ] 创建 ProductList 组件或配置动态加载
- [ ] 实现分页功能
- [ ] 实现分类筛选

### 5.4 产品详情页面对接

- [ ] 创建 `product-detail` 路由
- [ ] 配置产品详情页模板
- [ ] 实现根据 slug 加载产品详情

### 5.5 招聘列表页面对接

- [ ] 创建 Careers JSON 配置
- [ ] 实现职位列表 API 对接

### 5.6 联系表单对接

- [ ] 配置联系表单提交 API
- [ ] 实现表单验证
- [ ] 实现提交成功/失败提示

---

## 第六阶段：UI/UX 优化

### 6.1 响应式布局
- [ ] 移动端导航适配
- [ ] 移动端产品网格调整
- [ ] 移动端新闻列表调整

### 6.2 动画效果
- [ ] AOS 滚动动画配置
- [ ] GSAP 页面过渡动画
- [ ] 按钮悬停效果

### 6.3 加载状态
- [ ] 骨架屏加载
- [ ] 图片懒加载
- [ ] 分页加载指示器

---

## 第七阶段：测试与部署

### 7.1 功能测试
- [ ] 首页所有区块正常显示
- [ ] 新闻列表分页正常
- [ ] 新闻详情加载正常
- [ ] 产品列表分页正常
- [ ] 产品详情加载正常
- [ ] 联系表单提交正常

### 7.2 跨浏览器测试
- [ ] Chrome 浏览器测试
- [ ] Firefox 浏览器测试
- [ ] Safari 浏览器测试
- [ ] Edge 浏览器测试

### 7.3 响应式测试
- [ ] 移动端 (< 768px)
- [ ] 平板端 (768px - 1024px)
- [ ] 桌面端 (> 1024px)

### 7.4 部署准备
- [ ] 生产环境构建
- [ ] ABP 后端部署配置
- [ ] Nginx 配置
- [ ] SSL 证书配置

---

## 任务优先级

### 高优先级 (P0)
1. ABP 后端项目创建和基础配置
2. 新闻/产品实体和应用服务
3. 新闻列表和详情页面对接
4. 产品列表和详情页面对接
5. 首页配置

### 中优先级 (P1)
1. 招聘列表页面对接
2. 联系表单对接
3. 关于我们页面
4. 联系方式页面

### 低优先级 (P2)
1. UI/UX 优化
2. 动画效果增强
3. SEO 优化

---

## 工作量估算

| 阶段 | 工作内容 | 预估时间 |
|------|----------|----------|
| 第一阶段 | 项目初始化 | 1-2 小时 |
| 第二阶段 | ABP 后端实现 | 8-12 小时 |
| 第三阶段 | 前端服务层 | 4-6 小时 |
| 第四阶段 | 页面配置 | 6-8 小时 |
| 第五阶段 | 动态数据对接 | 8-10 小时 |
| 第六阶段 | UI/UX 优化 | 4-6 小时 |
| 第七阶段 | 测试部署 | 4-6 小时 |

**总计**: 约 35-50 小时
