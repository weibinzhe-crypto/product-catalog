# 产品价目展示网站

基于 **飞书多维表格 + Vercel + 独立域名** 的产品价目展示网站。

## 功能特性

- 飞书多维表格作为数据源，改价格直接在飞书里改
- 响应式设计，支持手机/电脑浏览
- 品牌筛选
- 产品搜索
- 自动从飞书同步最新数据

## 部署步骤

### 1. 推送到 GitHub

```bash
cd product-catalog
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/product-catalog.git
git push -u origin main
```

### 2. 部署到 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "Import Project"
4. 选择 `product-catalog` 仓库
5. **重要**：添加环境变量
   - `FEISHU_APP_ID` = `cli_aae9bfef7d3a1d12`
   - `FEISHU_APP_SECRET` = `99ypIswmLWb7DHMR5sSqEfVc5GkSHrWz`
6. 点击 "Deploy"

### 3. 绑定自定义域名 lsv.app

1. 在 Vercel 项目设置中点击 "Domains"
2. 输入 `lsv.app`
3. 按照提示在 GoDaddy 添加 DNS 记录：

```
类型    主机记录    记录值
CNAME   @         cname.vercel-dns.com
CNAME   www       cname.vercel-dns.com
```

4. 等待 DNS 生效（通常几分钟到几小时）

## 更新价格

**直接在飞书多维表格里改价格即可！**

网站会自动读取飞书的最新数据，不需要修改任何代码。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 从飞书获取最新数据
npm run fetch-data
```

## 文件结构

```
product-catalog/
├── index.html              # 主页面
├── styles.css              # 样式文件
├── app.js                  # 前端逻辑
├── api/
│   └── feishu.js           # 飞书 API 接口
├── data/
│   └── products.json       # 产品数据缓存
├── fetch_feishu_data.py    # 数据同步脚本
├── package.json            # 项目配置
├── vercel.json             # Vercel 配置
└── README.md               # 说明文档
```

## 飞书配置

- App ID: `cli_aae9bfef7d3a1d12`
- App Secret: 已配置在环境变量中
- 多维表格: 已配置在 API 中

## 常见问题

### Q: 改了价格但网站没更新？
A: 飞书 API 有缓存，通常 5 分钟内更新。如果急需更新，可以重启 Vercel 服务。

### Q: 图片不显示？
A: 飞书多维表格的图片需要单独处理，目前暂不支持图片显示。

### Q: 如何添加新产品？
A: 直接在飞书多维表格中添加新行即可。
